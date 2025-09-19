import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	HardDrive,
	CheckCircle,
	Download,
	Square,
	Play,
	RefreshCw,
	Trash2,
	Star,
} from 'lucide-react'
import { ProgressIndicator } from './ui/progress-indicator'
import type { ModelManagementCardProps } from '../types/ollama.types'
import { formatModelSize } from '@/lib/utils/model-size'
const statusText = {
	ready: '就绪',
	loading: '加载中',
	error: '错误',
	unknown: '未知',
}
const statusColor = {
	ready: 'bg-green-500',
	loading: 'bg-yellow-500',
	error: 'bg-red-500',
	unknown: 'bg-gray-500',
}

export function ModelManagementCard({
	serviceInfo,
	isDownloading,
	progress,
	activeModel,
	onDownloadModel,
	onCancelDownload,
	onSetActiveModel,
}: ModelManagementCardProps) {
	// 模拟已安装模型数据，包含状态信息
	const installedModels =
		serviceInfo?.models?.map((model) => ({
			name: model.name,
			size: model.size, // 保持原始数字格式，用于计算
			sizeFormatted: formatModelSize(model.size), // 格式化后的字符串用于显示
			status: 'ready' as const,
		})) || []

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HardDrive className="h-5 w-5" />
					模型管理
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="installed" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="installed">已安装模型</TabsTrigger>
						<TabsTrigger value="recommended">推荐模型</TabsTrigger>
					</TabsList>

					<TabsContent value="installed" className="space-y-4">
						<div className="space-y-3">
							{installedModels.length > 0 ? (
								installedModels.map((model, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-4 border border-border rounded-lg"
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-3 h-3 rounded-full ${statusColor[model.status]}`}
											/>
											<div>
												<p className="font-medium">{model.name}</p>
												<p className="text-sm text-muted-foreground">
													{model.sizeFormatted}
												</p>
											</div>
											<Badge
												variant={
													model.status === 'ready' ? 'default' : 'secondary'
												}
											>
												{statusText[model.status]}
											</Badge>
										</div>
										<div className="flex items-center gap-2">
											{model.status === 'ready' ? (
												<Button variant="outline" size="sm" onClick={() => {}}>
													<Square className="w-4 h-4 mr-1" />
													停止
												</Button>
											) : (
												<Button variant="outline" size="sm">
													<Play className="w-4 h-4 mr-1" />
													启动
												</Button>
											)}

											{/* 设为活跃按钮 */}
											<Button
												variant={
													activeModel?.modelName === model.name
														? 'default'
														: 'outline'
												}
												size="sm"
												onClick={() => onSetActiveModel(model.name, model.size)}
												disabled={false}
											>
												<Star className="w-4 h-4 mr-1" />
												{activeModel?.modelName === model.name
													? '当前活跃'
													: '设为活跃'}
											</Button>

											<Button variant="outline" size="sm">
												<RefreshCw className="w-4 h-4 mr-1" />
												更新
											</Button>
											<Button variant="outline" size="sm">
												<Trash2 className="w-4 h-4 mr-1" />
												删除
											</Button>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>暂无已安装的模型</p>
									<p className="text-sm">切换到推荐模型标签页下载模型</p>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value="recommended" className="space-y-4">
						<div className="space-y-3">
							{serviceInfo?.recommendedModels
								?.slice(0, 5)
								.map((model: string) => {
									const isInstalled = serviceInfo?.models?.some(
										(m) => m.name === model,
									)
									return (
										<div
											key={model}
											className="flex items-center justify-between p-4 border border-border rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div
													className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-gray-400'}`}
												/>
												<div>
													<p className="font-medium">{model}</p>
													<p className="text-sm text-muted-foreground">
														推荐模型
													</p>
												</div>
												{isInstalled && <Badge variant="default">已安装</Badge>}
											</div>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => onDownloadModel(model)}
													disabled={isInstalled || isDownloading}
												>
													<Download className="w-4 h-4 mr-1" />
													{isInstalled ? '已安装' : '下载'}
												</Button>
											</div>
										</div>
									)
								})}
						</div>
					</TabsContent>
				</Tabs>

				{/* 下载进度 */}
				<ProgressIndicator progress={progress} />
			</CardContent>
		</Card>
	)
}
