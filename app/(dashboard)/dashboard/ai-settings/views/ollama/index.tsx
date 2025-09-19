'use client'

import { ServiceStatusCard } from './components/service-status-card'
import { ModelManagementCard } from './components/model-management-card'
import { QuickConfigCard } from './components/quick-config-card'
import { useOllamaService } from './hooks/use-ollama-service'
import { useModelDownload } from './hooks/use-model-download'
import { useOllamaConfig } from './hooks/use-ollama-config'
import type {
	OllamaServiceManagerProps,
	OllamaConfig,
} from './types/ollama.types'

export function OllamaServiceManager({
	onConfigChange,
}: OllamaServiceManagerProps) {
	const ollamaService = useOllamaService()
	console.log('serviceInfo:', ollamaService.serviceInfo)
	const modelDownload = useModelDownload()
	const ollamaConfig = useOllamaConfig()

	const handleConfigChange = (config: OllamaConfig) => {
		onConfigChange?.(config)
	}

	return (
		<div className="space-y-6">
			<ServiceStatusCard
				serviceInfo={ollamaService.serviceInfo}
				isLoading={ollamaService.isLoading}
				error={ollamaService.error}
				onRefresh={ollamaService.refetch}
			/>

			<ModelManagementCard
				serviceInfo={ollamaService.serviceInfo}
				isDownloading={modelDownload.isDownloading}
				progress={modelDownload.progress}
				onDownloadModel={modelDownload.downloadModel}
				onCancelDownload={modelDownload.cancelDownload}
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
