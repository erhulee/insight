# AI服务扩展性架构设计

## 概述

本文档描述了如何为问卷平台添加新的AI服务提供商，保持系统的良好扩展性。

## 架构设计原则

### 1. 插件化架构

- 每个AI服务提供商作为独立的插件
- 统一的接口规范
- 热插拔支持

### 2. 配置驱动

- 通过配置文件定义服务提供商
- 支持动态添加新服务
- 用户可自定义配置

### 3. 类型安全

- 完整的TypeScript类型支持
- 编译时类型检查
- 运行时类型验证

## 添加新AI服务提供商的步骤

### 步骤1: 更新类型定义

在 `lib/ai-service-config.ts` 中：

```typescript
// 1. 更新类型联合
export interface AIServiceConfig {
	type: 'openai' | 'ollama' | 'anthropic' | 'volcano' | 'your-new-service'
}

// 2. 添加服务提供商配置
export const AI_SERVICE_PROVIDERS: AIServiceProvider[] = [
	// ... 现有配置
	{
		id: 'your-new-service',
		name: '你的新服务',
		type: 'your-new-service',
		description: '服务描述',
		baseUrl: 'https://api.yourservice.com/v1',
		models: ['model1', 'model2'],
		defaultConfig: {
			maxTokens: 4000,
		},
	},
]

// 3. 更新验证逻辑
if (
	config.type === 'openai' ||
	config.type === 'anthropic' ||
	config.type === 'volcano' ||
	config.type === 'your-new-service'
) {
	if (!config.apiKey?.trim()) {
		errors.push('API密钥不能为空')
	}
}
```

### 步骤2: 实现服务类

在 `lib/ai-services/your-service.ts` 中：

```typescript
import {
	AIService,
	AIGenerationRequest,
	AIGenerationResponse,
	AIGenerationStreamResponse,
	AIServiceStatus,
} from '../ai-service-interface'
import { AIServiceConfig } from '../ai-service-config'

export class YourService implements AIService {
	async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
		const { prompt, config, options } = request

		try {
			const response = await fetch(`${config.baseUrl}/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${config.apiKey}`,
				},
				body: JSON.stringify({
					model: config.model,
					messages: [{ role: 'user', content: prompt }],
					temperature: options?.temperature ?? config.temperature,
					max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
				}),
			})

			if (!response.ok) {
				throw new Error(`Your Service API error: ${response.status}`)
			}

			const data = await response.json()

			return {
				content: data.choices[0].message.content,
				usage: data.usage,
				model: data.model,
				finishReason: data.choices[0].finish_reason,
			}
		} catch (error) {
			throw new Error(`Your Service generation failed: ${error.message}`)
		}
	}

	async generateStream(
		request: AIGenerationRequest,
		onChunk: (chunk: AIGenerationStreamResponse) => void,
	): Promise<void> {
		// 实现流式生成逻辑
	}

	async testConnection(
		config: AIServiceConfig,
	): Promise<{ success: boolean; error?: string }> {
		// 实现连接测试逻辑
	}

	async getStatus(config: AIServiceConfig): Promise<AIServiceStatus> {
		// 实现状态获取逻辑
	}
}
```

### 步骤3: 注册服务

在 `lib/ai-service-interface.ts` 中：

```typescript
export function createAIService(type: string): AIService {
	switch (type) {
		case 'openai':
			const { OpenAIService } = require('./ai-services/openai-service')
			return new OpenAIService()
		case 'your-new-service':
			const { YourService } = require('./ai-services/your-service')
			return new YourService()
		default:
			throw new Error(`Unsupported AI service type: ${type}`)
	}
}
```

### 步骤4: 更新后端路由

在 `server/router/ai-config.ts` 中：

```typescript
// 更新所有类型枚举
type: z.enum(['openai', 'ollama', 'anthropic', 'volcano', 'your-new-service'])
```

在 `server/index.ts` 中：

```typescript
// 更新所有类型枚举
type: z.enum(['openai', 'ollama', 'anthropic', 'volcano', 'your-new-service'])
```

### 步骤5: 更新前端组件

在 `app/(dashboard)/dashboard/ai-settings/components/supported-services-card.tsx` 中：

```typescript
const services: ServiceInfo[] = [
	// ... 现有服务
	{
		name: '你的新服务',
		description: '服务描述和使用说明',
		recommendedModels: 'model1, model2',
		requirements: '需要API密钥',
	},
]
```

## 火山引擎集成示例

我们已经完整集成了火山引擎作为示例：

### 1. 服务配置

```typescript
{
  id: 'volcano',
  name: '火山引擎',
  type: 'volcano',
  description: '字节跳动火山引擎大模型服务，支持豆包等模型',
  baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  models: [
    'doubao-seed-1-6-250615',
    'doubao-pro-4k-20241220',
    'doubao-lite-4k-20241220',
    'doubao-pro-32k-20241220',
    'doubao-lite-32k-20241220',
  ],
  defaultConfig: {
    maxTokens: 4000,
  },
}
```

### 2. 服务实现

- 完整的API调用实现
- 流式生成支持
- 连接测试功能
- 状态获取功能

### 3. 前端集成

- 配置界面支持
- 服务说明文档
- 模型选择支持

## 扩展性优势

### 1. 易于添加新服务

- 只需要实现标准接口
- 配置驱动，无需修改核心代码
- 类型安全保证

### 2. 统一的管理界面

- 所有服务使用相同的配置界面
- 统一的测试和状态监控
- 一致的用户体验

### 3. 灵活的配置选项

- 支持自定义参数
- 可配置的默认值
- 运行时配置验证

### 4. 错误处理和回退

- 统一的错误处理机制
- 自动回退到备用服务
- 详细的错误信息

## 最佳实践

### 1. 接口实现

- 严格遵循AIService接口
- 实现所有必需的方法
- 提供详细的错误信息

### 2. 配置管理

- 提供合理的默认值
- 验证配置参数
- 支持环境变量

### 3. 错误处理

- 优雅的错误处理
- 有意义的错误消息
- 适当的日志记录

### 4. 测试

- 实现连接测试
- 提供状态监控
- 支持健康检查

## 未来扩展

### 1. 插件系统

- 动态加载服务插件
- 热插拔支持
- 版本管理

### 2. 服务发现

- 自动发现可用服务
- 服务健康检查
- 负载均衡

### 3. 配置模板

- 预定义配置模板
- 一键配置
- 配置分享

### 4. 监控和分析

- 使用统计
- 性能监控
- 成本分析

## 总结

通过这种插件化的架构设计，我们可以：

1. **快速集成新服务**: 只需实现标准接口和添加配置
2. **保持代码整洁**: 每个服务独立实现，互不干扰
3. **提供一致体验**: 统一的配置界面和API
4. **确保类型安全**: 完整的TypeScript支持
5. **支持未来扩展**: 灵活的架构设计

这种设计使得添加新的AI服务提供商变得非常简单，同时保持了系统的稳定性和可维护性。
