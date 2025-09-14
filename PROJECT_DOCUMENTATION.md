# 问卷平台项目完整文档

## 📋 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [核心功能模块](#核心功能模块)
4. [AI功能实现](#ai功能实现)
5. [认证系统](#认证系统)
6. [表单编辑器架构](#表单编辑器架构)
7. [移动端支持](#移动端支持)
8. [开放平台设计](#开放平台设计)
9. [开发指南](#开发指南)
10. [部署与运维](#部署与运维)

---

## 项目概述

### 🎯 项目愿景

用 AI 将问卷设计/优化门槛降到最低，以更短时间获得更高质量的数据与洞察。

### 🎯 目标用户

- **产品与增长团队**：快速验证需求与信息架构
- **市场/运营团队**：活动反馈、品牌调研
- **研究者/咨询顾问**：专业问卷、严谨逻辑与多语支持
- **中小企业主**：无需研究方法论背景即可上手

### 🎯 核心使用场景

- 作为运营，我输入调研目标，Agent 自动生成结构化问卷草案并可一键微调与发布
- 作为研究者，我让 Agent 评审现有问卷的偏见/长度/逻辑问题并给出修复
- 作为 PM，我让 Agent 自动生成 A/B 版本并推荐最优方案
- 作为海外团队，我让 Agent 一键多语翻译并保持术语一致性
- 作为分析师，我希望提交量增长后自动出**可视化摘要**和**结论建议**

### 🎯 成功指标

- **TTV（从目标到可发布）**：≤ 5 分钟
- **问卷完成率提升**：+15%
- **人工修改率下降**：-30%
- **多语覆盖率**：≥ 3 种语言
- **AI 调用失败率**：< 1%

---

## 技术架构

### 🏗️ 总体架构图

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

### 🔧 关键技术栈

- **前端框架**: React 19 + TypeScript + Next.js 15 (App Router)
- **状态管理**: Valtio (响应式状态管理)
- **UI组件库**: Shadcn UI + Radix UI
- **拖拽功能**: 自定义拖拽系统
- **数据获取**: tRPC + React Query
- **样式系统**: Tailwind CSS
- **后端服务**: Node.js + tRPC
- **数据库**: Prisma + PostgreSQL
- **缓存**: Redis
- **AI服务**: OpenAI/Anthropic/Ollama

### 📁 目录结构

```
survey-platform/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # 认证相关页面
│   ├── (dashboard)/                  # 仪表板页面
│   ├── (mobile)/                     # 移动端页面
│   ├── (public)/                     # 公开页面
│   ├── api/                          # API路由
│   └── edit/                         # 编辑器页面
├── components/                       # React组件
│   ├── auth/                         # 认证组件
│   ├── dashboard/                    # 仪表板组件
│   ├── mobile/                       # 移动端组件
│   ├── survey/                       # 问卷组件
│   ├── survey-editor/                # 编辑器组件
│   └── ui/                           # UI基础组件
├── lib/                              # 工具库
│   ├── ai-services/                  # AI服务
│   ├── auth/                         # 认证工具
│   ├── dsl/                          # DSL定义
│   └── utils/                        # 工具函数
├── server/                           # 后端服务
│   ├── services/                     # 业务服务层
│   ├── router/                       # tRPC路由
│   └── schemas/                      # 数据模式
├── prisma/                           # 数据库模式
└── types/                            # TypeScript类型
```

### 🔄 逻辑分层与职责

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

---

## 核心功能模块

### 📝 问卷编辑器

#### 功能特性

- **拖拽式设计**: 支持组件拖拽添加和排序
- **实时预览**: 所见即所得的设计体验
- **多页面管理**: 支持问卷分页和页面配置
- **响应式布局**: 适配不同设备屏幕
- **组件库**: 丰富的表单组件类型

#### 支持的题目类型

- **文本类**: text, textarea, email, phone, url
- **选择类**: radio, checkbox, select, rating
- **数值类**: number, date, time
- **文件类**: file, image
- **特殊类**: signature, location

#### 评分题目实现

```typescript
export const RatingQuestionSchema = QuestionSchema.extend({
	type: z.enum(['rating']),
	props: z
		.object({
			maxRating: z.number().optional().default(5),
			ratingType: z
				.enum(['star', 'number', 'heart'])
				.optional()
				.default('star'),
			minLabel: z.string().optional().default('非常不认同'),
			maxLabel: z.string().optional().default('非常认同'),
			showLabels: z.boolean().optional().default(true),
			description: z.string().optional(),
		})
		.optional(),
})
```

### 🎨 自定义展示逻辑系统

#### 功能特性

- **条件显示**: 根据用户答案显示特定问题
- **条件隐藏**: 根据用户答案隐藏特定问题
- **复杂逻辑**: 支持AND/OR逻辑组合
- **实时预览**: 配置后立即看到效果
- **调试模式**: 查看逻辑执行状态

#### 支持的操作符

- `equals` - 等于
- `not_equals` - 不等于
- `contains` - 包含
- `not_contains` - 不包含
- `greater_than` - 大于
- `less_than` - 小于
- `is_empty` - 为空
- `is_not_empty` - 不为空

#### DSL配置示例

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

### 📊 数据分析与洞察

- **实时统计**: 答题进度和完成率
- **数据可视化**: 图表和趋势分析
- **导出功能**: 支持多种格式导出
- **质量报告**: 自动生成问卷质量分析

---

## AI功能实现

### 🤖 AI问卷生成

#### 功能概述

AI问卷生成功能允许用户通过自然语言描述来快速创建专业的问卷。用户只需描述想要的问卷类型和内容，AI就会自动生成相应的问卷结构和问题。

#### 智能识别问卷类型

- **客户满意度调查**: 识别关键词如"客户满意度"、"满意度"等
- **员工工作环境调查**: 识别关键词如"员工"、"工作环境"等
- **市场调研问卷**: 识别关键词如"市场调研"、"产品需求"等
- **活动反馈问卷**: 识别关键词如"活动反馈"、"活动评价"等
- **通用问卷**: 其他类型的问卷会生成通用模板

#### 自动生成问题类型

- **单选题**: 用于满意度评价、选择偏好等
- **多选题**: 用于多选特性、多选建议等
- **文本输入**: 用于收集详细建议和反馈
- **文本域**: 用于长文本输入
- **评分题**: 支持星级、数字、爱心三种评分方式

### 🔧 AI选项格式优化

#### 优化内容

更新了 `buildSurveyPrompt` 函数，明确指定选项格式要求：

```typescript
// 选项格式要求：
- label: 选项显示文本
- value: 选项值（英文或数字）
- id: 唯一标识符（英文或数字）

// 问题类型说明：
- "single": 单选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "multiple": 多选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "textarea": 文本域 - 不需要options
- "input": 文本输入 - 不需要options
```

#### 优化后的选项格式

```json
{
	"props": {
		"options": [
			{
				"label": "非常满意",
				"value": "very_satisfied",
				"id": "opt_very_satisfied"
			},
			{
				"label": "满意",
				"value": "satisfied",
				"id": "opt_satisfied"
			}
		]
	}
}
```

### 🌊 SSE流式生成

#### 功能特性

- **实时流式输出**: 用户可以看到AI逐字生成内容
- **取消功能**: 支持中途取消生成过程
- **进度反馈**: 实时显示生成状态
- **视觉反馈**: 流式内容实时显示在界面上
- **错误处理**: 完善的错误处理和用户提示

#### 技术实现

```typescript
// SSE API端点
export async function POST(request: NextRequest) {
	const stream = new ReadableStream({
		async start(controller) {
			await ollamaClient.generateStream(prompt, model, (chunk) => {
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
			})
		},
	})
}
```

### 🦙 Ollama集成

#### 安装步骤

1. **安装Ollama**

   ```bash
   # macOS
   brew install ollama

   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **启动服务**

   ```bash
   ollama serve
   ```

3. **下载模型**

   ```bash
   # 推荐模型：Qwen2.5 7B（中文支持好，速度快）
   ollama pull qwen2.5:7b
   ```

4. **环境配置**
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen2.5:7b
   ```

#### 使用方法

1. 访问 `http://localhost:3000/dashboard/create`
2. 选择"AI 生成"标签页
3. 输入问卷描述，例如：
   - "创建一个客户满意度调查问卷"
   - "设计一个员工工作环境调查"
   - "制作一个市场调研问卷"
4. 点击"生成问卷"
5. 预览生成的问卷
6. 点击"创建问卷"完成创建

---

## 认证系统

### 🔐 认证架构

#### 概述

本项目实现了一个分层的认证架构，用于区分处理登录态页面和非登录态页面。通过多种方式实现认证保护，确保代码的可维护性和灵活性。

#### 🔄 自动回调跳转功能

系统支持登录/注册后的自动跳转功能：

- **智能跳转**: 用户访问需要认证的页面时，未登录会自动跳转到登录页
- **回调URL**: 登录成功后自动跳转回用户原本要访问的页面
- **安全验证**: 防止开放重定向攻击，只允许同源跳转
- **无缝体验**: 注册成功后自动登录并跳转，无需重复操作

#### 架构组件

1. **认证 Hooks**

   - `useAuth` - 主要认证 Hook
   - `useAuthStatus` - 简化认证状态 Hook

2. **认证布局组件**

   - `AuthLayout` - 强制认证布局
   - `OptionalAuthLayout` - 可选认证布局

3. **高阶组件 (HOC)**

   - `withAuth` - 认证 HOC
   - `withOptionalAuth` - 可选认证 HOC

4. **认证工具函数**
   - `getCallbackUrl` - 获取安全的回调URL
   - `buildCallbackUrl` - 构建带有回调URL的链接
   - `handleAuthSuccess` - 处理认证成功后的跳转

### 🔍 认证验证API

#### API端点

- **POST /api/auth/validate**: 验证token并返回用户信息
- **GET /api/auth/validate**: 健康检查接口

#### 请求格式

```json
{
	"token": "your-jwt-token"
}
```

#### 响应格式

```json
{
	"success": true,
	"user": {
		"userId": "user123",
		"account": "user@example.com",
		"username": "用户名"
	}
}
```

#### 中间件集成

```typescript
export async function middleware(request: NextRequest) {
	const token = extractToken(request)

	if (token) {
		const userPayload = await validateTokenAPI(token, baseUrl)

		if (userPayload) {
			return createAuthenticatedRequest(request, userPayload.userId)
		}
	}

	return NextResponse.next()
}
```

---

## 表单编辑器架构

### 🏗️ 整体架构

#### 架构层次

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│                  业务逻辑层 (Business Layer)                  │
├─────────────────────────────────────────────────────────────┤
│                  状态管理层 (State Layer)                     │
├─────────────────────────────────────────────────────────────┤
│                  数据访问层 (Data Layer)                     │
├─────────────────────────────────────────────────────────────┤
│                  基础设施层 (Infrastructure Layer)            │
└─────────────────────────────────────────────────────────────┘
```

#### 技术栈

- **前端框架**: React 19 + TypeScript
- **状态管理**: Valtio (响应式状态管理)
- **UI组件库**: Shadcn UI + Radix UI
- **拖拽功能**: 自定义拖拽系统
- **数据获取**: tRPC + React Query
- **样式系统**: Tailwind CSS
- **构建工具**: Next.js 15 (App Router)

### 🎯 核心功能模块

#### 1. 表单设计器 (Form Designer)

- 拖拽式组件添加
- 组件属性配置
- 实时预览
- 多页面管理
- 响应式布局

#### 2. 组件库 (Widget Library)

- 基础输入组件
- 高级表单组件
- 布局组件
- 自定义组件扩展

#### 3. 配置面板 (Configuration Panel)

- 组件属性编辑
- 页面设置
- 表单验证规则
- 逻辑跳转配置

#### 4. 预览系统 (Preview System)

- 实时预览
- 移动端预览
- 响应式预览
- 预览数据模拟

### 🔄 状态管理架构

#### 核心状态结构

```typescript
interface RuntimeState {
	// 基础信息
	surveyId: string
	surveyName: string
	surveyDescription?: string

	// 页面管理
	pageCount: number
	currentPage: number
	pages: Page[]

	// 组件管理
	questions: Question[]
	selectedQuestionID: string | null
	currentQuestion: Question[]

	// 编辑器状态
	isEditing: boolean
	isPreviewing: boolean
	activeTab: 'design' | 'json' | 'preview'

	// 拖拽状态
	dragState: DragState

	// 历史记录
	history: HistoryState
}
```

#### 状态管理策略

1. **响应式状态**: 使用 Valtio 实现响应式状态管理
2. **状态分离**: 按功能模块分离状态
3. **状态持久化**: 自动保存到本地存储和服务器
4. **状态回滚**: 支持撤销/重做操作
5. **状态同步**: 多用户协作时的状态同步

### 🎨 拖拽系统架构

#### 拖拽流程

```typescript
interface DragDropSystem {
	// 拖拽开始
	onDragStart: (component: Component, source: DragSource) => void

	// 拖拽中
	onDragOver: (target: DropTarget, position: DropPosition) => void

	// 拖拽结束
	onDrop: (
		component: Component,
		target: DropTarget,
		position: DropPosition,
	) => void

	// 拖拽取消
	onDragCancel: () => void
}
```

### ⚙️ 配置系统架构

#### 配置面板结构

```typescript
interface ConfigPanel {
	// 基础配置
	basic: BasicConfig

	// 验证配置
	validation: ValidationConfig

	// 逻辑配置
	logic: LogicConfig

	// 样式配置
	style: StyleConfig

	// 高级配置
	advanced: AdvancedConfig
}
```

### 🔍 验证系统架构

#### 验证规则结构

```typescript
interface ValidationRule {
	type: ValidationType
	value: any
	message: string
	enabled: boolean

	// 自定义验证函数
	validator?: (value: any, rule: ValidationRule) => boolean | string
}

type ValidationType =
	| 'required'
	| 'minLength'
	| 'maxLength'
	| 'pattern'
	| 'min'
	| 'max'
	| 'email'
	| 'url'
	| 'phone'
	| 'custom'
```

---

## 移动端支持

### 📱 移动端问卷答题系统

#### 概述

这是一个专为移动端设计的问卷答题系统，提供了完整的题目解析能力和优化的移动端用户体验。系统支持多种题目类型，具有响应式设计和触摸友好的交互界面。

#### 功能特性

- **多题目类型支持**: 文本、多行文本、选择、单选、多选、评分、日期、数字、邮箱、手机号、网址等
- **移动端优化**: 专为触摸设备设计的UI组件和交互体验
- **题目解析**: 智能解析和验证不同类型的题目数据
- **表单验证**: 实时验证用户输入，提供友好的错误提示
- **进度跟踪**: 显示答题进度和剩余题目数量

#### 移动端特性

- **触摸友好**: 大按钮、合适的触摸区域、手势支持
- **响应式设计**: 适配各种移动设备屏幕尺寸
- **性能优化**: 流畅的动画和过渡效果
- **无障碍支持**: 符合移动端无障碍设计标准

#### 支持的题目类型

1. **文本类题目**: text, textarea, email, phone, url
2. **选择类题目**: select, radio, checkbox
3. **数值类题目**: number, rating, date
4. **特殊题目**: file, image, location, signature

#### 使用方法

1. **访问移动端首页**: `/m`
2. **选择问卷**: 在首页浏览可用的问卷列表，点击"开始答题"进入答题页面
3. **开始答题**: 系统会显示问卷描述和第一个问题，根据题目类型选择相应的输入方式
4. **完成答题**: 回答完所有问题后，点击"提交问卷"，系统会验证所有必填项

#### 技术实现

- **前端技术栈**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **核心组件**: MobileQuestionRenderer, 专用输入组件, QuestionParser
- **性能优化**: React.memo, useCallback, useMemo, 懒加载, 代码分割

---

## 开放平台设计

### 🌐 开放平台（Open Platform）PRD

#### 背景与目标

- **背景**: 现有问卷平台需要对外开放标准化接口，支持第三方应用"创建-配置-发布-收集-回传"问卷相关能力
- **目标**:
  - 对外能力：创建问卷、更新配置、发布/下线、获取答卷、推送事件、导出
  - 集成体验：简明 API、清晰权限模型、稳定版本化、完善文档与 SDK
  - 安全合规：鉴权、权限最小化、审计、限流、防刷、防重放
  - 商业化与运营：可配置配额与速率、监控告警、统计分析、支持工单

#### 用户画像与使用场景

- **第三方开发者/ISV**: 集成问卷创建和回传数据到自身系统
- **企业集成工程师**: 打通 CRM/客服/营销系统
- **数据分析工程师**: 拉取答卷数据做 BI

#### 核心场景

- **自动化拉起问卷**: 系统触发创建问卷并下发填写链接
- **异步回传**: 用户提交后，通过 Webhook 通知第三方
- **定期同步**: 按需批量拉取问卷与答卷
- **模板化**: 根据预设模板快速创建并定制
- **权限隔离**: 团队/子账号仅可操作授权资源

### 🔧 产品范围与能力清单

#### 开发者门户

- **应用管理**: 创建应用、查看 AppId、重置/吊销密钥、设置回调、环境切换
- **凭证管理**: API Key、Client Credentials（OAuth2，可选 V1.1+）
- **Webhooks**: 事件订阅、签名密钥、日志与重试
- **用量与账单**: 调用量、成功率、限流状态、错误分布
- **文档与示例**: API 文档、交互式 Playground、SDK 下载

#### API 能力

- **问卷管理**: 创建、更新、发布/下线、获取详情、删除
- **配置管理**: 基础信息、封面配置、题目结构（JSON DSL）
- **答卷管理**: 分页查询、单条获取、导出、状态变更
- **事件通知**: 问卷发布、答卷提交、答卷更新、问卷状态变更
- **系统能力**: 健康检查、速率限制、签名校验、Idempotency-Key

### 📊 信息架构与数据模型

#### App（开发者应用）

- id, name, ownerId, apiKey(hash), webhookUrl, webhookSecret, env(sandbox|prod), rateLimitPerMin, dailyQuota, status(active|suspended), createdAt, updatedAt

#### Survey（问卷）

- id, appId, name, description, published(boolean), questions(Json), coverConfig(Json), estimatedTime, privacyNotice, bottomNotice, coverIcon, coverColor, showProgressInfo, showPrivacyNotice, deletedAt, createdAt, updatedAt

#### Response（答卷）

- id, surveyId, externalUserId?, answers(Json), status(submitted|deleted), submittedAt, metadata(Json), createdAt, updatedAt

#### WebhookEvent

- id, appId, type, payload(Json), signature, deliveryStatus(pending|success|failed), retryCount, lastError?, createdAt, updatedAt

### 🔐 权限与安全

- **鉴权**: API Key（V1），后续支持 OAuth2 Client Credentials（V1.1）
- **权限模型**: App 仅可访问自身资源；最小权限 token（可细分读/写，V1.1）
- **限流与配额**: 按 AppId；429 + Retry-After；IP 黑白名单（运营配置）
- **防重放**: 时间戳 + 签名；Idempotency-Key 写操作幂等
- **数据合规**: 敏感字段脱敏；传输全程 HTTPS；审计日志
- **Webhook 安全**: 签名校验、失败重试、死信队列、回源拉取

### 📈 指标与验收

#### 核心指标

- 开发接入时长 ≤ 1 天
- API 成功率 ≥ 99.9%
- Webhook 端到端延迟 P95 ≤ 3s
- 文档满意度 ≥ 4.5/5

#### 验收清单

- 门户可创建应用并看到密钥
- REST API 可创建/发布问卷，权限/限流生效
- Webhook 可签名验证、可重试、可重放
- Playground 可调用成功；SDK 示例可运行
- 日志/监控/告警可用

---

## 开发指南

### 🛠️ 开发环境设置

#### 环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis 6+

#### 安装步骤

```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env.local

# 启动数据库
pnpm db:setup

# 启动开发服务器
pnpm dev
```

### 📝 代码规范

#### TypeScript规范

- 启用严格模式
- 定义清晰的接口和类型
- 使用类型守卫处理潜在的空值
- 应用泛型提高代码复用性
- 使用TypeScript工具类型（Partial, Pick, Omit）

#### React规范

- 使用函数组件和Hooks
- 使用React.memo进行性能优化
- 实现useCallback和useMemo优化
- 避免在JSX中定义内联函数
- 实现代码分割使用动态导入

#### 命名规范

- **PascalCase**: 组件、类型定义、接口
- **kebab-case**: 目录名、文件名
- **camelCase**: 变量、函数、方法、Hooks、属性、Props
- **UPPERCASE**: 环境变量、常量、全局配置

### 🧪 测试策略

#### 单元测试

- 使用Jest和React Testing Library
- 遵循Arrange-Act-Assert模式
- Mock外部依赖和API调用
- 目标覆盖率≥80%

#### 集成测试

- 使用Playwright进行端到端测试
- 测试用户工作流程
- 设置和清理测试环境
- 使用快照测试选择性验证UI变化

### 🔧 服务层架构

#### 重构完成情况

1. **创建了完整的服务层架构**

   - `server/services/user-service.ts` - 用户管理服务
   - `server/services/survey-service.ts` - 问卷管理服务
   - `server/services/template-service.ts` - 模板管理服务
   - `server/services/api-key-service.ts` - API密钥管理服务
   - `server/services/ai-config-service.ts` - AI配置管理服务
   - `server/services/ollama-service.ts` - Ollama服务管理

2. **重构了 tRPC 路由**
   - 将原有的零散业务逻辑提取到服务层
   - 路由层只负责参数验证和调用服务
   - 实现了关注点分离

#### 架构优势

- **代码复用**: 业务逻辑可以在多个路由中复用
- **易于测试**: 服务层可以独立进行单元测试
- **维护性**: 业务逻辑集中管理，易于维护和修改
- **可扩展性**: 新增功能只需添加新的服务方法
- **类型安全**: 完整的 TypeScript 类型支持

### 🚀 性能优化

#### 前端优化

- 使用React.memo避免不必要的重渲染
- 实现useCallback和useMemo优化
- 懒加载非关键组件
- 代码分割和动态导入
- 虚拟滚动优化长列表

#### 后端优化

- 数据库查询优化
- Redis缓存策略
- API响应压缩
- 连接池管理
- 异步任务处理

---

## 部署与运维

### 🚀 部署方案

#### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 启动Ollama服务
ollama serve

# 启动Redis
redis-server
```

#### 生产环境

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start

# 使用Docker部署
docker-compose up -d
```

### 📊 监控与日志

#### 监控指标

- API响应时间
- 错误率
- 用户活跃度
- 系统资源使用率
- AI服务调用成功率

#### 日志管理

- 结构化日志记录
- 错误追踪和告警
- 性能监控
- 用户行为分析

### 🔧 故障排除

#### 常见问题

1. **Ollama服务未启动**

   ```bash
   ollama serve
   ```

2. **模型未下载**

   ```bash
   ollama pull qwen2.5:7b
   ```

3. **端口被占用**

   ```bash
   lsof -i :11434
   ```

4. **内存不足**
   - 使用更小的模型：`ollama pull qwen2.5:3b`
   - 增加系统内存
   - 关闭其他应用

#### 调试方法

1. 启用详细日志
2. 检查网络请求
3. 验证环境变量
4. 测试API端点
5. 检查中间件配置

### 🔮 未来规划

#### 短期目标 (1-3个月)

- [ ] 完善拖拽系统
- [ ] 优化性能
- [ ] 增加更多组件类型
- [ ] 完善验证系统

#### 中期目标 (3-6个月)

- [ ] 实现插件系统
- [ ] 添加协作功能
- [ ] 支持移动端编辑
- [ ] 增加模板系统

#### 长期目标 (6-12个月)

- [ ] AI辅助设计
- [ ] 多语言支持
- [ ] 企业级功能
- [ ] 生态系统建设

---

## 📚 相关文档

- [React 官方文档](https://react.dev/)
- [Next.js 官方文档](https://nextjs.org/docs)
- [Valtio 状态管理](https://github.com/pmndrs/valtio)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 组件库](https://www.radix-ui.com/)
- [tRPC 官方文档](https://trpc.io/)
- [Ollama 官方文档](https://ollama.ai/)

---

_本文档持续更新中，如有疑问或建议，请联系开发团队。_
