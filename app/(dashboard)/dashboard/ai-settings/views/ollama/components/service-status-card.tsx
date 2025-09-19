import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Server, Cpu, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { StatusBadge } from './ui/status-badge'
import { ErrorAlert } from './ui/error-alert'
import type { ServiceStatusCardProps } from '../types/ollama.types'

export function ServiceStatusCard({
	serviceInfo,
	isLoading,
	error,
	onRefresh,
}: ServiceStatusCardProps) {
	const getStatusIcon = (isAvailable: boolean) => {
		return isAvailable ? (
			<CheckCircle className="h-5 w-5 text-green-500" />
		) : (
			<XCircle className="h-5 w-5 text-red-500" />
		)
	}
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Server className="h-5 w-5" />
					Ollama 服务状态
				</CardTitle>
				<CardDescription>本地大模型服务状态和配置信息</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* 服务状态 */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{getStatusIcon(serviceInfo?.isAvailable || false)}
						<span className="font-medium">服务状态</span>
					</div>
					<div className="flex items-center gap-2">
						<StatusBadge isAvailable={serviceInfo?.isAvailable || false} />
						<Button
							variant="outline"
							size="sm"
							onClick={onRefresh}
							disabled={isLoading}
						>
							<RefreshCw
								className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
							/>
						</Button>
					</div>
				</div>

				{/* 系统信息 */}
				{serviceInfo?.systemInfo && (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Cpu className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">系统信息</span>
						</div>
						<div className="ml-6 space-y-1">
							<div className="text-sm">
								<span className="font-medium">版本:</span>{' '}
								{serviceInfo.systemInfo.version}
							</div>
							{serviceInfo.systemInfo.gpu && (
								<div className="text-sm">
									<span className="font-medium">GPU:</span>{' '}
									{serviceInfo.systemInfo.gpu}
								</div>
							)}
						</div>
					</div>
				)}

				{/* 错误信息 */}
				<ErrorAlert error={error} />
			</CardContent>
		</Card>
	)
}
