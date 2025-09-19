import type { ActiveModelConfig } from '../../ollama/types/ollama.types'
import type { OllamaServiceStatus } from '../../ollama/types/ollama.types'

export interface AIConfig {
	id: string
	name: string
	type: string
	baseUrl: string
	model: string
	temperature: number
	topP: number
	repeatPenalty?: number | null
	maxTokens?: number | null
	isActive: boolean
	createdAt: string | Date
	updatedAt: string | Date
	userId: string
	apiKey?: string
	modelSize?: number
}

export interface MergedConfig {
	id: string
	name: string
	type: string
	baseUrl: string
	model: string
	temperature: number
	topP: number
	repeatPenalty?: number | null
	maxTokens?: number | null
	isActive: boolean
	createdAt: string | Date
	updatedAt: string | Date
	userId: string
	apiKey?: string
	modelSize?: number
	modelType?: string
	isActiveModel: boolean
}

export interface TestResult {
	success: boolean
	error?: string
	responseTime?: number
}

export interface EnhancedConnectionStatusCardProps {
	activeConfig: AIConfig | null
	activeModel: ActiveModelConfig | null
	mergedConfig: MergedConfig | null
	ollamaStatus: OllamaServiceStatus | null
	isTesting: boolean
	testResult: TestResult | null
	isLoading: boolean
	error: string | null
	onTestConnection: () => void
	onManageModels: () => void
	onSetActiveModel?: (modelName: string, modelSize?: number) => Promise<void>
	onClearActiveModel?: () => Promise<void>
}

export interface ActiveModelInfoProps {
	activeModel: ActiveModelConfig | null
	ollamaStatus: OllamaServiceStatus | null
	isLoading: boolean
	onManageModels: () => void
	onSetActiveModel?:
		| ((modelName: string, modelSize?: number) => Promise<void>)
		| undefined
	onClearActiveModel?: (() => Promise<void>) | undefined
}
