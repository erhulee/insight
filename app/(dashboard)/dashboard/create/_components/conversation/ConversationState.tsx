'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, Lightbulb } from 'lucide-react'
import { ConversationStateProps } from '../types/conversation'
import { ProgressIndicator } from './ProgressIndicator'

export function ConversationState({
	state,
	collectedInfo,
}: ConversationStateProps) {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<Clock className="h-5 w-5" />
						对话进度
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ProgressIndicator phase={state.phase} progress={state.progress} />

					<Separator />
					<div className="space-y-3">
						<h4 className="font-medium text-sm flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							已收集信息
						</h4>
						<div className="space-y-2">
							{collectedInfo.purpose && (
								<div>
									<span className="text-xs text-muted-foreground">
										问卷目的
									</span>
									<Badge variant="secondary" className="ml-2 text-xs">
										{collectedInfo.purpose}
									</Badge>
								</div>
							)}
							{collectedInfo.targetAudience && (
								<div>
									<span className="text-xs text-muted-foreground">
										目标受众
									</span>
									<Badge variant="secondary" className="ml-2 text-xs">
										{collectedInfo.targetAudience}
									</Badge>
								</div>
							)}
							{collectedInfo.questionTypes && (
								<div>
									<span className="text-xs text-muted-foreground">
										问题类型
									</span>
									<div className="flex flex-wrap gap-1 mt-1">
										{collectedInfo.questionTypes.map((type, index) => (
											<Badge
												key={index}
												variant="secondary"
												className="text-xs"
											>
												{type}
											</Badge>
										))}
									</div>
								</div>
							)}
							{collectedInfo.estimatedTime && (
								<div>
									<span className="text-xs text-muted-foreground">
										预计时长
									</span>
									<Badge variant="secondary" className="ml-2 text-xs">
										{collectedInfo.estimatedTime}
									</Badge>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<Lightbulb className="h-5 w-5" />
						智能建议
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 text-sm">
						<div className="p-3 bg-muted rounded-lg">
							<p className="font-medium mb-1">💡 提示</p>
							<p className="text-muted-foreground">
								详细描述你的需求可以帮助AI生成更精准的问卷
							</p>
						</div>
						<div className="p-3 bg-muted rounded-lg">
							<p className="font-medium mb-1">🎯 建议</p>
							<p className="text-muted-foreground">
								考虑问卷的填写场景和受众特点
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
