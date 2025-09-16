'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
	Loader2,
	Plus,
	Settings,
	TestTube,
	Trash2,
	Edit,
	CheckCircle,
	XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { AI_SERVICE_PROVIDERS } from '@/lib/ai-service-config'
import { trpc } from '@/app/_trpc/client'

interface AIServiceConfigManagerProps {
	onConfigChange?: () => void
}

export function AIServiceConfigManager({
	onConfigChange,
}: AIServiceConfigManagerProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingConfig, setEditingConfig] = useState<any>(null)
	const [isTesting, setIsTesting] = useState(false)
	const [testResult, setTestResult] = useState<{
		success: boolean
		error?: string
	} | null>(null)

	// 使用 TRPC 查询获取配置列表
	const {
		data: configs = [],
		isLoading,
		refetch: refetchConfigs,
	} = trpc.aiConfig.getConfigs.useQuery()

	// 使用 TRPC mutations
	const createConfigMutation = trpc.aiConfig.createConfig.useMutation()
	const updateConfigMutation = trpc.aiConfig.updateConfig.useMutation()
	const deleteConfigMutation = trpc.aiConfig.deleteConfig.useMutation()
	const setActiveConfigMutation = trpc.aiConfig.setActiveConfig.useMutation()
	const testConnectionMutation = trpc.aiConfig.testConnection.useMutation()

	// 表单状态
	const [formData, setFormData] = useState({
		name: '',
		type: 'volcano' as const,
		baseUrl: '',
		apiKey: '',
		model: '',
		repeatPenalty: 1.1,
		isActive: false,
	})

	const handleCreateConfig = () => {
		setEditingConfig(null)
		setFormData({
			name: '',
			type: 'volcano',
			baseUrl: '',
			apiKey: '',
			model: '',
			repeatPenalty: 1.1,
			isActive: false,
		})
		setIsDialogOpen(true)
	}

	const handleEditConfig = (config: any) => {
		setEditingConfig(config)
		setFormData({
			name: config.name,
			type: config.type,
			baseUrl: config.baseUrl,
			apiKey: '', // 不显示真实API密钥
			model: config.model,
			repeatPenalty: config.repeatPenalty || 1.1,
			isActive: config.isActive,
		})
		setIsDialogOpen(true)
	}

	const handleDeleteConfig = async (configId: string) => {
		if (configs.length <= 1) {
			toast.error('至少需要保留一个配置')
			return
		}

		try {
			await deleteConfigMutation.mutateAsync({ id: configId })
			refetchConfigs()
			onConfigChange?.()
			toast.success('配置删除成功')
		} catch (error) {
			toast.error('删除配置失败')
		}
	}

	const handleSetActive = async (configId: string) => {
		try {
			await setActiveConfigMutation.mutateAsync({ id: configId })
			refetchConfigs()
			onConfigChange?.()
			toast.success('活跃配置已更新')
		} catch (error) {
			toast.error('设置活跃配置失败')
		}
	}

	const handleTestConnection = async (config: any) => {
		setIsTesting(true)
		setTestResult(null)

		try {
			const result = await testConnectionMutation.mutateAsync({ id: config.id })
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

	const handleSaveConfig = async () => {
		try {
			if (editingConfig) {
				// 更新配置
				await updateConfigMutation.mutateAsync({
					id: editingConfig.id,
					...formData,
				})
				toast.success('配置更新成功')
			} else {
				// 创建新配置
				await createConfigMutation.mutateAsync(formData)
				toast.success('配置创建成功')
			}

			setIsDialogOpen(false)
			refetchConfigs()
			onConfigChange?.()
		} catch (error) {
			toast.error(editingConfig ? '更新配置失败' : '创建配置失败')
		}
	}

	const getProviderInfo = (type: string) => {
		return AI_SERVICE_PROVIDERS.find((p) => p.type === type)
	}

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span className="ml-2">加载配置中...</span>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			{/* 配置列表 */}
			<Card>
				{configs.length === 0 ? null : (
					<CardHeader>
						<div className="flex items-center justify-between">
							<Button onClick={handleCreateConfig}>
								<Plus className="h-4 w-4 mr-2" />
								添加配置
							</Button>
						</div>
					</CardHeader>
				)}
				<CardContent>
					{configs.length === 0 ? (
						<div className="text-center py-8">
							<Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground mb-4">还没有AI服务配置</p>
							<Button onClick={handleCreateConfig}>
								<Plus className="h-4 w-4 mr-2" />
								创建第一个配置
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							{configs.map((config) => {
								const provider = getProviderInfo(config.type)
								return (
									<Card key={config.id} className="relative">
										<CardContent className="p-4">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-2">
														<h3 className="font-medium">{config.name}</h3>
														{config.isActive && (
															<Badge variant="default">活跃</Badge>
														)}
														<Badge variant="outline">
															{provider?.name || config.type}
														</Badge>
													</div>
													<div className="text-sm text-muted-foreground space-y-1">
														<p>服务地址: {config.baseUrl}</p>
														<p>模型: {config.model}</p>
														<p>重复惩罚: {config.repeatPenalty || 1.1}</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleTestConnection(config)}
														disabled={isTesting}
													>
														{isTesting ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<TestTube className="h-4 w-4" />
														)}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleEditConfig(config)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleSetActive(config.id)}
														disabled={config.isActive}
													>
														{config.isActive ? (
															<CheckCircle className="h-4 w-4" />
														) : (
															'设为活跃'
														)}
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeleteConfig(config.id)}
														disabled={configs.length <= 1}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* 测试结果 */}
			{testResult && (
				<Alert variant={testResult.success ? 'default' : 'destructive'}>
					{testResult.success ? (
						<CheckCircle className="h-4 w-4" />
					) : (
						<XCircle className="h-4 w-4" />
					)}
					<AlertDescription>
						{testResult.success
							? '连接测试成功'
							: `连接测试失败: ${testResult.error}`}
					</AlertDescription>
				</Alert>
			)}

			{/* 配置对话框 */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editingConfig ? '编辑配置' : '创建新配置'}
						</DialogTitle>
						<DialogDescription>
							配置AI服务提供商的连接参数和模型设置
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* 基本信息 */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">配置名称</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder="例如: 我的OpenAI配置"
								/>
							</div>
							<div>
								<Label htmlFor="type">服务类型</Label>
								<Select
									value={formData.type}
									onValueChange={(value: any) => {
										const provider = getProviderInfo(value)
										setFormData({
											...formData,
											type: value,
											baseUrl: provider?.baseUrl || '',
											model: provider?.models[0] || '',
										})
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{AI_SERVICE_PROVIDERS.map((provider) => (
											<SelectItem key={provider.type} value={provider.type}>
												{provider.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* 连接参数 */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="baseUrl">服务地址</Label>
								<Input
									id="baseUrl"
									value={formData.baseUrl}
									onChange={(e) =>
										setFormData({ ...formData, baseUrl: e.target.value })
									}
									placeholder="例如: https://api.openai.com/v1"
								/>
							</div>
							<div>
								<Label htmlFor="apiKey">API密钥</Label>
								<Input
									id="apiKey"
									type="password"
									value={formData.apiKey}
									onChange={(e) =>
										setFormData({ ...formData, apiKey: e.target.value })
									}
									placeholder="输入API密钥"
								/>
							</div>
						</div>

						{/* 模型设置 */}
						<div>
							<Label htmlFor="model">模型名称</Label>
							<Select
								value={formData.model}
								onValueChange={(value) =>
									setFormData({ ...formData, model: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="选择模型" />
								</SelectTrigger>
								<SelectContent>
									{getProviderInfo(formData.type)?.models.map((model) => (
										<SelectItem key={model} value={model}>
											{model}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* 高级参数 - Temperature, Top P, 最大令牌数由后端固定配置 */}

						{/* 活跃配置开关 */}
						<div className="flex items-center space-x-2">
							<Switch
								id="isActive"
								checked={formData.isActive}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, isActive: checked })
								}
							/>
							<Label htmlFor="isActive">设为活跃配置</Label>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							取消
						</Button>
						<Button
							onClick={handleSaveConfig}
							disabled={
								createConfigMutation.isPending || updateConfigMutation.isPending
							}
						>
							{(createConfigMutation.isPending ||
								updateConfigMutation.isPending) && (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							)}
							{editingConfig ? '更新配置' : '创建配置'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
