# 对话服务 (Conversation Service)

## 概述

对话服务是 AISurveyGenerator 多轮对话功能的核心后端服务，提供智能对话、状态管理和问卷生成功能。

## 架构

```
server/services/conversation/
├── conversation.service.ts          # 对话业务逻辑服务
├── ai-conversation.service.ts       # AI 对话服务
├── prompt-builder.service.ts        # Prompt 构建服务
├── cache.service.ts                 # Redis 缓存服务
├── error-handler.ts                 # 错误处理
├── monitoring.ts                    # 监控和日志
├── ai-provider-adapter.ts           # AI 提供商适配器
└── index.ts                         # 服务初始化和导出
```

## 功能特性

### 1. 对话管理

- 创建和管理对话会话
- 发送和接收消息
- 维护对话历史
- 会话状态跟踪

### 2. AI 集成

- 多 AI 提供商支持 (OpenAI, Ollama, 火山引擎等)
- 智能对话响应
- 问卷生成
- 上下文理解

### 3. 状态管理

- 对话阶段跟踪 (initial, details, structure, validation, complete)
- 进度管理
- 信息收集
- 上下文维护

### 4. 缓存策略

- Redis 会话缓存
- AI 响应缓存
- 消息历史缓存
- 自动过期清理

### 5. 错误处理

- 重试机制
- 错误分类
- 降级处理
- 监控告警

## 使用方法

### 1. 初始化服务

```typescript
import { initializeConversationServices } from './services/conversation'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL)

// 初始化对话服务
const services = initializeConversationServices(
	prisma,
	redis,
	'ollama', // AI 提供商类型
	{ modelName: 'qwen2.5:7b' }, // AI 提供商配置
)
```

### 2. 创建对话会话

```typescript
import { getConversationService } from './services/conversation'

const conversationService = getConversationService()

const session = await conversationService.createSession({
	userId: 'user123',
	initialPrompt: '我想创建一个用户满意度调查问卷',
})
```

### 3. 发送消息

```typescript
const response = await conversationService.sendMessage({
	sessionId: session.sessionId,
	content: '我的目标受众是18-35岁的年轻用户',
	metadata: { source: 'web' },
})
```

### 4. 获取对话历史

```typescript
const messages = await conversationService.getMessages({
	sessionId: session.sessionId,
	limit: 50,
	offset: 0,
})
```

### 5. 完成对话并生成问卷

```typescript
const result = await conversationService.completeConversation({
	sessionId: session.sessionId,
	finalPrompt: '请生成最终的问卷',
})
```

## API 接口

### tRPC 路由

#### 对话路由 (`/api/trpc/conversation`)

- `createSession` - 创建新对话会话
- `sendMessage` - 发送消息
- `getMessages` - 获取对话历史
- `updateState` - 更新对话状态
- `completeConversation` - 完成对话并生成问卷
- `resetConversation` - 重置对话
- `getSession` - 获取会话状态
- `getSessionStats` - 获取会话统计信息

#### AI 对话路由 (`/api/trpc/aiConversation`)

- `chat` - 发送对话消息到 AI
- `generateSurvey` - 生成问卷
- `getServiceStatus` - 获取 AI 服务状态
- `getProviders` - 获取 AI 提供商列表
- `testConnection` - 测试 AI 连接
- `getUsageStats` - 获取 AI 使用统计

## 配置

### 环境变量

```env
# 数据库
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://localhost:6379"

# AI 服务
OPENAI_API_KEY="sk-..."
OLLAMA_BASE_URL="http://localhost:11434"
```

### 服务配置

```typescript
const config = {
	conversation: {
		sessionTimeout: 3600, // 会话超时时间（秒）
		maxMessagesPerSession: 100, // 每个会话最大消息数
		rateLimit: {
			messagesPerMinute: 10, // 每分钟最大消息数
			sessionsPerHour: 5, // 每小时最大会话数
		},
	},
	ai: {
		providers: {
			ollama: {
				baseUrl: 'http://localhost:11434',
				model: 'qwen2.5:7b',
			},
			openai: {
				apiKey: process.env.OPENAI_API_KEY,
				model: 'gpt-3.5-turbo',
			},
		},
	},
}
```

## 监控和日志

### 监控指标

- 会话创建数量
- 消息发送数量
- AI 响应时间
- 错误率
- 缓存命中率

### 日志事件

- `session_created` - 会话创建
- `message_sent` - 消息发送
- `ai_response` - AI 响应
- `survey_generated` - 问卷生成
- `error_occurred` - 错误发生

## 错误处理

### 错误类型

- `RATE_LIMIT` - 速率限制
- `TIMEOUT` - 超时
- `INVALID_RESPONSE` - 无效响应
- `AI_ERROR` - AI 服务错误
- `UNKNOWN` - 未知错误

### 重试策略

- 指数退避重试
- 最大重试次数：3
- 基础延迟：1秒

## 性能优化

### 缓存策略

- 会话状态缓存：1小时
- AI 响应缓存：5分钟
- 消息历史缓存：30分钟

### 数据库优化

- 复合索引优化
- 分页查询
- 连接池管理

## 安全考虑

### 输入验证

- 消息长度限制
- 敏感信息过滤
- SQL 注入防护

### 速率限制

- 用户级别限制
- IP 级别限制
- 服务级别限制

## 扩展性

### 添加新的 AI 提供商

1. 实现 `AIProvider` 接口
2. 在 `AIProviderFactory` 中注册
3. 更新配置文件

### 添加新的对话阶段

1. 更新 `ConversationPhase` 枚举
2. 修改状态转换逻辑
3. 更新 Prompt 模板

## 故障排除

### 常见问题

1. **AI 服务不可用**

   - 检查 AI 服务状态
   - 验证 API 密钥
   - 查看网络连接

2. **缓存问题**

   - 检查 Redis 连接
   - 验证缓存配置
   - 清理过期缓存

3. **数据库错误**
   - 检查数据库连接
   - 验证 Schema 版本
   - 查看错误日志

### 调试模式

```typescript
// 启用详细日志
process.env.DEBUG = 'conversation:*'

// 启用性能监控
process.env.ENABLE_MONITORING = 'true'
```

