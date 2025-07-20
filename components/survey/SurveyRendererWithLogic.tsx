'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { Question } from '@/lib/api-types'
import { useDisplayLogic } from '@/hooks/use-display-logic'
import { DisplayLogicConfig } from '@/lib/custom-display-logic'

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
    showLogicDebug = false
}: SurveyRendererWithLogicProps) {
    const {
        answers,
        isQuestionVisible,
        getVisibleQuestions,
        updateAnswers,
        updateAnswersBatch,
        resetAnswers,
        getHiddenQuestionIds
    } = useDisplayLogic(questions)

    const [currentPage, setCurrentPage] = useState(0)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // 获取可见的问题
    const visibleQuestions = getVisibleQuestions()
    const hiddenQuestionIds = getHiddenQuestionIds()

    // 计算进度
    const progress = visibleQuestions.length > 0 ? ((currentPage + 1) / visibleQuestions.length) * 100 : 0

    // 处理答案变化
    const handleAnswerChange = useCallback((questionId: string, value: any) => {
        updateAnswers(questionId, value)
        onAnswersChange?.(answers)

        // 清除该问题的错误
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
            })
        }
    }, [updateAnswers, onAnswersChange, answers, errors])

    // 验证当前页面
    const validateCurrentPage = useCallback(() => {
        const currentQuestion = visibleQuestions[currentPage]
        if (!currentQuestion) return true

        const newErrors: Record<string, string> = {}

        if (currentQuestion.required) {
            const answer = answers[currentQuestion.id]
            if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                newErrors[currentQuestion.id] = '此问题为必填项'
            }
        }

        setErrors(prev => ({ ...prev, ...newErrors }))
        return Object.keys(newErrors).length === 0
    }, [visibleQuestions, currentPage, answers])

    // 下一页
    const handleNext = useCallback(() => {
        if (validateCurrentPage()) {
            if (currentPage < visibleQuestions.length - 1) {
                setCurrentPage(currentPage + 1)
            } else {
                // 最后一页，提交问卷
                handleSubmit()
            }
        }
    }, [currentPage, visibleQuestions.length, validateCurrentPage])

    // 上一页
    const handlePrevious = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
        }
    }, [currentPage])

    // 提交问卷
    const handleSubmit = useCallback(() => {
        if (validateCurrentPage()) {
            onSubmit?.(answers)
        }
    }, [validateCurrentPage, onSubmit, answers])

    // 渲染问题
    const renderQuestion = useCallback((question: Question) => {
        const isVisible = isQuestionVisible(question.id)
        const hasError = errors[question.id]

        if (!isVisible) return null

        const renderInput = () => {
            switch (question.type) {
                case 'text':
                    return (
                        <div className="space-y-2">
                            {question.multiline ? (
                                <Textarea
                                    id={question.id}
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    placeholder={question.placeholder || '请输入...'}
                                    rows={5}
                                    className={hasError ? 'border-destructive' : ''}
                                />
                            ) : (
                                <Input
                                    id={question.id}
                                    type="text"
                                    value={answers[question.id] || ''}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    placeholder={question.placeholder || '请输入...'}
                                    className={hasError ? 'border-destructive' : ''}
                                />
                            )}
                        </div>
                    )

                case 'radio':
                    return (
                        <div className="space-y-2">
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id={`${question.id}-${index}`}
                                        name={question.id}
                                        value={option.value || option.text}
                                        checked={answers[question.id] === (option.value || option.text)}
                                        onChange={() => handleAnswerChange(question.id, option.value || option.text)}
                                        className="h-4 w-4 text-primary"
                                    />
                                    <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                                        {option.text}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )

                case 'checkbox':
                    return (
                        <div className="space-y-2">
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`${question.id}-${index}`}
                                        value={option.value || option.text}
                                        checked={(answers[question.id] || []).includes(option.value || option.text)}
                                        onChange={(e) => {
                                            const currentValues = answers[question.id] || []
                                            const newValues = e.target.checked
                                                ? [...currentValues, option.value || option.text]
                                                : currentValues.filter((v: any) => v !== (option.value || option.text))
                                            handleAnswerChange(question.id, newValues)
                                        }}
                                        className="h-4 w-4 text-primary rounded"
                                    />
                                    <label htmlFor={`${question.id}-${index}`} className="text-sm cursor-pointer">
                                        {option.text}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )

                case 'dropdown':
                    return (
                        <div className="space-y-2">
                            <select
                                id={question.id}
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-destructive' : 'border-input'
                                    }`}
                            >
                                <option value="">请选择...</option>
                                {question.options?.map((option, index) => (
                                    <option key={index} value={option.value || option.text}>
                                        {option.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )

                case 'rating':
                    return (
                        <div className="space-y-2">
                            <div className="flex space-x-2">
                                {Array.from({ length: question.maxRating || 5 }).map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleAnswerChange(question.id, index + 1)}
                                        className={`w-10 h-10 rounded-md flex items-center justify-center border ${answers[question.id] === index + 1
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background hover:bg-muted'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )

                case 'date':
                    return (
                        <div className="space-y-2">
                            <Input
                                id={question.id}
                                type="date"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                min={question.minDate}
                                max={question.maxDate}
                                className={hasError ? 'border-destructive' : ''}
                            />
                        </div>
                    )

                default:
                    return (
                        <div className="text-sm text-muted-foreground">
                            不支持的问题类型: {question.type}
                        </div>
                    )
            }
        }

        return (
            <Card key={question.id} className={hasError ? 'border-destructive' : ''}>
                <CardHeader className="pb-2">
                    <div className="flex items-start gap-1">
                        <CardTitle className="text-base">
                            {question.title}
                            {question.required && <span className="text-destructive ml-1">*</span>}
                        </CardTitle>
                    </div>
                    {question.description && (
                        <p className="text-sm text-muted-foreground">{question.description}</p>
                    )}
                </CardHeader>
                <CardContent>
                    {renderInput()}
                    {hasError && (
                        <p className="text-destructive text-sm mt-2">{hasError}</p>
                    )}
                </CardContent>
            </Card>
        )
    }, [answers, errors, handleAnswerChange, isQuestionVisible])

    // 如果没有可见问题
    if (visibleQuestions.length === 0) {
        return (
            <div className="text-center py-8">
                <EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">当前没有可见的问题</p>
            </div>
        )
    }

    const currentQuestion = visibleQuestions[currentPage]

    return (
        <div className="space-y-6">
            {/* 进度条 */}
            {showProgress && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>问题 {currentPage + 1} / {visibleQuestions.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                </div>
            )}

            {/* 调试信息 */}
            {showLogicDebug && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-sm">逻辑调试信息</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                        <div>
                            <strong>隐藏的问题:</strong> {hiddenQuestionIds.join(', ') || '无'}
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

            {/* 当前问题 */}
            {renderQuestion(currentQuestion)}

            {/* 导航按钮 */}
            <div className="flex justify-between items-center pt-4">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    上一题
                </Button>

                <div className="flex items-center gap-2">
                    {currentPage === visibleQuestions.length - 1 ? (
                        <Button onClick={handleSubmit} className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            提交问卷
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="flex items-center gap-2">
                            下一题
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

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