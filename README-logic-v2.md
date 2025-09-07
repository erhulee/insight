### 可视化渲染逻辑系统（Logic Builder）代码架构说明

> 本文基于 `README-logic.md` 的 PRD，落地为面向实现的代码级架构说明。涵盖目录结构、核心类型、运行时求值、编辑端模块划分、持久化与校验、性能与测试、迁移与非功能要求等。

---

### 目标与范围

- 目标：在问卷编辑器中提供“如果…则…”的所见即所得逻辑配置，驱动题目显示/隐藏与跳转，并在运行时无闪烁地联动渲染。
- 范围：
  - 编辑端逻辑配置 UI
  - 运行时增量求值引擎
  - 渲染联动与答案清理
  - 数据持久化与校验
  - 预览与验证

---

### 目录结构

```
app/
  (dashboard)/...
  edit/
    ui/
      question-config/
        basic.tsx
        input.tsx
        single.tsx
        index.tsx            # 集成入口（包含逻辑配置入口按钮/面板）
    _component/...
    core/
      dsl/
        display-logic.ts     # DSL 类型、Zod schema、合并/迁移工具
      runtime/
        visibility-engine.ts # 运行时引擎：依赖图、增量求值、选择器
        evaluators.ts        # 按题型/运算符的条件求值函数
      store/
        runtime-state.ts     # RxJS runtimeState$、选择器、操作器
components/
  survey-editor/
    display-logic/
      DisplayLogicConfigurator.tsx # 逻辑配置 UI（规则卡片/条件行/模板）
    buildin/
      form-item/...               # 题型的值选择器（与运算符组件复用）
lib/
  custom-display-logic.ts         # 旧逻辑兼容/工具（如已存在）
server/
  services/
    display-logic.service.ts      # 单一职责：CRUD DisplayLogicConfig
  router/
    survey.ts                      # tRPC 路由，调用 service
  trpc.ts
```

- 原则：
  - service 层原子化（避免循环依赖），仅封装业务读写与校验。
  - tRPC 作为调用边界，页面/组件仅通过 tRPC 调 service。
  - 运行时引擎与编辑端 UI 解耦：引擎不依赖 React。

---

### DSL 模型（v1）

```ts
export type LogicOperator = 'AND' | 'OR'

export type LogicAction = 'show' | 'hide' | 'jumpTo'

export type ConditionOp =
	| 'equals'
	| 'notEquals'
	| 'contains'
	| 'notContains'
	| 'in'
	| 'notIn'
	| 'isEmpty'
	| 'isNotEmpty'
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte'

export interface LogicCondition {
	questionId: string
	op: ConditionOp
	value?: unknown
}

export interface LogicRule {
	id: string
	targetQuestionId: string
	action: LogicAction
	operator: LogicOperator
	conditions: LogicCondition[]
	// action === 'jumpTo' 时需要
	jumpTargetId?: string
}

export interface DisplayLogicConfig {
	enabled: boolean
	version: 1
	rules: LogicRule[]
}
```

- Zod 校验（关键片段）：

```ts
import { z } from 'zod'

export const zCondition = z.object({
	questionId: z.string().min(1),
	op: z.enum([
		'equals',
		'notEquals',
		'contains',
		'notContains',
		'in',
		'notIn',
		'isEmpty',
		'isNotEmpty',
		'gt',
		'gte',
		'lt',
		'lte',
	]),
	value: z.unknown().optional(),
})

export const zRule = z
	.object({
		id: z.string().min(1),
		targetQuestionId: z.string().min(1),
		action: z.enum(['show', 'hide', 'jumpTo']),
		operator: z.enum(['AND', 'OR']),
		conditions: z.array(zCondition),
		jumpTargetId: z.string().min(1).optional(),
	})
	.refine((r) => r.action !== 'jumpTo' || !!r.jumpTargetId, {
		message: 'jumpTo 需要 jumpTargetId',
	})

export const zDisplayLogicConfig = z.object({
	enabled: z.boolean(),
	version: z.literal(1),
	rules: z.array(zRule),
})
```

- 规则约束：
  - 目标题与条件引用题不可相同
  - `jumpTo` 必须提供 `jumpTargetId`
  - 被引用题删除时，条件应标记为失效并提示

---

### 运行时引擎

- 输入：
  - 问卷问题集合 `questions: Question[]`
  - 答案字典 `answers: Record<questionId, AnswerValue>`
  - 逻辑配置 `displayLogic: DisplayLogicConfig`
- 输出：

  - `visibleMap: Record<questionId, boolean>`（可见性字典）

- 依赖图：

  - 从条件 `questionId` 指向 `rule.targetQuestionId`
  - 用于变更传播与拓扑更新，避免全量重算

- 求值合并策略：

  - 多条规则作用于同一目标题：
    - show：累积与（目标题初始为 true）；hide：命中则强制 false
    - hide 优先级高于 show（若命中 hide，则可见为 false）
  - 跳转 `jumpTo` 在 P1 实现，单独处理页面/题级导航

- 求值（全量的基础形式）：

```ts
export function evaluateAll(
	answers: Record<string, unknown>,
	config: DisplayLogicConfig,
	questions: { id: string }[],
) {
	const visible = new Map(questions.map((q) => [q.id, true]))

	for (const rule of config.rules) {
		const ok = evalRule(rule, answers)
		if (rule.action === 'show') {
			visible.set(
				rule.targetQuestionId,
				Boolean(visible.get(rule.targetQuestionId)) && ok,
			)
		}
		if (rule.action === 'hide' && ok) {
			visible.set(rule.targetQuestionId, false)
		}
	}
	return visible
}
```

- 增量策略（推荐实现）：

  - 缓存依赖图 `deps: Map<sourceId, Set<targetId>>`
  - 当 `answers[changedId]` 变化时，仅对从 `changedId` 可达的 `targetId` 重新计算
  - 按拓扑顺序更新，避免重复与环路影响
  - 自依赖/环路：检测并短路，回退为保守策略（例如默认可见）

- 条件求值器（按题型/运算符解耦）：

```ts
export function evalCondition(
	c: LogicCondition,
	answers: Record<string, unknown>,
): boolean {
	const actual = answers[c.questionId]
	switch (c.op) {
		case 'equals':
			return actual === c.value
		case 'notEquals':
			return actual !== c.value
		case 'contains':
			return Array.isArray(actual) && actual.includes(c.value)
		case 'notContains':
			return Array.isArray(actual) && !actual.includes(c.value)
		case 'in':
			return Array.isArray(c.value) && c.value.includes(actual)
		case 'notIn':
			return Array.isArray(c.value) && !c.value.includes(actual)
		case 'isEmpty':
			return (
				actual == null ||
				(Array.isArray(actual) && actual.length === 0) ||
				actual === ''
			)
		case 'isNotEmpty':
			return !(
				actual == null ||
				(Array.isArray(actual) && actual.length === 0) ||
				actual === ''
			)
		case 'gt':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual > c.value
			)
		case 'gte':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual >= c.value
			)
		case 'lt':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual < c.value
			)
		case 'lte':
			return (
				typeof actual === 'number' &&
				typeof c.value === 'number' &&
				actual <= c.value
			)
		default:
			return false
	}
}

export function evalRule(
	rule: LogicRule,
	answers: Record<string, unknown>,
): boolean {
	const results = rule.conditions.map((c) => evalCondition(c, answers))
	return rule.operator === 'AND'
		? results.every(Boolean)
		: results.some(Boolean)
}
```

- 状态时机与副作用：
  - 初始化、答案变化、规则变更、切页 → 触发评估
  - 当题目变不可见：清空答案并标记隐藏，避免提交隐形值

---

### 状态管理与选择器

- 来源：`runtimeState$`（RxJS）

  - 组成：`answers$`、`displayLogic$`、`questions$`、`visibleMap$`
  - 更新入口：
    - `RuntimeDSLAction.updateDisplayLogic(config)`
    - `RuntimeDSLAction.patchQuestion(patch)`（根字段浅合并、`props` 深合并；传 `undefined` 表示删除）
    - `RuntimeAnswerAction.updateAnswer(questionId, value)`

- 选择器（示例）：

```ts
export const selectVisibleMap = (s: RuntimeState) => s.visibleMap
export const selectIsVisible = (id: string) => (s: RuntimeState) =>
	Boolean(s.visibleMap[id] ?? true)
export const selectAnswer = (id: string) => (s: RuntimeState) => s.answers[id]
```

- 渲染端使用：
  - 组件根据 `selectIsVisible(id)` 控制是否渲染
  - 当隐藏 → 调用 `RuntimeAnswerAction.clearAnswer(id)`

---

### 编辑端 UI 模块

- `DisplayLogicConfigurator.tsx`

  - 顶部：启用开关、添加规则、模板入口、目标题筛选
  - 规则卡片：动作、目标题、条件列表、AND/OR、删除
  - 条件行：题目选择器 → 运算符选择器 → 值选择器（题型驱动）
  - 校验与错误提示（Zod + 即时校验）

- 值选择器复用策略

  - 依赖已有题型组件（如 `buildin/form-item/*`）渲染 `value` 编辑器
  - 运算符白名单按题型收敛（避免无效组合）

- 模板库
  - 例如“选中‘其他’ → 显示补充说明”
  - 应用模板后生成对应 `rules` 草稿，用户可进一步编辑

---

### 持久化与服务

- 服务职责：`server/services/display-logic.service.ts`

  - `getDisplayLogic(formId): Promise<DisplayLogicConfig>`
  - `saveDisplayLogic(formId, config: DisplayLogicConfig): Promise<void>`
  - 读写前后进行 `zDisplayLogicConfig` 校验
  - 兼容旧结构（若存在），提供一次性迁移

- tRPC 路由：`server/router/survey.ts`

  - `displayLogic.get` / `displayLogic.update`
  - 中间件：鉴权、所有权检查、审计日志（可选）

- 客户端调用：
  - 编辑端：进入编辑页时拉取；保存时提交
  - 运行时：渲染页拉取最新配置并注入引擎

---

### 校验与保护

- 配置校验：

  - Zod 基础校验
  - 业务校验：
    - 目标题与条件引用题不能相同
    - 条件引用题被删除时 → 条件标记为失效并在 UI 提示
    - `jumpTo` 的 `jumpTargetId` 合法性检查（P1）

- 环路检测：
  - 构建依赖图后运行 DFS 检测环
  - 检测到环：日志告警，回退为保守可见策略，并在编辑端提示

---

### 性能策略

- 目标：
  - 渲染联动 ≤ 16ms（典型操作）
  - 规则初始化 ≤ 50ms（<200 题）
- 手段：
  - 依赖图驱动的增量求值，避免全量扫描
  - 缓存条件求值中与题型无关的静态结构（如 `in/notIn` 的集合）
  - 批处理 UI 更新（以帧为单位合并通知）
  - 组件使用 `React.memo` 与稳定的选择器避免重渲染

---

### 错误处理与日志

- 编辑端：
  - Zod 报错转用户可读提示
  - 逻辑失效（题被删/环）展示明确标记
- 运行时：
  - 求值异常捕获、降级为默认可见
  - 关键错误上报（如 Sentry）
- 服务器：
  - 读写失败/校验失败 → 400/422 语义错误
  - 审计日志（可选）

---

### 测试策略

- 单元测试：
  - 评估器：各运算符/题型的边界值（空/Null/数组/数字比较等）
  - 规则合并策略：多 show/hide 组合
  - 依赖图与增量更新：从变更题仅更新关联目标题
  - 环路检测：检测与降级行为
- 集成测试：
  - 编辑端：添加/删除规则、条件变更、模板应用、即时校验
  - 运行时：答案变化 → 可见性联动、隐藏清空答案
  - 持久化：拉取/保存/迁移一致性
- 目标覆盖率 ≥ 80%

---

### 迁移与版本

- 当前版本：`version: 1`
- 迁移策略：
  - 存在旧结构时，提供一次性迁移函数：
    - 字段映射、默认值填充、非法值修正
  - 兼容读写：入库前后均通过 Zod 校验

---

### i18n / a11y / 安全

- i18n：
  - 所有文案经 `next-i18next` 管理
  - 日期/数字本地化
- a11y：
  - 键盘可达、焦点管理、ARIA 属性
  - 错误提示可被读屏识别
- 安全：
  - 表单输入清洗，HTML 渲染使用 DOMPurify（如有）
  - 服务端鉴权与权限检查

---

### 与现有架构的集成要点

- 数据读取：`useRuntimeState(s => s.displayLogic)`
- 数据更新：`RuntimeDSLAction.updateDisplayLogic(config)`
- 题目配置统一入口：
  - `RuntimeDSLAction.patchQuestion(patch)`
  - 根字段浅合并，`props` 深合并
  - 传 `undefined` 删除字段
- Next.js App Router & 默认 Server Components：
  - 逻辑配置器是交互组件，使用 `use client`
  - 持久化请求通过 tRPC api route

---

### 关键接口清单（摘要）

```ts
// 引擎
buildDependencyGraph(rules: LogicRule[]): Map<string, Set<string>>
evaluateAll(answers, config, questions): Map<string, boolean>
evaluateIncremental(changedQuestionId, prevVisible, answers, config, graph): Map<string, boolean>

// 状态
RuntimeDSLAction.updateDisplayLogic(config: DisplayLogicConfig): void
RuntimeDSLAction.patchQuestion(patch: Partial<Question>): void
RuntimeAnswerAction.updateAnswer(id: string, value: unknown): void
RuntimeAnswerAction.clearAnswer(id: string): void

// 服务
displayLogicService.getDisplayLogic(formId: string): Promise<DisplayLogicConfig>
displayLogicService.saveDisplayLogic(formId: string, cfg: DisplayLogicConfig): Promise<void>
displayLogicService.migrateIfNeeded(raw: unknown): DisplayLogicConfig
```

---

### 开发阶段与里程碑

- P0（当前）：
  - show/hide、AND/OR、常用运算符、模板、预览
  - 增量求值、隐藏清空答案、基础校验
- P1：
  - `jumpTo`、跨页依赖、环检测可视化
- P2：
  - 撤销/重做、优先级策略、自定义函数白名单

---

- 以上架构在不侵入现有编辑器题型体系的前提下，实现逻辑可视化配置与高性能运行时联动，并通过 service/tRPC 与状态流整洁连接，满足性能、可测试性与可维护性要求。
