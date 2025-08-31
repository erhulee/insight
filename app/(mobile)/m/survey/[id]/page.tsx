'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Send, ArrowLeft } from 'lucide-react'
import { Question } from '@/lib/api-types'
import { MobileQuestionRenderer } from '@/components/mobile/mobile-question-renderer'
import { useRouter } from 'next/navigation'

interface SurveyPageProps {
    params: {
        id: string
    }
}

// 模拟问卷数据 - 实际开发时会从API获取
const mockSurvey = {
    id: '1',
    title: '用户体验调研问卷',
    description: '感谢您参与我们的用户体验调研，您的反馈对我们非常重要。',
    questions: [
        {
            id: 'q1',
            type: 'text',
            title: '您使用我们的产品多长时间了？',
            description: '请描述您的使用经验',
            required: true,
            placeholder: '请输入您的使用时长...'
        },
        {
            id: 'q2',
            type: 'select',
            title: '您最常使用我们产品的哪个功能？',
            required: true,
            options: [
                { text: '功能A', value: 'a' },
                { text: '功能B', value: 'b' },
                { text: '功能C', value: 'c' },
                { text: '其他', value: 'other' }
            ]
        },
        {
            id: 'q3',
            type: 'rating',
            title: '您对我们产品的整体满意度如何？',
            required: true,
            maxRating: 5
        },
        {
            id: 'q4',
            type: 'checkbox',
            title: '您希望我们产品增加哪些功能？（可多选）',
            required: false,
            options: [
                { text: '移动端应用', value: 'mobile' },
                { text: '数据分析功能', value: 'analytics' },
                { text: '团队协作功能', value: 'collaboration' },
                { text: 'API接口', value: 'api' }
            ]
        },
        {
            id: 'q5',
            type: 'textarea',
            title: '您对我们产品有什么建议或意见？',
            required: false,
            placeholder: '请详细描述您的建议...',
            multiline: true
        }
    ] as Question[]
}

export default function SurveyPage({ params }: SurveyPageProps) {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    const questions = mockSurvey.questions
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    // 处理答案变化
    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))

        // 清除错误
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
            })
        }
    }

    // 验证当前问题
    const validateCurrentQuestion = (): boolean => {
        if (!currentQuestion.required) return true

        const answer = answers[currentQuestion.id]
        let isValid = true
        const newErrors: Record<string, string> = {}

        if (currentQuestion.type === 'checkbox') {
            if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                isValid = false
                newErrors[currentQuestion.id] = '请至少选择一个选项'
            }
        } else if (currentQuestion.type === 'rating') {
            if (!answer || answer === 0) {
                isValid = false
                newErrors[currentQuestion.id] = '请选择评分'
            }
        } else {
            if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
                isValid = false
                newErrors[currentQuestion.id] = '此问题为必填项'
            }
        }

        setErrors(prev => ({ ...prev, ...newErrors }))
        return isValid
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航 */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
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
                        <h1 className="text-lg font-semibold text-gray-900 truncate">
                            {mockSurvey.title}
                        </h1>
                    </div>
                    <div className="w-10" /> {/* 占位符，保持标题居中 */}
                </div>
            </div>

            {/* 进度条 */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>问题 {currentQuestionIndex + 1} / {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
            </div>

            {/* 问卷描述 */}
            {currentQuestionIndex === 0 && (
                <Card className="mx-4 mt-4">
                    <CardContent className="pt-6">
                        <p className="text-gray-600 text-center leading-relaxed">
                            {mockSurvey.description}
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
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
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
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 ml-2"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            提交问卷
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="flex-1 ml-2"
                        >
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
