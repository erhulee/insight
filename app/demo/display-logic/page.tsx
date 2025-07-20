'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Settings, Eye, EyeOff, Play, Code, FileText } from 'lucide-react'
import { DisplayLogicConfigurator } from '@/components/survey-editor/display-logic/DisplayLogicConfigurator'
import { SurveyRendererWithLogic } from '@/components/survey/SurveyRendererWithLogic'
import { DisplayLogicConfig } from '@/lib/custom-display-logic'
import { Question } from '@/lib/api-types'

// 示例问题数据
const sampleQuestions: Question[] = [
    {
        id: 'q1',
        type: 'radio',
        title: '您的性别是？',
        description: '请选择您的性别',
        required: true,
        options: [
            { text: '男性', value: 'male' },
            { text: '女性', value: 'female' },
            { text: '其他', value: 'other' }
        ]
    },
    {
        id: 'q2',
        type: 'radio',
        title: '您的年龄段是？',
        description: '请选择您的年龄段',
        required: true,
        options: [
            { text: '18岁以下', value: 'under_18' },
            { text: '18-25岁', value: '18_25' },
            { text: '26-35岁', value: '26_35' },
            { text: '36-50岁', value: '36_50' },
            { text: '50岁以上', value: 'over_50' }
        ]
    },
    {
        id: 'q3',
        type: 'radio',
        title: '您对我们的产品满意度如何？',
        description: '请根据您的使用体验进行评价',
        required: true,
        options: [
            { text: '非常满意', value: 'very_satisfied' },
            { text: '满意', value: 'satisfied' },
            { text: '一般', value: 'neutral' },
            { text: '不满意', value: 'dissatisfied' },
            { text: '非常不满意', value: 'very_dissatisfied' }
        ]
    },
    {
        id: 'q4',
        type: 'text',
        title: '您最喜欢我们产品的哪些方面？',
        description: '请详细描述您喜欢的功能或特点',
        required: false,
        multiline: true,
        placeholder: '请输入您的想法...'
    },
    {
        id: 'q5',
        type: 'checkbox',
        title: '您希望我们增加哪些功能？',
        description: '请选择您希望我们开发的新功能（可多选）',
        required: false,
        options: [
            { text: '移动端应用', value: 'mobile_app' },
            { text: '数据分析功能', value: 'analytics' },
            { text: '多语言支持', value: 'multilingual' },
            { text: 'API接口', value: 'api' },
            { text: '更多模板', value: 'templates' }
        ]
    },
    {
        id: 'q6',
        type: 'rating',
        title: '您会向朋友推荐我们的产品吗？',
        description: '1分表示不会推荐，5分表示强烈推荐',
        required: true,
        maxRating: 5
    },
    {
        id: 'q7',
        type: 'text',
        title: '请留下您的联系方式（可选）',
        description: '如果您希望我们联系您，请留下邮箱或电话',
        required: false,
        placeholder: '邮箱或电话号码'
    }
]

// 示例逻辑配置
const sampleLogicConfig: DisplayLogicConfig = {
    enabled: true,
    rules: [
        {
            id: 'rule_1',
            conditions: [
                {
                    questionId: 'q1',
                    operator: 'equals',
                    value: 'male'
                }
            ],
            operator: 'AND',
            action: 'show',
            targetQuestionId: 'q4'
        },
        {
            id: 'rule_2',
            conditions: [
                {
                    questionId: 'q1',
                    operator: 'equals',
                    value: 'female'
                }
            ],
            operator: 'AND',
            action: 'show',
            targetQuestionId: 'q5'
        },
        {
            id: 'rule_3',
            conditions: [
                {
                    questionId: 'q3',
                    operator: 'equals',
                    value: 'dissatisfied'
                },
                {
                    questionId: 'q3',
                    operator: 'equals',
                    value: 'very_dissatisfied'
                }
            ],
            operator: 'OR',
            action: 'show',
            targetQuestionId: 'q7'
        },
        {
            id: 'rule_4',
            conditions: [
                {
                    questionId: 'q2',
                    operator: 'equals',
                    value: 'under_18'
                }
            ],
            operator: 'AND',
            action: 'hide',
            targetQuestionId: 'q6'
        }
    ]
}

export default function DisplayLogicDemoPage() {
    const [logicConfig, setLogicConfig] = useState<DisplayLogicConfig>(sampleLogicConfig)
    const [currentAnswers, setCurrentAnswers] = useState<Record<string, any>>({})
    const [showDebug, setShowDebug] = useState(false)

    const handleLogicConfigChange = (newConfig: DisplayLogicConfig) => {
        setLogicConfig(newConfig)
    }

    const handleAnswersChange = (answers: Record<string, any>) => {
        setCurrentAnswers(answers)
    }

    const handleSubmit = (answers: Record<string, any>) => {
        console.log('问卷提交:', answers)
        alert('问卷提交成功！请查看控制台查看详细数据。')
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">自定义展示逻辑演示</h1>
                    <p className="text-muted-foreground">
                        参考腾讯问卷的自定义展示逻辑功能，实现基于用户答案的条件显示/隐藏问题
                    </p>
                </div>

                {/* 功能说明 */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            功能特性
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-2">
                                <Eye className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h4 className="font-medium">条件显示</h4>
                                    <p className="text-sm text-muted-foreground">根据用户答案显示特定问题</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <EyeOff className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h4 className="font-medium">条件隐藏</h4>
                                    <p className="text-sm text-muted-foreground">根据用户答案隐藏特定问题</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Code className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h4 className="font-medium">复杂逻辑</h4>
                                    <p className="text-sm text-muted-foreground">支持AND/OR逻辑组合</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 主要内容 */}
                <Tabs defaultValue="preview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            预览体验
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            逻辑配置
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            代码示例
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        问卷预览
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDebug(!showDebug)}
                                        >
                                            {showDebug ? '隐藏' : '显示'}调试信息
                                        </Button>
                                        <Badge variant={logicConfig.enabled ? 'default' : 'secondary'}>
                                            {logicConfig.enabled ? '逻辑已启用' : '逻辑已禁用'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <SurveyRendererWithLogic
                                    questions={sampleQuestions}
                                    logicConfig={logicConfig}
                                    onAnswersChange={handleAnswersChange}
                                    onSubmit={handleSubmit}
                                    showProgress={true}
                                    showLogicDebug={showDebug}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="config" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    逻辑配置器
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DisplayLogicConfigurator
                                    questions={sampleQuestions}
                                    logicConfig={logicConfig}
                                    onConfigChange={handleLogicConfigChange}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="code" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>逻辑配置 JSON</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                                        {JSON.stringify(logicConfig, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>当前答案</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
                                        {JSON.stringify(currentAnswers, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>使用说明</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">1. 配置逻辑规则</h4>
                                    <p className="text-sm text-muted-foreground">
                                        在"逻辑配置"标签页中，您可以添加、编辑和删除逻辑规则。每个规则包含条件、操作类型和目标问题。
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">2. 设置条件</h4>
                                    <p className="text-sm text-muted-foreground">
                                        条件可以基于其他问题的答案，支持多种操作符：等于、不等于、包含、大于、小于、为空等。
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">3. 预览效果</h4>
                                    <p className="text-sm text-muted-foreground">
                                        在"预览体验"标签页中，您可以实时看到逻辑规则的效果。回答问题后，相关问题会根据逻辑规则显示或隐藏。
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="font-medium mb-2">4. 调试信息</h4>
                                    <p className="text-sm text-muted-foreground">
                                        启用调试信息可以查看当前隐藏的问题、可见的问题数量以及所有答案的详细数据。
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 