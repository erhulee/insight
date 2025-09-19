import { Progress } from '@/components/ui/progress'
import { Download } from 'lucide-react'
import type { PullProgress } from '../../types/ollama.types'

interface ProgressIndicatorProps {
	progress: PullProgress | null
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
	if (!progress) return null

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Download className="h-4 w-4 animate-pulse" />
				<span className="text-sm font-medium">
					{progress.message || '正在下载模型...'}
				</span>
			</div>
			<Progress value={progress.progress} className="w-full" />
			<div className="text-xs text-muted-foreground text-center">
				{Math.round(progress.progress)}%
			</div>
		</div>
	)
}
