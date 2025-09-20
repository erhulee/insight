'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { GeneratedSurvey } from '../types/conversation'

interface SurveyPreviewProps {
	survey: GeneratedSurvey
	onRegenerate: () => void
	onCreate: () => void
	isCreating: boolean
}

export function SurveyPreview({
	survey,
	onRegenerate,
	onCreate,
	isCreating,
}: SurveyPreviewProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>生成结果预览</CardTitle>
				<CardDescription>
					请检查生成的问卷内容，确认无误后点击创建
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">问卷标题</label>
					<p className="text-sm text-muted-foreground">{survey.title}</p>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">问卷描述</label>
					<p className="text-sm text-muted-foreground">{survey.description}</p>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">问题列表</label>
					<div className="space-y-2">
						{survey.questions.map((question, index) => (
							<div key={question.id} className="p-3 border rounded-lg">
								<div className="flex items-start gap-2">
									<Badge variant="secondary" className="text-xs">
										{index + 1}
									</Badge>
									<div className="flex-1">
										<p className="text-sm font-medium">{question.title}</p>
										<p className="text-xs text-muted-foreground">
											类型: {question.type} {question.required && '• 必填'}
										</p>
										{question.description && (
											<p className="text-xs text-muted-foreground mt-1">
												{question.description}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button variant="outline" onClick={onRegenerate} className="flex-1">
					重新生成
				</Button>
				<Button onClick={onCreate} disabled={isCreating} className="flex-1">
					{isCreating ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							创建中...
						</>
					) : (
						'创建问卷'
					)}
				</Button>
			</CardFooter>
		</Card>
	)
}
