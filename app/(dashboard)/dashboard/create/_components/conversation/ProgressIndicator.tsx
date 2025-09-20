'use client'

import { Progress } from '@/components/ui/progress'
import { ProgressIndicatorProps } from '../types/conversation'
import { getPhaseLabel } from '../utils/conversation-utils'

export function ProgressIndicator({ phase, progress }: ProgressIndicatorProps) {
	return (
		<div>
			<div className="flex justify-between text-sm mb-2">
				<span>当前阶段</span>
				<span className="font-medium">{getPhaseLabel(phase)}</span>
			</div>
			<Progress value={progress} className="h-2" />
			<p className="text-xs text-muted-foreground mt-1">{progress}% 完成</p>
		</div>
	)
}
