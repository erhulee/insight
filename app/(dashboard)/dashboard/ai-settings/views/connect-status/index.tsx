import { Button } from '@/components/ui/button'
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
	Loader2,
	CheckCircle,
	XCircle,
	Settings,
	TestTube,
	Sparkles,
} from 'lucide-react'
import { ActiveModelInfo } from './components/active-model-info'
import type { EnhancedConnectionStatusCardProps } from './types/connect-status.types'

export function ConnectionStatusCard({
	activeConfig,
	activeModel,
	mergedConfig,
	ollamaStatus,
	isTesting,
	testResult,
	isLoading,
	error,
	onTestConnection,
	onManageModels,
	onSetActiveModel,
	onClearActiveModel,
}: EnhancedConnectionStatusCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					当前活跃配置
				</CardTitle>
				<CardDescription>查看当前使用的AI服务配置状态</CardDescription>
			</CardHeader>
			<CardContent>
				{mergedConfig ? (
					<div className="space-y-4">
						{/* 配置信息区域 */}
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">配置名称:</span>
								<Badge variant="outline">{mergedConfig.name}</Badge>
							</div>

							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">服务类型:</span>
								<Badge variant="outline">{mergedConfig.type}</Badge>
							</div>

							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">服务地址:</span>
								<code className="text-sm bg-muted px-2 py-1 rounded">
									{mergedConfig.baseUrl}
								</code>
							</div>

							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">模型:</span>
								<Badge variant="secondary">{mergedConfig.model}</Badge>
								{mergedConfig.isActiveModel && (
									<Badge variant="default" className="text-xs">
										活跃模型
									</Badge>
								)}
							</div>
						</div>

						{/* 活跃模型信息区域 */}
						<ActiveModelInfo
							activeModel={activeModel}
							ollamaStatus={ollamaStatus}
							isLoading={isLoading}
							onManageModels={onManageModels}
							onSetActiveModel={onSetActiveModel || undefined}
							onClearActiveModel={onClearActiveModel || undefined}
						/>

						{/* 操作区域 */}
						<div className="pt-4 space-y-3">
							<div className="flex items-center gap-2">
								<Button
									onClick={onTestConnection}
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

								<Button onClick={onManageModels} variant="outline">
									<Settings className="mr-2 h-4 w-4" />
									管理模型
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
										{testResult.success
											? '连接正常'
											: `连接失败: ${testResult.error}`}
									</AlertDescription>
								</Alert>
							)}

							{/* 错误信息 */}
							{error && (
								<Alert variant="destructive">
									<XCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-4">
							没有可用的AI服务配置，请先添加配置
						</p>
						<Button onClick={onManageModels} variant="outline">
							<Settings className="mr-2 h-4 w-4" />
							管理模型
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
