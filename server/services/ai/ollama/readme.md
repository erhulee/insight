# Ollama 服务接口技术文档

## 概述

在 `server/services/ai/ollama/index.ts` 中开发完整的 Ollama 服务接口，为前端 `OllamaServiceManager` 组件提供所需的所有功能。

## 接口设计

### 1. 类型定义

```typescript
// Ollama 服务状态
interface OllamaServiceStatus {
	isAvailable: boolean
	systemInfo?: {
		version: string
		gpu?: string
		memory?: string
		cpu?: string
	}
	models: string[]
	recommendedModels: string[]
}

// Ollama 模型信息
interface OllamaModel {
	name: string
	size: number
	modified_at: string
	digest: string
	details?: {
		format: string
		family: string
		families?: string[]
		parameter_size: string
		quantization_level: string
	}
}

// 下载进度
interface PullProgress {
	status: 'downloading' | 'completed' | 'error'
	progress: number // 0-100
	message?: string
}

// Ollama 配置
interface OllamaConfig {
	type: 'ollama'
	baseUrl: string
	model: string
	name: string
}
```

### 2. 服务类方法设计

#### 2.1 核心服务状态管理

- `checkServiceStatus()`: 检查 Ollama 服务是否可用
- `getServiceInfo()`: 获取完整的服务信息（状态、系统信息、模型列表）
- `getSystemInfo()`: 获取系统信息（版本、GPU、内存等）

#### 2.2 模型管理

- `getModelList()`: 获取已安装的模型列表
- `getRecommendedModels()`: 获取推荐模型列表
- `isModelInstalled(modelName)`: 检查指定模型是否已安装
- `deleteModel(modelName)`: 删除指定模型

#### 2.3 模型下载

- `pullModel(modelName)`: 下载指定模型
- `pullModelWithProgress(modelName, onProgress)`: 带进度回调的模型下载

#### 2.4 配置管理

- `autoConfigure()`: 自动配置推荐模型
- `validateConfig(config)`: 验证配置有效性

### 3. 实现细节

#### 3.1 服务可用性检查

- 通过 HTTP 请求 `http://localhost:11434/api/tags` 检查服务状态
- 超时时间：5秒
- 重试机制：最多重试3次，每次间隔1秒

#### 3.2 模型下载进度

- 使用 Ollama 的流式 API `/api/pull`
- 解析 JSON 流获取下载进度
- 支持取消下载操作

#### 3.3 推荐模型策略

- 预设推荐模型：`['qwen2.5:7b', 'llama3.2:3b', 'gemma2:9b', 'codellama:7b']`
- 根据系统配置（GPU/CPU）动态调整推荐
- 支持用户自定义推荐列表

#### 3.4 错误处理

- 自定义错误类型：`OllamaServiceError`
- 错误代码：`SERVICE_UNAVAILABLE`, `MODEL_NOT_FOUND`, `DOWNLOAD_FAILED`, `CONFIG_INVALID`
- 详细的错误信息和上下文

### 4. 性能优化

#### 4.1 缓存策略

- 服务状态缓存：30秒
- 模型列表缓存：60秒
- 系统信息缓存：5分钟

#### 4.2 并发控制

- 限制同时下载的模型数量（最多2个）
- 使用队列管理下载任务
- 防止重复下载同一模型

#### 4.3 资源管理

- 连接池复用 HTTP 连接
- 请求去重避免重复请求
- 超时控制防止长时间阻塞

### 5. 使用示例

```typescript
const ollamaService = new OllamaService()

// 检查服务状态
const isAvailable = await ollamaService.checkServiceStatus()

// 获取服务信息
const serviceInfo = await ollamaService.getServiceInfo()

// 下载模型（带进度）
await ollamaService.pullModelWithProgress('qwen2.5:7b', (progress) => {
	console.log(`下载进度: ${progress.progress}%`)
})

// 自动配置
const config = await ollamaService.autoConfigure()
```

### 6. 测试策略

#### 6.1 单元测试

- 服务可用性检查
- 模型列表获取
- 错误处理逻辑
- 缓存机制验证

#### 6.2 集成测试

- 完整的下载流程
- 配置验证
- 并发操作测试

#### 6.3 模拟测试

- 服务不可用场景
- 网络异常场景
- 下载中断场景

### 7. 安全考虑

1. **输入验证**: 严格验证模型名称格式
2. **路径安全**: 防止路径遍历攻击
3. **资源限制**: 限制并发下载数量和文件大小
4. **超时控制**: 防止长时间阻塞

### 8. 监控和日志

1. **操作日志**: 记录所有模型操作
2. **性能监控**: 监控下载速度和成功率
3. **错误统计**: 统计各类错误发生频率
4. **资源使用**: 监控内存和磁盘使用情况

这个设计为 `OllamaServiceManager` 组件提供了完整的后端支持，包括服务状态管理、模型下载、进度跟踪和自动配置等核心功能，同时考虑了性能、安全和可维护性。
