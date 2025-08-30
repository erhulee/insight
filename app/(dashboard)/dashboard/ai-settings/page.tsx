'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle, XCircle, Settings, TestTube, Sparkles, Info } from 'lucide-react'
import { toast } from 'sonner'
import { AIServiceConfigManager } from '@/components/ai-service-config-manager'
import { aiServiceManager } from '@/lib/ai-service-manager'
import { getActiveAIConfig } from '@/lib/ai-service-config'

export default function AISettingsPage() {
	const [activeConfig, setActiveConfig] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isTesting, setIsTesting] = useState(false)
	const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null)

	useEffect(() => {
		loadActiveConfig()
	}, [])

	const loadActiveConfig = () => {
		const config = getActiveAIConfig()
		setActiveConfig(config)
	}

	const handleTestConnection = async () => {
		if (!activeConfig) {
			toast.error('没有可用的AI服务配置')
			return
		}

		setIsTesting(true)
		setTestResult(null)
		
		try {
			const result = await aiServiceManager.testConnection(activeConfig)
			setTestResult(result)
			
			if (result.success) {
				toast.success('连接测试成功！')
			} else {
				toast.error(`连接测试失败: ${result.error}`)
			}
		} catch (error) {
			setTestResult({ success: false, error: '测试失败' })
			toast.error('连接测试失败')
		} finally {
			setIsTesting(false)
		}
	}

	const handleConfigChange = () => {
		loadActiveConfig()
	}

	return (
		<div className="min-h-screen bg-background">
			{/* 顶部导航栏 */}
			<header className="border-b">
				<div className="flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-4">
						<h1 className="text-lg font-medium">AI 设置</h1>
					</div>
				</div>
			</header>

			{/* 主要内容区域 */}
			<main className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto space-y-6">
					{/* 页面标题和说明 */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold">AI 服务配置</h1>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							配置和管理您的AI服务提供商，支持OpenAI、Ollama、Anthropic等多种服务。
							您可以添加多个配置，并根据需要切换使用。
						</p>
					</div>

					<Tabs defaultValue="configs" className="space-y-6">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="configs">服务配置</TabsTrigger>
							<TabsTrigger value="status">连接状态</TabsTrigger>
							<TabsTrigger value="help">使用说明</TabsTrigger>
						</TabsList>

						{/* 服务配置标签页 */}
						<TabsContent value="configs" className="space-y-6">
							<AIServiceConfigManager onConfigChange={handleConfigChange} />
						</TabsContent>

						{/* 连接状态标签页 */}
						<TabsContent value="status" className="space-y-6">
							{/* 当前活跃配置状态 */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Settings className="h-5 w-5" />
										当前活跃配置
									</CardTitle>
									<CardDescription>
										查看当前使用的AI服务配置状态
									</CardDescription>
								</CardHeader>
								<CardContent>
									{activeConfig ? (
										<div className="space-y-4">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">配置名称:</span>
												<Badge variant="outline">{activeConfig.name}</Badge>
											</div>

											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">服务类型:</span>
												<Badge variant="outline">{activeConfig.type}</Badge>
											</div>

											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">服务地址:</span>
												<code className="text-sm bg-muted px-2 py-1 rounded">
													{activeConfig.baseUrl}
												</code>
											</div>

											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">模型:</span>
												<Badge variant="secondary">{activeConfig.model}</Badge>
											</div>

											{/* 连接测试 */}
											<div className="pt-4">
												<Button
													onClick={handleTestConnection}
													disabled={isTesting}
													variant="outline"
												>
													{isTesting ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															测试中...
														</>
													) : (
														<>
															<TestTube className="mr-2 h-4 w-4" />
															测试连接
														</>
													)}
												</Button>
											</div>

											{/* 测试结果 */}
											{testResult && (
												<Alert variant={testResult.success ? 'default' : 'destructive'}>
													{testResult.success ? (
														<CheckCircle className="h-4 w-4" />
													) : (
														<XCircle className="h-4 w-4" />
													)}
													<AlertDescription>
														{testResult.success ? '连接正常' : `连接失败: ${testResult.error}`}
													</AlertDescription>
												</Alert>
											)}
										</div>
									) : (
										<div className="text-center py-8">
											<Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
											<p className="text-muted-foreground">
												没有可用的AI服务配置，请先添加配置
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* 使用说明标签页 */}
						<TabsContent value="help" className="space-y-6">
							{/* 支持的AI服务 */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Info className="h-5 w-5" />
										支持的AI服务
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<h4 className="font-medium">OpenAI</h4>
											<p className="text-sm text-muted-foreground">
												官方API服务，支持GPT-4、GPT-3.5等模型。
												需要API密钥，按使用量计费。
											</p>
											<div className="text-xs text-muted-foreground">
												<strong>推荐模型:</strong> gpt-4, gpt-3.5-turbo
											</div>
										</div>

										<div className="space-y-2">
											<h4 className="font-medium">Ollama</h4>
											<p className="text-sm text-muted-foreground">
												本地大模型服务，支持多种开源模型。
												免费使用，需要本地部署。
											</p>
											<div className="text-xs text-muted-foreground">
												<strong>推荐模型:</strong> qwen2.5:7b, llama3.1:8b
											</div>
										</div>

										<div className="space-y-2">
											<h4 className="font-medium">Anthropic</h4>
											<p className="text-sm text-muted-foreground">
												Claude API服务，支持Claude-3等模型。
												需要API密钥，按使用量计费。
											</p>
											<div className="text-xs text-muted-foreground">
												<strong>推荐模型:</strong> claude-3-sonnet, claude-3-haiku
											</div>
										</div>

										<div className="space-y-2">
											<h4 className="font-medium">自定义服务</h4>
											<p className="text-sm text-muted-foreground">
												支持自定义AI服务配置。
												适用于私有部署的AI服务。
											</p>
											<div className="text-xs text-muted-foreground">
												<strong>要求:</strong> 兼容OpenAI API格式
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* 快速开始指南 */}
							<Card>
								<CardHeader>
									<CardTitle>快速开始指南</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
												1
											</div>
											<div>
												<h4 className="font-medium">选择AI服务提供商</h4>
												<p className="text-sm text-muted-foreground">
													根据您的需求和预算选择合适的AI服务提供商。
													如果是首次使用，建议从Ollama开始。
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
												2
											</div>
											<div>
												<h4 className="font-medium">配置连接参数</h4>
												<p className="text-sm text-muted-foreground">
													填写服务地址、API密钥（如需要）、选择模型等必要信息。
													可以调整高级参数来优化生成效果。
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
												3
											</div>
											<div>
												<h4 className="font-medium">测试连接</h4>
												<p className="text-sm text-muted-foreground">
													使用"测试连接"功能验证配置是否正确。
													确保能够正常连接到AI服务。
												</p>
											</div>
										</div>

										<div className="flex items-start gap-3">
											<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
												4
											</div>
											<div>
												<h4 className="font-medium">设为活跃配置</h4>
												<p className="text-sm text-muted-foreground">
													将测试通过的配置设为活跃状态。
													系统将使用此配置进行AI问卷生成。
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* 常见问题 */}
							<Card>
								<CardHeader>
									<CardTitle>常见问题</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div>
											<h4 className="font-medium">Q: 如何获取OpenAI API密钥？</h4>
											<p className="text-sm text-muted-foreground">
												A: 访问 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI平台</a>，
												注册账号并创建API密钥。
											</p>
										</div>

										<div>
											<h4 className="font-medium">Q: Ollama服务如何安装和启动？</h4>
											<p className="text-sm text-muted-foreground">
												A: 访问 <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ollama.ai</a> 下载安装包，
												安装后运行 <code className="bg-muted px-1 rounded">ollama serve</code> 启动服务。
											</p>
										</div>

										<div>
											<h4 className="font-medium">Q: 可以同时使用多个AI服务吗？</h4>
											<p className="text-sm text-muted-foreground">
												A: 可以配置多个AI服务，但同一时间只能使用一个活跃配置。
												您可以根据需要随时切换活跃配置。
											</p>
										</div>

										<div>
											<h4 className="font-medium">Q: 如何优化AI生成效果？</h4>
											<p className="text-sm text-muted-foreground">
												A: 调整Temperature（控制随机性）、Top P（控制多样性）等参数。
												对于问卷生成，建议Temperature设置为0.7-0.8。
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	)
} 