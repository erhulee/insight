### 项目适合的 Agent 类型（结论）
- **Survey Co‑Pilot Agent（智能问卷协作体）**：一体化的“设计—校对—发布—分析”协作 Agent，覆盖问卷从0到1与迭代优化的完整闭环。
  - **Designer**：根据目标自动生成问卷（含题型、逻辑、分页、配色）。
  - **Reviewer**：可读性、偏见、长度与跳题逻辑体检与修复建议。
  - **Translator**：多语种同步（i18n）与语气风格调整。
  - **Analyst**：响应数据自动洞察、可视化摘要与后续行动建议。

你的项目已有完善的问卷 DSL、编辑器、模板、TRPC、AI 服务抽象与渲染体系，非常契合上述 Agent 的可编排与可落地实现。

---

## 产品 PRD（Product Requirements Document）

### 1. 产品愿景
- **用 AI 将问卷设计/优化门槛降到最低**，以更短时间获得更高质量的数据与洞察。

### 2. 目标用户
- **产品与增长团队**：快速验证需求与信息架构
- **市场/运营团队**：活动反馈、品牌调研
- **研究者/咨询顾问**：专业问卷、严谨逻辑与多语支持
- **中小企业主**：无需研究方法论背景即可上手

### 3. 核心使用场景（User Stories）
- 作为运营，我输入调研目标，Agent 自动生成结构化问卷草案并可一键微调与发布
- 作为研究者，我让 Agent 评审现有问卷的偏见/长度/逻辑问题并给出修复
- 作为 PM，我让 Agent 自动生成 A/B 版本并推荐最优方案
- 作为海外团队，我让 Agent 一键多语翻译并保持术语一致性
- 作为分析师，我希望提交量增长后自动出**可视化摘要**和**结论建议**

### 4. 功能范围
- **MVP**
  - **自然语言 → 问卷 DSL 生成**（题型选择、必填/选项生成、分页与主题）
  - **智能校对**（长度控制、偏见检测、可读性评分、跳题逻辑检查）
  - **编辑器侧边栏 AI 助手**（上下文感知：当前题目/页/全局）
  - **一键多语**（保持变量与逻辑一致，支持 RTL）
  - **AI 文案辅助**（标题/描述/选项优化、风格重写）
  - **自动预览与移动端优化建议**
  - **发布前体检报告**
- **V1+**
  - **A/B 问卷与配额/抽样建议**
  - **自动质量控制**（直答/一致性/异常耗时检测）
  - **响应数据洞察与自动可视化**
  - **模板库沉淀与相似需求推荐**
  - **版本对比与回滚**
  - **协同与审批流**

### 5. 非功能需求
- **可用性**：P95 交互 < 200ms（本地缓存与渐进式流式响应）
- **可靠性**：AI 失败可回退人工编辑；自动保存草稿与版本
- **成本**：令牌预算、模型自动降级策略、缓存命中率监控
- **隐私合规**：提示敏感信息，默认不上传响应敏感字段至 LLM

### 6. 成功指标（Metrics）
- **TTV（从目标到可发布）**：≤ 5 分钟
- **问卷完成率提升**：+15%
- **人工修改率下降**：-30%
- **多语覆盖率**：≥ 3 种语言
- **AI 调用失败率**：< 1%

### 7. 风险与对策
- **模型幻觉**：严格 DSL 校验 + Zod Schema + 受控函数调用
- **成本不可控**：短提示 + 模型分级 + 结果缓存 + 增量变更
- **逻辑错误**：编译期/运行期双重校验 + 可视化逻辑图
- **隐私/合规**：字段脱敏 + 可选本地/私有模型（Ollama）

### 8. 里程碑（Roadmap）
- M0：侧边栏 AI（生成/改写/翻译）+ 逻辑体检 + 发布前报告
- M1：响应数据洞察 + A/B 版本 + 质量控制
- M2：模板推荐 + 协同与审批 + 企业级治理（审计/权限）

---

## 技术架构说明

### 总体架构图
```mermaid
graph TD
  U[User] --> UI[Next.js Editor UI]
  UI --> TRPC[app/api/trpc]
  TRPC --> SVC[server/services/*]
  SVC --> DSL[lib/dsl/*]
  SVC --> DB[(Prisma/DB)]
  SVC --> CACHE[Redis]
  SVC --> AIM[lib/ai-service-manager.ts]
  AIM --> OAI[OpenAI/Anthropic/Ollama]
  UI --> RENDER[packages/render-react]
  UI --> PUB[app/(public)/survey/*]
  DB --> INSIGHT[server/router/survey.ts - analytics]
```

### 关键技术栈与现状映射
- **UI/编辑器**：`app/edit/*`, `components/survey-editor/*`, `packages/render-react`
- **服务编排**：`server/services/*`（按领域拆分，职责单一）
- **API 层**：`server/trpc.ts` + `app/api/trpc`（React Query 集成）
- **问卷 DSL**：`lib/dsl/*`（题型、评分、日期、基础等）
- **AI 抽象**：`lib/ai-service-manager.ts` + `lib/ai-services/*`（多模型路由）
- **鉴权**：`auth/*`, `middleware.ts`
- **数据**：`prisma/schema.prisma`（问卷/题目/逻辑/响应）
- **缓存/会话**：`lib/redis.ts`, `lib/session.ts`
- **渲染与发布**：`app/(public)/survey/*`, `[id]/page.tsx`

### 逻辑分层与职责
- **Presentation（App Router + RSC）**
  - 编辑器页面：`app/edit/[id]/page.tsx`
  - 侧边栏 Agent 面板：`app/edit/ui/*`（上下文感知）
- **API（TRPC）**
  - `surveyRouter`：CRUD、版本、发布、校验
  - `aiRouter`：生成/改写/翻译/校对（流式）
- **Domain Services（server/services）**
  - `survey-service.ts`：DSL 与版本管理
  - `logic-service.ts`：跳题与约束校验
  - `ai-service.ts`：提示工程、模型选择、成本控制
  - `insight-service.ts`：指标计算、图表与摘要
- **Infra**
  - Prisma（Postgres/MySQL 均可）
  - Redis（会话、缓存、幂等）
  - 存储（对象存储：导出、截图）

### 关键数据流（以“自然语言生成问卷”为例）
1. UI 调用 `trpc.ai.generateSurveyFromGoal({ goal, audience, tone })`
2. `ai-service` 组装上下文（模板 + 领域知识 + DSL 规范）
3. 调用 `ai-service-manager` 路由到模型（OpenAI/Anthropic/Ollama）
4. 模型输出经 Zod/DSL Schema 严格校验 → 失败回退重试/降级
5. `survey-service` 落库新版本 + 事件日志
6. 前端流式接收草案 → Editor 增量渲染与局部高亮

### 主要数据模型（示意）
- **Survey**：id, name, locale, theme, version, status
- **Page**：id, surveyId, order, title, description
- **Question**：id, pageId, type, title, options, required, validations
- **LogicRule**：id, surveyId, conditionDSL, actionDSL
- **Response**：id, surveyId, answersJSON, duration, meta
- **Version**：id, surveyId, diff, createdBy, createdAt

### TRPC 主要契约（建议）
- `survey.list/create/get/update/publish/clone/createVersion/restoreVersion/validate`
- `ai.generateSurveyFromGoal`
- `ai.rewriteQuestion/ai.rewriteSurveyText`
- `ai.translate({ targetLocales })`
- `ai.reviewSurvey({ dimensions: ['bias','length','logic'] })`
- `insight.summary({ surveyId })`
- `insight.qualityReport({ surveyId })`

### AI 设计要点
- **函数调用/工具使用（Toolformer）**：将“新增题目/改写/添加逻辑/翻译”限定为受控函数，输出直接变更 DSL
- **上下文构造**：模板库、历史版本、品牌术语表、受众画像
- **流式输出**：SSE 到 Editor，允许中途中断与回滚
- **成本控制**：短提示、多轮缓存、相似度命中、自动降级模型
- **安全与合规**：敏感字段脱敏、禁止上传响应数据正文

### 前端集成（编辑器侧边栏）
- **状态管理**：React Query + TRPC，局部状态用 `useReducer`
- **UI/交互**：Shadcn + Radix，移动端预览 `components/mobile/*`
- **可访问性**：键盘可达、ARIA、对比度校验
- **国际化**：`next-i18next`，术语表贯通翻译 Agent

### 可观测性与治理
- **日志与追踪**：请求/令牌/成本/失败率（结构化日志）
- **SLO**：Agent 首字节 < 1s，完成 < 5s（P95）
- **审计**：模型调用记录、版本变更、审批流（企业版）

### 部署与扩展
- **部署**：Next.js + Node（Docker Compose/K8s），DB/Redis 托管
- **模型**：公有云（OpenAI/Anthropic）+ 私有（Ollama）
- **扩展点**：新题型、新逻辑算子、新语言、企业知识库（RAG）

---

## 交付清单（落地最小实现）
- **侧边栏 Agent 面板**（生成/重写/翻译/校对）接入 TRPC
- **DSL 级别的受控函数**（增删改题、逻辑、分页、主题）
- **Zod 校验 + 版本化落库**（失败自动回退）
- **发布前体检报告**（长度/偏见/逻辑清单）
- **流式渲染与局部高亮**（用户信任与可解释性）

以上 PRD 与架构可直接贴合现有目录与组件，先在 `server/services` 内实现最小原子服务，通过 `app/api/trpc` 暴露，前端在 `app/edit/ui` 添加 Agent 侧边栏与交互入口，即可快速验证价值。