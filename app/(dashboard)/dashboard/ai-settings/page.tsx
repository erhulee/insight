'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAISettings } from './hooks/use-ai-settings'

import Useage from './views/useage'
import { ConnectStatusPage } from './views/connect-status/connect-status-page'
import { AIServiceConfigManager } from './views/config'
import { OllamaServiceManager } from './views/ollama'

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
			<header className="border-b">
				<div className="flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-4">
						<h1 className="text-lg font-medium">AI 设置</h1>
					</div>
				</div>
			</header>
			<main className="container mx-auto px-4 py-8">
				<div className="mx-auto space-y-6">
					<div className="text-left space-y-2">
						<h1 className="text-3xl font-bold">AI 服务配置</h1>
						<p className="text-muted-foreground mx-auto">
							配置和管理您的AI服务提供商，支持OpenAI、Ollama、Anthropic等多种服务。您可以添加多个配置，并根据需要切换使
						</p>
					</div>
					<Tabs defaultValue="configs" className="space-y-6">
						<TabsList>
							<TabsTrigger value="configs" className=" w-36">
								服务配置
							</TabsTrigger>
							<TabsTrigger value="ollama" className=" w-36">
								Ollama
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

						{/* Ollama服务管理标签页 */}
						<TabsContent value="ollama" className="space-y-6">
							<OllamaServiceManager onConfigChange={handleConfigChange} />
						</TabsContent>

						{/* 连接状态标签页 */}
						<TabsContent value="status" className="space-y-6">
							<ConnectStatusPage />
						</TabsContent>

						{/* 使用说明标签页 */}
						<TabsContent value="help" className="space-y-6">
							<Useage />
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	)
}
