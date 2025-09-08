'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAISettings } from './hooks/use-ai-settings'
import {
	AISettingsHeader,
	PageTitle,
	ConnectionStatusCard,
	SupportedServicesCard,
	QuickStartGuide,
	FAQCard,
} from './components'
import { AIServiceConfigManager } from '@/components/ai-service-config-manager-new'

export default function AISettingsPage() {
	const {
		activeConfig,
		isTesting,
		testResult,
		handleTestConnection,
		handleConfigChange,
	} = useAISettings()

	return (
		<div className="min-h-screen bg-background">
			<AISettingsHeader title="AI 设置" description="" />

			<main className="container mx-auto px-4 py-8">
				<div className="mx-auto space-y-6">
					<PageTitle
						title="AI 服务配置"
						description="配置和管理您的AI服务提供商，支持OpenAI、Ollama、Anthropic等多种服务。您可以添加多个配置，并根据需要切换使用。"
					/>

					<Tabs defaultValue="configs" className="space-y-6">
						<TabsList>
							<TabsTrigger value="configs" className=" w-36">
								服务配置
							</TabsTrigger>
							<TabsTrigger value="status" className=" w-36">
								连接状态
							</TabsTrigger>
							<TabsTrigger value="help" className=" w-36">
								使用说明
							</TabsTrigger>
						</TabsList>

						{/* 服务配置标签页 */}
						<TabsContent value="configs" className="space-y-6">
							<AIServiceConfigManager onConfigChange={handleConfigChange} />
						</TabsContent>

						{/* 连接状态标签页 */}
						<TabsContent value="status" className="space-y-6">
							<ConnectionStatusCard
								activeConfig={activeConfig || null}
								isTesting={isTesting}
								testResult={testResult}
								onTestConnection={handleTestConnection}
							/>
						</TabsContent>

						{/* 使用说明标签页 */}
						<TabsContent value="help" className="space-y-6">
							<SupportedServicesCard />
							<QuickStartGuide />
							<FAQCard />
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	)
}
