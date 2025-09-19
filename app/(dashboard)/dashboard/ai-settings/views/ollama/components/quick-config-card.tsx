import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi } from 'lucide-react'
import type { QuickConfigCardProps } from '../types/ollama.types'

export function QuickConfigCard({
	serviceInfo,
	isDownloading,
	onAutoConfig,
	onConfigChange,
}: QuickConfigCardProps) {
	const handleAutoConfig = async () => {
		try {
			const config = await onAutoConfig()
			onConfigChange(config)
		} catch (error) {
			console.error('自动配置失败:', error)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Wifi className="h-5 w-5" />
					快速配置
				</CardTitle>
				<CardDescription>一键配置Ollama服务，自动下载推荐模型</CardDescription>
			</CardHeader>
			<CardContent>
				<Button
					onClick={handleAutoConfig}
					disabled={!serviceInfo?.isAvailable || isDownloading}
					className="w-full"
				>
					{serviceInfo?.isAvailable ? '一键配置' : '服务不可用'}
				</Button>
				<div className="mt-2 text-xs text-muted-foreground text-center">
					将自动下载推荐模型并配置服务
				</div>
			</CardContent>
		</Card>
	)
}
