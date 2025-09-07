'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff } from 'lucide-react'
import { Question } from '@/lib/api-types'
import { useDisplayLogic } from '@/hooks/use-display-logic'
import { DisplayLogicConfig } from '@/lib/custom-display-logic'
import { MuiQuestionList } from '@/components/survey/MuiQuestionList'

interface SurveyRendererWithLogicProps {
	questions: Question[]
	logicConfig: DisplayLogicConfig
	onAnswersChange?: (answers: Record<string, any>) => void
	onSubmit?: (answers: Record<string, any>) => void
	showProgress?: boolean
	showLogicDebug?: boolean
}

export function SurveyRendererWithLogic({
	questions,
	logicConfig,
	onAnswersChange,
	onSubmit,
	showProgress = true,
	showLogicDebug = false,
}: SurveyRendererWithLogicProps) {
	const {
		answers,
		isQuestionVisible,
		getVisibleQuestions,
		updateAnswers,
		updateAnswersBatch,
		resetAnswers,
		getHiddenQuestionIds,
		updateLogicConfig,
	} = useDisplayLogic(questions)

	const [errors, setErrors] = useState<Record<string, string>>({})

	// 获取可见的问题
	const visibleQuestions = getVisibleQuestions()
	const hiddenQuestionIds = getHiddenQuestionIds()

	// 处理答案变化
	const handleAnswerChange = useCallback(
		(questionId: string, value: any) => {
			updateAnswers(questionId, value)
			onAnswersChange?.(answers)

			// 清除该问题的错误
			if (errors[questionId]) {
				setErrors((prev) => {
					const newErrors = { ...prev }
					delete newErrors[questionId]
					return newErrors
				})
			}
		},
		[updateAnswers, onAnswersChange, answers, errors],
	)

	// 同步外部逻辑配置到 hook 内部
	useEffect(() => {
		updateLogicConfig(logicConfig)
	}, [logicConfig, updateLogicConfig])

	// 如果没有可见问题
	if (visibleQuestions.length === 0) {
		return (
			<div className="text-center py-8">
				<EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
				<p className="text-muted-foreground">当前没有可见的问题</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* 调试信息 */}
			{showLogicDebug && (
				<Card className="bg-muted/50">
					<CardHeader>
						<CardTitle className="text-sm">逻辑调试信息</CardTitle>
					</CardHeader>
					<CardContent className="text-xs space-y-2">
						<div>
							<strong>隐藏的问题:</strong>{' '}
							{hiddenQuestionIds.join(', ') || '无'}
						</div>
						<div>
							<strong>可见的问题:</strong> {visibleQuestions.length} 个
						</div>
						<div>
							<strong>当前答案:</strong>
							<pre className="mt-1 bg-background p-2 rounded text-xs overflow-auto">
								{JSON.stringify(answers, null, 2)}
							</pre>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 渲染所有可见问题（列表模式，使用 MUI 组件） */}
			<MuiQuestionList
				questions={visibleQuestions}
				answers={answers}
				errors={errors}
				isQuestionVisible={isQuestionVisible}
				onAnswerChange={(id, val) => handleAnswerChange(id, val)}
			/>

			{/* 逻辑状态指示器 */}
			{logicConfig.enabled && (
				<div className="mt-4 p-3 bg-muted/30 rounded-lg">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Badge variant="outline" className="text-xs">
							<Eye className="h-3 w-3 mr-1" />
							逻辑已启用
						</Badge>
						<span>•</span>
						<span>{visibleQuestions.length} 个可见问题</span>
						<span>•</span>
						<span>{hiddenQuestionIds.length} 个隐藏问题</span>
					</div>
				</div>
			)}
		</div>
	)
}
