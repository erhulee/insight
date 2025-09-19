import ollama from 'ollama'

// 类型定义
interface OllamaServiceStatus {
	isAvailable: boolean
	systemInfo?: {
		version: string
		gpu?: string
		memory?: string
		cpu?: string
	}
	models: Array<{
		name: string
		size: number
		details?: {
			format: string
			family: string
			families?: string[]
			parameter_size: string
			quantization_level: string
		}
	}>
	recommendedModels: string[]
}

interface OllamaModel {
	name: string
	size: number
	modified_at: Date | string
	digest: string
	details?: {
		format: string
		family: string
		families?: string[]
		parameter_size: string
		quantization_level: string
	}
}

interface PullProgress {
	status: 'downloading' | 'completed' | 'error'
	progress: number // 0-100
	message?: string
}

interface OllamaConfig {
	type: 'ollama'
	baseUrl: string
	model: string
	name: string
}

// 自定义错误类型
class OllamaServiceError extends Error {
	constructor(
		message: string,
		public code:
			| 'SERVICE_UNAVAILABLE'
			| 'MODEL_NOT_FOUND'
			| 'DOWNLOAD_FAILED'
			| 'CONFIG_INVALID',
		public details?: any,
	) {
		super(message)
		this.name = 'OllamaServiceError'
	}
}

class OllamaService {
	private readonly baseUrl = 'http://localhost:11434'
	private readonly recommendedModels = [
		'qwen2.5:7b',
		'llama3.2:3b',
		'gemma2:9b',
		'codellama:7b',
	]

	// 缓存
	private cache = new Map<
		string,
		{ data: any; timestamp: number; ttl: number }
	>()

	/**
	 * 检查服务可用性
	 */
	async checkServiceStatus(): Promise<boolean> {
		const cacheKey = 'service_status'
		const cached = this.getFromCache(cacheKey, 30000) // 30秒缓存

		if (cached !== null) {
			return cached
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/tags`, {
				method: 'GET',
				signal: AbortSignal.timeout(5000),
			})

			const isAvailable = response.ok
			this.setCache(cacheKey, isAvailable, 30000)
			return isAvailable
		} catch (error) {
			this.setCache(cacheKey, false, 30000)
			return false
		}
	}

	/**
	 * 获取完整服务信息
	 */
	async getServiceInfo(): Promise<OllamaServiceStatus> {
		try {
			const isAvailable = await this.checkServiceStatus()

			if (!isAvailable) {
				return {
					isAvailable: false,
					models: [],
					recommendedModels: this.recommendedModels,
				}
			}

			const [models, systemInfo] = await Promise.all([
				this.getDownloadedModelList(),
				this.getSystemInfo(),
			])

			return {
				isAvailable: true,
				systemInfo,
				models: models.map((model) => {
					return {
						name: model.name,
						size: model.size,
						details: model.details as any,
					}
				}),
				recommendedModels: this.recommendedModels,
			}
		} catch (error) {
			throw new OllamaServiceError(
				'获取 Ollama 服务信息失败',
				'SERVICE_UNAVAILABLE',
				error,
			)
		}
	}

	/**
	 * 获取已安装模型列表
	 */
	async getDownloadedModelList(): Promise<OllamaModel[]> {
		const cacheKey = 'model_list'
		const cached = this.getFromCache(cacheKey, 60000) // 60秒缓存

		if (cached !== null) {
			return cached
		}

		try {
			const list = await ollama.list()
			const models = (list.models || []) as OllamaModel[]
			console.log('models:', models)
			this.setCache(cacheKey, models, 60000)
			return models
		} catch (error) {
			throw new OllamaServiceError(
				'获取模型列表失败',
				'SERVICE_UNAVAILABLE',
				error,
			)
		}
	}

	/**
	 * 获取系统信息
	 */
	async getSystemInfo() {
		const cacheKey = 'system_info'
		const cached = this.getFromCache(cacheKey, 300000) // 5分钟缓存

		if (cached !== null) {
			return cached
		}

		try {
			const response = await fetch(`${this.baseUrl}/api/version`, {
				method: 'GET',
				signal: AbortSignal.timeout(5000),
			})

			if (!response.ok) {
				throw new Error('获取系统信息失败')
			}

			const data = await response.json()
			const systemInfo = {
				version: data.version || 'unknown',
				gpu: data.gpu || undefined,
				memory: data.memory || undefined,
				cpu: data.cpu || undefined,
			}

			this.setCache(cacheKey, systemInfo, 300000)
			return systemInfo
		} catch (error) {
			throw new OllamaServiceError(
				'获取系统信息失败',
				'SERVICE_UNAVAILABLE',
				error,
			)
		}
	}

	/**
	 * 下载模型
	 */
	async pullModel(modelName: string): Promise<void> {
		if (!modelName || typeof modelName !== 'string') {
			throw new OllamaServiceError('模型名称无效', 'CONFIG_INVALID')
		}

		try {
			await ollama.pull({ model: modelName })
			// 清除模型列表缓存
			this.clearCache('model_list')
		} catch (error) {
			throw new OllamaServiceError(
				`下载模型 ${modelName} 失败`,
				'DOWNLOAD_FAILED',
				error,
			)
		}
	}

	/**
	 * 带进度回调的模型下载
	 */
	async pullModelWithProgress(
		modelName: string,
		onProgress?: (progress: PullProgress) => void,
	): Promise<void> {
		if (!modelName || typeof modelName !== 'string') {
			throw new OllamaServiceError('模型名称无效', 'CONFIG_INVALID')
		}

		try {
			// 使用流式下载获取进度
			const response = await fetch(`${this.baseUrl}/api/pull`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: modelName, stream: true }),
			})

			if (!response.ok) {
				throw new Error(`下载请求失败: ${response.status}`)
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error('无法获取响应流')
			}

			const decoder = new TextDecoder()
			let progress = 0

			try {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					const chunk = decoder.decode(value)
					const lines = chunk.split('\n').filter((line) => line.trim())

					for (const line of lines) {
						try {
							const data = JSON.parse(line)
							if (data.status === 'downloading') {
								progress = Math.round((data.completed / data.total) * 100)
								onProgress?.({
									status: 'downloading',
									progress,
									message: `正在下载 ${modelName}...`,
								})
							} else if (data.status === 'success') {
								onProgress?.({
									status: 'completed',
									progress: 100,
									message: `模型 ${modelName} 下载完成`,
								})
							}
						} catch (parseError) {
							// 忽略解析错误，继续处理下一行
						}
					}
				}
			} finally {
				reader.releaseLock()
			}

			// 清除模型列表缓存
			this.clearCache('model_list')
		} catch (error) {
			onProgress?.({
				status: 'error',
				progress: 0,
				message: `下载失败: ${error instanceof Error ? error.message : '未知错误'}`,
			})
			throw new OllamaServiceError(
				`下载模型 ${modelName} 失败`,
				'DOWNLOAD_FAILED',
				error,
			)
		}
	}

	/**
	 * 删除模型
	 */
	async deleteModel(modelName: string): Promise<void> {
		if (!modelName || typeof modelName !== 'string') {
			throw new OllamaServiceError('模型名称无效', 'CONFIG_INVALID')
		}

		try {
			await ollama.delete({ model: modelName })
			// 清除模型列表缓存
			this.clearCache('model_list')
		} catch (error) {
			throw new OllamaServiceError(
				`删除模型 ${modelName} 失败`,
				'MODEL_NOT_FOUND',
				error,
			)
		}
	}

	/**
	 * 检查模型是否已安装
	 */
	async isModelInstalled(modelName: string): Promise<boolean> {
		try {
			const models = await this.getDownloadedModelList()
			return models.some((model) => model.name === modelName)
		} catch (error) {
			return false
		}
	}

	/**
	 * 获取推荐模型列表
	 */
	getRecommendedModels(): string[] {
		return [...this.recommendedModels]
	}

	/**
	 * 自动配置推荐模型
	 */
	async autoConfigure(): Promise<OllamaConfig> {
		try {
			const isAvailable = await this.checkServiceStatus()
			if (!isAvailable) {
				throw new OllamaServiceError(
					'Ollama 服务不可用，请先启动 Ollama 服务',
					'SERVICE_UNAVAILABLE',
				)
			}

			const recommendedModel = this.recommendedModels[0]
			if (!recommendedModel) {
				throw new OllamaServiceError('没有可用的推荐模型', 'CONFIG_INVALID')
			}

			const isInstalled = await this.isModelInstalled(recommendedModel)

			if (!isInstalled) {
				await this.pullModel(recommendedModel)
			}

			return {
				type: 'ollama',
				baseUrl: this.baseUrl,
				model: recommendedModel,
				name: 'Ollama本地服务',
			}
		} catch (error) {
			if (error instanceof OllamaServiceError) {
				throw error
			}
			throw new OllamaServiceError('自动配置失败', 'CONFIG_INVALID', error)
		}
	}

	/**
	 * 验证配置有效性
	 */
	async validateConfig(config: OllamaConfig): Promise<boolean> {
		try {
			if (config.type !== 'ollama') {
				return false
			}

			if (!config.baseUrl || !config.model) {
				return false
			}

			// 检查服务是否可用
			const isAvailable = await this.checkServiceStatus()
			if (!isAvailable) {
				return false
			}

			// 检查模型是否已安装
			const isInstalled = await this.isModelInstalled(config.model)
			return isInstalled
		} catch (error) {
			return false
		}
	}

	// 缓存管理方法
	private getFromCache(key: string, ttl: number): any {
		const cached = this.cache.get(key)
		if (cached && Date.now() - cached.timestamp < ttl) {
			return cached.data
		}
		return null
	}

	private setCache(key: string, data: any, ttl: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		})
	}

	private clearCache(key: string): void {
		this.cache.delete(key)
	}

	/**
	 * 清除所有缓存
	 */
	clearAllCache(): void {
		this.cache.clear()
	}
}

export const ollamaService = new OllamaService()
