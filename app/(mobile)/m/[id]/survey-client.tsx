'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Send, ArrowLeft } from 'lucide-react'
import { MobileQuestionRenderer } from '@/components/mobile/mobile-question-renderer'
import type { Question } from '@/lib/api-types'
import { SurveyCover } from './survey-cover'

interface SurveyClientProps {
	survey: {
		id: string
		name: string
		description?: string
		questions: Question[]
		// 封面配置字段
		estimatedTime?: string
		coverDescription?: string
		privacyNotice?: string
		bottomNotice?: string
		coverIcon?: string
		coverColor?: string
		showProgressInfo?: boolean
		showPrivacyNotice?: boolean
	}
}

export function SurveyClient({ survey }: SurveyClientProps) {
	const [showQuestions, setShowQuestions] = React.useState(false)
	const router = useRouter()
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [answers, setAnswers] = useState<Record<string, any>>({})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const questions = survey.questions
	const currentQuestion = questions[currentQuestionIndex]
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100

	// 处理答案变化
	const handleAnswerChange = (questionId: string, value: any) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: value,
		}))

		// 清除错误
		if (errors[questionId]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[questionId]
				return newErrors
			})
		}
	}

	// 验证当前问题
	const validateCurrentQuestion = (): boolean => {
		if (!currentQuestion) return false

		// 必填项验证
		if (currentQuestion.required) {
			const answer = answers[currentQuestion.id]
			if (!answer || (Array.isArray(answer) && answer.length === 0)) {
				setErrors((prev) => ({
					...prev,
					[currentQuestion.id]: '此题为必填项',
				}))
				return false
			}
		}

		// 清除错误
		if (errors[currentQuestion.id]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[currentQuestion.id]
				return newErrors
			})
		}

		return true
	}

	// 下一题
	const handleNext = () => {
		if (validateCurrentQuestion()) {
			if (currentQuestionIndex < questions.length - 1) {
				setCurrentQuestionIndex(currentQuestionIndex + 1)
			} else {
				handleSubmit()
			}
		}
	}

	// 上一题
	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1)
		}
	}

	// 提交问卷
	const handleSubmit = () => {
		if (validateCurrentQuestion()) {
			console.log('提交答案:', answers)
			// TODO: 实际开发时调用API提交答案
			alert('问卷提交成功！')
		}
	}

	// 返回上一页
	const handleBack = () => {
		router.back()
	}

	if (!currentQuestion) {
		return (
			<div className="min-h-screen bg-muted flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">问卷加载失败</p>
				</div>
			</div>
		)
	}

	const handleStartSurvey = () => {
		setShowQuestions(true)
	}

	// 如果还没开始，显示封面
	if (!showQuestions) {
		return <SurveyCover survey={survey} onStart={handleStartSurvey} />
	}

	return (
		<div className="min-h-screen bg-background">
			{/* 顶部导航 */}
			<div className="bg-card border-b border-border px-4 py-3">
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleBack}
						className="p-2"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="text-center flex-1">
						<h1 className="text-lg font-semibold text-foreground truncate">
							{survey.name}
						</h1>
					</div>
					<div className="w-10" /> {/* 占位符，保持标题居中 */}
				</div>
			</div>

			{/* 进度条 */}
			<div className="bg-card px-4 py-3 border-b border-border">
				<div className="flex justify-between text-sm text-muted-foreground mb-2">
					<span>
						问题 {currentQuestionIndex + 1} / {questions.length}
					</span>
					<span>{Math.round(progress)}%</span>
				</div>
				<Progress value={progress} className="w-full" />
			</div>

			{/* 问卷描述 */}
			{currentQuestionIndex === 0 && survey.description && (
				<Card className="mx-4 mt-4">
					<CardContent className="pt-6">
						<p className="text-muted-foreground text-center leading-relaxed">
							{survey.description}
						</p>
					</CardContent>
				</Card>
			)}

			{/* 当前问题 */}
			<div className="px-4 py-6">
				<MobileQuestionRenderer
					question={currentQuestion}
					value={answers[currentQuestion.id]}
					onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
					error={errors[currentQuestion.id]}
				/>
			</div>

			{/* 底部导航 */}
			<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3">
				<div className="flex justify-between items-center">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={currentQuestionIndex === 0}
						className="flex-1 mr-2"
					>
						<ChevronLeft className="h-4 w-4 mr-2" />
						上一题
					</Button>

					{currentQuestionIndex === questions.length - 1 ? (
						<Button onClick={handleSubmit} className="flex-1 ml-2">
							<Send className="h-4 w-4 mr-2" />
							提交问卷
						</Button>
					) : (
						<Button onClick={handleNext} className="flex-1 ml-2">
							下一题
							<ChevronRight className="h-4 w-4 ml-2" />
						</Button>
					)}
				</div>
			</div>

			{/* 底部安全区域 */}
			<div className="h-20" />
		</div>
	)
}
