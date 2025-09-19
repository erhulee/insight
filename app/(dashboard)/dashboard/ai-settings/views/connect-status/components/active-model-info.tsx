import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Star,
	HardDrive,
	Clock,
	Settings,
	CheckCircle,
	XCircle,
	AlertCircle,
} from 'lucide-react'
import { formatModelSize } from '@/lib/utils/model-size'
import type { ActiveModelInfoProps } from '../types/connect-status.types'

export function ActiveModelInfo({
	activeModel,
	ollamaStatus,
	isLoading,
	onManageModels,
	onSetActiveModel,
	onClearActiveModel,
}: ActiveModelInfoProps) {
	if (!activeModel) {
		return (
			<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
				<div className="flex items-center gap-2 mb-2">
					<AlertCircle className="h-4 w-4 text-gray-600" />
					<span className="font-medium text-gray-800 dark:text-gray-200">
						暂无活跃模型
					</span>
				</div>
				<div className="ml-6">
					<p className="text-sm text-muted-foreground mb-3">
						请前往模型管理页面设置活跃模型
					</p>
					<Button variant="outline" size="sm" onClick={onManageModels}>
						<Settings className="w-4 h-4 mr-1" />
						管理模型
					</Button>
				</div>
			</div>
		)
	}

	// 检查模型是否在已安装列表中
	const isModelInstalled = ollamaStatus?.models?.some(
		(model) => model.name === activeModel.modelName,
	)

	// 获取模型状态
	const getModelStatus = () => {
		if (!ollamaStatus?.isAvailable) {
			return { status: 'error', text: '服务不可用', color: 'bg-red-500' }
		}
		if (!isModelInstalled) {
			return { status: 'warning', text: '模型未安装', color: 'bg-yellow-500' }
		}
		return { status: 'ready', text: '就绪', color: 'bg-green-500' }
	}

	const modelStatus = getModelStatus()

	return (
		<div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
			<div className="flex items-center gap-2 mb-2">
				<Star className="h-4 w-4 text-green-600" />
				<span className="font-medium text-green-800 dark:text-green-200">
					当前活跃模型
				</span>
			</div>

			<div className="ml-6 space-y-2">
				{/* 模型名称 */}
				<div className="flex items-center gap-2">
					<HardDrive className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">{activeModel.modelName}</span>
					<Badge variant="default" className="text-xs">
						活跃
					</Badge>
				</div>

				{/* 模型大小 */}
				{activeModel.modelSize && (
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">大小:</span>
						<span className="text-sm font-medium">
							{formatModelSize(activeModel.modelSize)}
						</span>
					</div>
				)}

				{/* 模型状态 */}
				<div className="flex items-center gap-2">
					<div className={`w-2 h-2 rounded-full ${modelStatus.color}`} />
					<span className="text-sm text-muted-foreground">状态:</span>
					<span className="text-sm font-medium">{modelStatus.text}</span>
				</div>

				{/* 更新时间 */}
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground">更新时间:</span>
					<span className="text-sm">
						{new Date(activeModel.updatedAt).toLocaleString()}
					</span>
				</div>

				{/* 操作按钮 */}
				<div className="flex items-center gap-2 pt-2">
					<Button variant="outline" size="sm" onClick={onManageModels}>
						<Settings className="w-4 h-4 mr-1" />
						管理模型
					</Button>

					{onClearActiveModel && (
						<Button
							variant="outline"
							size="sm"
							onClick={onClearActiveModel}
							disabled={isLoading}
						>
							清除活跃
						</Button>
					)}
				</div>

				{/* 状态警告 */}
				{modelStatus.status === 'error' && (
					<div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
						<div className="flex items-center gap-2">
							<XCircle className="h-4 w-4 text-red-600" />
							<span className="text-sm text-red-800 dark:text-red-200">
								Ollama 服务不可用，请检查服务状态
							</span>
						</div>
					</div>
				)}

				{modelStatus.status === 'warning' && (
					<div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
						<div className="flex items-center gap-2">
							<AlertCircle className="h-4 w-4 text-yellow-600" />
							<span className="text-sm text-yellow-800 dark:text-yellow-200">
								模型未安装，请先下载模型
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
