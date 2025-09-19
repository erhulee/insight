import { trpc } from '@/app/_trpc/client'
import type { ActiveModelConfig } from '../types/ollama.types'
import { toast } from 'sonner'
export function useActiveModel() {
	const utils = trpc.useUtils()
	const { data: activeModel, isLoading } =
		trpc.aiConfig.getActiveModel.useQuery()
	const setActiveModelMutation = trpc.aiConfig.setActiveModel.useMutation({
		onSuccess: () => {
			toast.dismiss()
			toast.success('设置活跃模型成功')
			utils.aiConfig.getActiveModel.invalidate()
			utils.aiConfig.GetOllamaModels.invalidate()
		},
	})

	const clearActiveModelMutation = trpc.aiConfig.clearActiveModel.useMutation({
		onSuccess: () => {
			utils.aiConfig.getActiveModel.invalidate()
		},
	})

	return {
		activeModel: activeModel as ActiveModelConfig | null,
		isLoading,
		setActiveModelMutation,
		clearActiveModelMutation,
		isSettingActive: setActiveModelMutation.isPending,
		isClearing: clearActiveModelMutation.isPending,
		error: setActiveModelMutation.error || clearActiveModelMutation.error,
	}
}
