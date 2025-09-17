import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Loader2,
	Plus,
	Settings,
	TestTube,
	Trash2,
	Edit,
	CheckCircle,
} from 'lucide-react'
import { AIConfig, ServiceProvider } from '@/hooks/ai-config'

interface AIConfigListProps {
	configs: AIConfig[]
	serviceProviders: ServiceProvider[]
	isLoading: boolean
	isTesting: boolean
	onCreateConfig: () => void
	onEditConfig: (config: AIConfig) => void
	onDeleteConfig: (configId: string) => void
	onSetActive: (configId: string) => void
	onTestConnection: (config: AIConfig) => void
	getProviderInfo: (type: string) => ServiceProvider | undefined
}

export function AIConfigList({
	configs,
	serviceProviders,
	isLoading,
	isTesting,
	onCreateConfig,
	onEditConfig,
	onDeleteConfig,
	onSetActive,
	onTestConnection,
	getProviderInfo,
}: AIConfigListProps) {
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
		<Card>
			{configs.length === 0 ? null : (
				<CardHeader>
					<div className="flex items-center justify-between">
						<Button onClick={onCreateConfig}>
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
						<Button onClick={onCreateConfig}>
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
													onClick={() => onTestConnection(config)}
													disabled={isTesting}
													title="测试连接"
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
													onClick={() => onEditConfig(config)}
													title="编辑配置"
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => onSetActive(config.id)}
													disabled={config.isActive}
													title={
														config.isActive ? '当前活跃配置' : '设为活跃配置'
													}
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
													onClick={() => onDeleteConfig(config.id)}
													disabled={configs.length <= 1}
													title={
														configs.length <= 1
															? '至少需要保留一个配置'
															: '删除配置'
													}
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
	)
}
