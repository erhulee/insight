import { trpc } from '@/app/_trpc/client'
import { useActiveModel } from '../../ollama/hooks/use-active-model'
import { useOllamaService } from '../../ollama/hooks/use-ollama-service'

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

export function useConnectStatus() {
	const activeModel = useActiveModel()
	const ollamaService = useOllamaService()

	// 获取活跃的AI配置
	const { data: activeAIConfig, isLoading: isAIConfigLoading } =
		trpc.aiConfig.getActiveAIConfig.useQuery()

	// 合并活跃模型和AI配置数据
	const getMergedConfig = (): MergedConfig | null => {
		const aiConfig = activeAIConfig as AIConfig | null
		const model = activeModel.activeModel

		if (!model && !aiConfig) return null

		return {
			...(aiConfig || {}),
			model: model?.modelName || aiConfig?.model || '',
			modelSize: model?.modelSize || aiConfig?.modelSize,
			modelType: model?.modelType,
			baseUrl: model?.baseUrl || aiConfig?.baseUrl || '',
			isActiveModel: !!model,
		} as MergedConfig
	}

	const mergedConfig = getMergedConfig()

	return {
		activeModel: activeModel.activeModel,
		activeAIConfig: activeAIConfig as AIConfig | null,
		mergedConfig,
		ollamaStatus: ollamaService.serviceInfo,
		isLoading:
			activeModel.isLoading || ollamaService.isLoading || isAIConfigLoading,
		error: activeModel.error || ollamaService.error,
		// 活跃模型相关状态
		isSettingActive: activeModel.isSettingActive,
		isClearing: activeModel.isClearing,
		// 操作方法
		setActiveModelMutation: activeModel.setActiveModelMutation,
		clearActiveModelMutation: activeModel.clearActiveModelMutation,
		refetch: () => {
			activeModel.refetch?.()
			ollamaService.refetch()
		},
	}
}
