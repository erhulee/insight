'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'
interface GeneratedSurvey {
    title: string
    description: string
    questions: any[]
}

export function AISurveyGenerator() {
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedSurvey, setGeneratedSurvey] = useState<GeneratedSurvey | null>(null)

    const createMutation = trpc.CreateSurvey.useMutation()
    const generateAISurveyMutation = trpc.GenerateAISurvey.useMutation()

    const handleGenerateSurvey = async () => {
        if (!prompt.trim()) {
            toast.error('请输入问卷描述')
            return
        }

        setIsGenerating(true)
        try {
            const result = await generateAISurveyMutation.mutateAsync({
                prompt: prompt.trim()
            })

            if (result) {
                setGeneratedSurvey(result)
                toast.success('问卷生成成功！')
            }
        } catch (error) {
            toast.error('生成失败，请重试')
            console.error('AI生成问卷失败:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCreateSurvey = async () => {
        if (!generatedSurvey) return
        try {
            const survey = await createMutation.mutateAsync({
                name: generatedSurvey.title,
                description: generatedSurvey.description,
                questions: generatedSurvey.questions
            })

            if (survey) {
                toast.success('问卷创建成功！')
                window.location.href = `/dashboard/edit/${survey.id}`
            }
        } catch (error) {
            toast.error('创建失败')
            console.error('创建问卷失败:', error)
        }
    }

    const examplePrompts = [
        '创建一个客户满意度调查问卷，包含产品体验、服务质量和改进建议',
        '设计一个员工工作环境调查，了解工作满意度、团队协作和职业发展需求',
        '制作一个市场调研问卷，调查用户对新产品的需求和购买意愿',
        '创建一个活动反馈问卷，收集参与者对活动组织和内容的评价'
    ]

    return (
        <div className="space-y-6">
            {/* 输入区域 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI 智能生成
                    </CardTitle>
                    <CardDescription>
                        用自然语言描述您想要的问卷，AI将为您自动生成问卷内容
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="text-sm font-medium">
                            问卷描述 <span className="text-destructive">*</span>
                        </label>
                        <Textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="例如：创建一个客户满意度调查问卷，包含产品体验、服务质量和改进建议..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* 示例提示 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            示例提示
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {examplePrompts.map((example, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10"
                                    onClick={() => setPrompt(example)}
                                >
                                    {example}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleGenerateSurvey}
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                生成中...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                生成问卷
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* 生成结果预览 */}
            {generatedSurvey && (
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
                            <p className="text-sm text-muted-foreground">{generatedSurvey.title}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">问卷描述</label>
                            <p className="text-sm text-muted-foreground">{generatedSurvey.description}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">问题列表</label>
                            <div className="space-y-2">
                                {generatedSurvey.questions.map((question, index) => (
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
                        <Button
                            variant="outline"
                            onClick={() => setGeneratedSurvey(null)}
                            className="flex-1"
                        >
                            重新生成
                        </Button>
                        <Button
                            onClick={handleCreateSurvey}
                            disabled={createMutation.isPending}
                            className="flex-1"
                        >
                            {createMutation.isPending ? (
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
            )}
        </div>
    )
} 