'use client'

import { ServiceStatusCard } from './components/service-status-card'
import { ModelManagementCard } from './components/model-management-card'
import { QuickConfigCard } from './components/quick-config-card'
import { useOllamaService } from './hooks/use-ollama-service'
import { useModelDownload } from './hooks/use-model-download'
import { useOllamaConfig } from './hooks/use-ollama-config'
import { useActiveModel } from './hooks/use-active-model'
import type {
	OllamaServiceManagerProps,
	OllamaConfig,
} from './types/ollama.types'

export function OllamaServiceManager({
	onConfigChange,
}: OllamaServiceManagerProps) {
	const ollamaService = useOllamaService()
	const modelDownload = useModelDownload()
	const ollamaConfig = useOllamaConfig()
	const { activeModel, setActiveModelMutation } = useActiveModel()

	const handleConfigChange = (config: OllamaConfig) => {
		onConfigChange?.(config)
	}

	const handleSetActiveModel = async (
		modelName: string,
		modelSize?: number,
	) => {
		await setActiveModelMutation.mutateAsync({
			modelName,
			modelSize,
		})
	}

	return (
		<div className="space-y-6">
			<ServiceStatusCard
				serviceInfo={ollamaService.serviceInfo}
				isLoading={ollamaService.isLoading}
				error={ollamaService.error}
				activeModel={activeModel}
				onRefresh={ollamaService.refetch}
			/>

			<ModelManagementCard
				serviceInfo={ollamaService.serviceInfo}
				isDownloading={modelDownload.isDownloading}
				progress={modelDownload.progress}
				activeModel={activeModel}
				onDownloadModel={modelDownload.downloadModel}
				onCancelDownload={modelDownload.cancelDownload}
				onSetActiveModel={handleSetActiveModel}
			/>

			<QuickConfigCard
				serviceInfo={ollamaService.serviceInfo}
				isDownloading={modelDownload.isDownloading}
				onAutoConfig={ollamaConfig.autoConfigure}
				onConfigChange={handleConfigChange}
			/>
		</div>
	)
}
