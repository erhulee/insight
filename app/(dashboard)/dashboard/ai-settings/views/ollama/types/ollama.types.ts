// 活跃模型配置
export interface ActiveModelConfig {
	id: string
	userId: string
	modelName: string
	modelSize?: number
	modelType: string
	baseUrl?: string
	createdAt: Date
	updatedAt: Date
}

export interface SetActiveModelRequest {
	modelName: string
	modelSize?: number
	baseUrl?: string
}

// Ollama 服务状态
export interface OllamaServiceStatus {
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

// 下载进度
export interface PullProgress {
	status: 'downloading' | 'completed' | 'error'
	progress: number
	message?: string
}

// Ollama 配置
export interface OllamaConfig {
	type: 'ollama'
	baseUrl: string
	model: string
	name: string
}

// 组件Props类型
export interface OllamaServiceManagerProps {
	onConfigChange?: (config: OllamaConfig) => void
}

// Hook返回类型
export interface UseOllamaServiceReturn {
	serviceInfo: OllamaServiceStatus | null
	isLoading: boolean
	error: string | null
	refetch: () => void
}

export interface UseModelDownloadReturn {
	isDownloading: boolean
	progress: PullProgress | null
	downloadModel: (modelName: string) => Promise<void>
	cancelDownload: () => void
}

export interface UseOllamaConfigReturn {
	autoConfigure: () => Promise<OllamaConfig>
}

// UI组件Props类型
export interface ServiceStatusCardProps {
	serviceInfo: OllamaServiceStatus | null
	isLoading: boolean
	error: string | null
	activeModel: ActiveModelConfig | null
	onRefresh: () => void
}

export interface ModelManagementCardProps {
	serviceInfo: OllamaServiceStatus | null
	isDownloading: boolean
	progress: PullProgress | null
	activeModel: ActiveModelConfig | null
	onDownloadModel: (modelName: string) => Promise<void>
	onCancelDownload: () => void
	onSetActiveModel: (modelName: string, modelSize?: number) => Promise<void>
}

export interface QuickConfigCardProps {
	serviceInfo: OllamaServiceStatus | null
	isDownloading: boolean
	onAutoConfig: () => Promise<OllamaConfig>
	onConfigChange: (config: OllamaConfig) => void
}
