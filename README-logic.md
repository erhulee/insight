## 可视化渲染逻辑系统（Logic Builder）PRD

### 目标

- 为问卷编辑器提供“如果…则…”的所见即所得逻辑配置，驱动题目显示/隐藏与跳转。
- 统一“题目配置”为单一入口，渲染时按题型拆分 `props` 使用。

### 术语

- **规则（Rule）**: 条件集 + 动作
- **条件（Condition）**: 对某题答案的判断
- **目标题（Target Question）**: 规则作用对象
- **动作（Action）**: `show | hide | jumpTo`
- **关系（Operator）**: `AND | OR`

### 用户故事

- 作为编辑者，我能基于“题A的答案”控制“题B显示/隐藏/跳转”。
- 我能为同一目标题配置多条规则，并设置条件关系。
- 我能应用模板（如“选择其他 → 显示补充说明”）。
- 作为答题者，作答时界面即时联动、无闪烁。

### 范围

- 编辑端逻辑配置、运行时求值、渲染联动、数据持久化与校验、预览验证。
- 暂不含复杂脚本语言、跨问卷联动。

### DSL（v1）

```json
{
	"enabled": true,
	"version": 1,
	"rules": [
		{
			"id": "r1",
			"targetQuestionId": "Q5",
			"action": "show",
			"operator": "AND",
			"conditions": [
				{ "questionId": "Q3", "op": "equals", "value": "male" },
				{ "questionId": "Q4", "op": "in", "value": ["beijing", "shanghai"] }
			]
		}
	]
}
```

- 条件运算符（按题型收敛）：`equals | notEquals | contains | notContains | in | notIn | isEmpty | isNotEmpty | gt | gte | lt | lte`
- `jumpTo` 需扩展 `jumpTargetId`

### 核心功能需求

- 规则编辑
  - 新增/删除规则；设置目标题、动作、AND/OR
  - 条件编辑：题目选择器 → 运算符 → 值选择器（按题型渲染）
  - 模板库：常用模式一键应用
- 运行时求值
  - 基于依赖图增量求值；仅重算受影响目标题
  - 隐藏题目时清空答案并标记隐藏
  - 自依赖/环路检测与保护
- 数据持久化
  - 存储于 `displayLogic: DisplayLogicConfig`，支持 `enabled` 与 `version`
- 预览与回放
  - 预览面板；可注入模拟答案
- 校验
  - 目标题与条件不能是同一题
  - 条件引用题被删除时标记失效并提示

### 运行时引擎（前端）

- 状态来源：RxJS `runtimeState$`
- 可见性字典：`visibleMap: Record<questionId, boolean>`
- 时机：初始化 / 答案变化 / 规则变更 / 切页
- 增量策略：从变更题出发，沿依赖边更新目标集合（拓扑顺序）

伪代码

```ts
function evaluateAll(answers, rules, questions) {
	const visible = new Map(questions.map((q) => [q.id, true]))
	for (const rule of rules) {
		const ok = evalRule(rule, answers) // 条件按 AND/OR 组合
		if (rule.action === 'show')
			visible.set(
				rule.targetQuestionId,
				visible.get(rule.targetQuestionId) && ok,
			)
		if (rule.action === 'hide' && ok) visible.set(rule.targetQuestionId, false)
	}
	return visible
}
```

### UI/交互（编辑端）

- 顶部：启用开关、添加规则、模板入口、目标题筛选
- 规则卡片：动作、目标题、条件列表、AND/OR、删除
- 条件行：题目选择器 → 运算符 → 值选择器（按题型渲染）
- 可用性：键盘可达、即时校验、错误提示

### 与现有架构的集成

- 读取：`useRuntimeState(s => s.displayLogic)`
- 更新：`RuntimeDSLAction.updateDisplayLogic(config)`
- 题目配置：统一使用 `RuntimeDSLAction.patchQuestion(patch)` 更新（根字段浅合并、`props` 深合并；可选字段传 `undefined` 删除）

### 非功能要求

- 性能：渲染联动 ≤ 16ms；规则初始化 ≤ 50ms（<200题）
- i18n：文案、日期/数字本地化
- 无障碍：aria、焦点管理
- 安全：zod 校验、输入清洗

### 版本与迁移

- 以当前 `displayLogic` 作为 v1；若旧结构存在，提供一次性迁移函数
- 保持接口向后兼容

### 分阶段计划

- P0：显示/隐藏、AND/OR、常用运算符、模板、预览
- P1：`jumpTo`、跨页依赖、环检测可视化
- P2：撤销/重做、优先级策略、自定义函数（白名单）

### 验收标准（摘选）

- 条件切换时目标题即时显示/隐藏正确
- 多条规则合并行为与文档一致（明确 show/hide 合并策略）
- 隐藏题不提交；删除被引用题时规则标记失效
- 导入/导出后逻辑保持一致
