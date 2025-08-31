'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, Code } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MobileQuestionRenderer } from '@/components/mobile/mobile-question-renderer'
import { Question } from '@/lib/api-types'

// 演示用的题目数据
const demoQuestions: Question[] = [
    {
        id: 'demo-text',
        type: 'text',
        title: '请输入您的姓名',
        description: '这是单行文本输入题目的示例',
        required: true,
        placeholder: '请输入您的姓名...'
    },
    {
        id: 'demo-textarea',
        type: 'textarea',
        title: '请描述您的使用体验',
        description: '这是多行文本输入题目的示例',
        required: false,
        placeholder: '请详细描述您的使用体验...'
    },
    {
        id: 'demo-select',
        type: 'select',
        title: '您最常使用的功能是？',
        description: '这是下拉选择题目的示例',
        required: true,
        options: [
            { text: '用户管理', value: 'user-management' },
            { text: '数据分析', value: 'data-analysis' },
            { text: '报表生成', value: 'report-generation' },
            { text: '系统设置', value: 'system-settings' }
        ]
    },
    {
        id: 'demo-radio',
        type: 'radio',
        title: '您对我们的产品满意度如何？',
        description: '这是单选题目的示例',
        required: true,
        options: [
            { text: '非常满意', value: 'very-satisfied' },
            { text: '满意', value: 'satisfied' },
            { text: '一般', value: 'neutral' },
            { text: '不满意', value: 'dissatisfied' },
            { text: '非常不满意', value: 'very-dissatisfied' }
        ]
    },
    {
        id: 'demo-checkbox',
        type: 'checkbox',
        title: '您希望我们增加哪些功能？（可多选）',
        description: '这是多选题目的示例',
        required: false,
        options: [
            { text: '移动端应用', value: 'mobile-app' },
            { text: 'API接口', value: 'api' },
            { text: '数据导出', value: 'data-export' },
            { text: '多语言支持', value: 'multi-language' },
            { text: '主题定制', value: 'theme-customization' }
        ]
    },
    {
        id: 'demo-rating',
        type: 'rating',
        title: '请为我们的服务评分',
        description: '这是评分题目的示例',
        required: true,
        maxRating: 5
    },
    {
        id: 'demo-date',
        type: 'date',
        title: '您希望我们何时发布新版本？',
        description: '这是日期选择题目的示例',
        required: false,
        minDate: '2024-01-01',
        maxDate: '2024-12-31'
    },
    {
        id: 'demo-number',
        type: 'number',
        title: '您每天使用我们产品多长时间（小时）？',
        description: '这是数字输入题目的示例',
        required: false,
        placeholder: '请输入小时数...'
    },
    {
        id: 'demo-email',
        type: 'email',
        title: '请输入您的邮箱地址',
        description: '这是邮箱输入题目的示例',
        required: true,
        placeholder: 'example@company.com'
    },
    {
        id: 'demo-phone',
        type: 'phone',
        title: '请输入您的联系电话',
        description: '这是手机号输入题目的示例',
        required: false,
        placeholder: '13800138000'
    }
]

export default function DemoPage() {
    const router = useRouter()
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [showCode, setShowCode] = useState(false)

    const currentQuestion = demoQuestions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / demoQuestions.length) * 100

    // 处理答案变化
    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    // 下一题
    const handleNext = () => {
        if (currentQuestionIndex < demoQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    // 上一题
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    // 返回首页
    const handleBack = () => {
        router.push('/m')
    }

    // 获取当前题目的代码示例
    const getQuestionCode = (question: Question) => {
        return JSON.stringify(question, null, 2)
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
                        <h1 className="text-lg font-semibold text-gray-900">
                            题目类型演示
                        </h1>
                        <p className="text-sm text-gray-600">
                            展示各种题目类型的渲染效果
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCode(!showCode)}
                        className="p-2"
                    >
                        {showCode ? <Eye className="h-5 w-5" /> : <Code className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* 进度条 */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>题目 {currentQuestionIndex + 1} / {demoQuestions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* 题目信息 */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                            {currentQuestion.type}
                        </Badge>
                        {currentQuestion.required && (
                            <Badge variant="destructive" className="text-xs">
                                必填
                            </Badge>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">
                        {currentQuestionIndex + 1} / {demoQuestions.length}
                    </span>
                </div>
            </div>

            {/* 当前题目 */}
            <div className="px-4 py-6">
                <MobileQuestionRenderer
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                />
            </div>

            {/* 代码示例 */}
            {showCode && (
                <div className="px-4 pb-6">
                    <Card className="bg-gray-900 text-gray-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-300">题目数据结构</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs overflow-auto">
                                <code>{getQuestionCode(currentQuestion)}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 底部导航 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="flex-1 mr-2"
                    >
                        上一题
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={currentQuestionIndex === demoQuestions.length - 1}
                        className="flex-1 ml-2"
                    >
                        下一题
                    </Button>
                </div>
            </div>

            {/* 底部安全区域 */}
            <div className="h-20" />

            {/* 答案预览 */}
            {Object.keys(answers).length > 0 && (
                <div className="px-4 pb-6">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-800">当前答案</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs text-blue-700 overflow-auto">
                                <code>{JSON.stringify(answers, null, 2)}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
