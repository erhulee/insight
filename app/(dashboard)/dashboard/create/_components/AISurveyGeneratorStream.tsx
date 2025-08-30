'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Eye, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'

export default function AISurveyGeneratorStream() {
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [generatedSurvey, setGeneratedSurvey] = useState<any>(null)
    const [isPreviewMode, setIsPreviewMode] = useState(false)

    const router = useRouter()
    const abortControllerRef = useRef<AbortController | null>(null)

    const createSurveyMutation = trpc.CreateSurvey.useMutation()

    // 示例提示词
    const examplePrompts = [
        '创建一个客户满意度调查问卷',
        '设计一个员工工作环境调查',
        '制作一个市场调研问卷',
        '创建一个活动反馈问卷'
    ]

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('请输入问卷描述')
            return
        }

        setIsGenerating(true)
        setStreamingContent('')
        setGeneratedSurvey(null)
        setIsPreviewMode(false)

        try {
            // 创建AbortController用于取消请求
            abortControllerRef.current = new AbortController()

            // 使用fetch直接调用SSE端点
            const response = await fetch('/api/ai/generate-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt.trim() }),
                signal: abortControllerRef.current.signal
            })

            if (!response.ok) {
                throw new Error('生成失败')
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('无法读取响应流')
            }

            let fullContent = ''

            while (true) {
                const { done, value } = await reader.read()

                if (done) break

                // 解析SSE数据
                const chunk = new TextDecoder().decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') {
                            // 流结束，解析完整内容
                            try {
                                const survey = parseAIResponse(fullContent, prompt)
                                setGeneratedSurvey(survey)
                                setIsPreviewMode(true)
                                toast.success('生成完成！')
                            } catch (error) {
                                console.error('解析失败:', error)
                                toast.error('解析生成内容失败')
                            }
                            return
                        } else {
                            // 添加内容到流
                            fullContent += data
                            setStreamingContent(fullContent)
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                toast.info('生成已取消')
            } else {
                console.error('生成失败:', error)
                toast.error('生成失败，请重试')
            }
        } finally {
            setIsGenerating(false)
            abortControllerRef.current = null
        }
    }

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
    }

    const handleCreateSurvey = async () => {
        if (!generatedSurvey) return

        try {
            console.log("generatedSurvey.questions:", generatedSurvey.questions)
            const result = await createSurveyMutation.mutateAsync({
                name: generatedSurvey.title,
                description: generatedSurvey.description,
                questions: generatedSurvey.questions
            })

            toast.success('问卷创建成功！')
            router.push(`/dashboard/edit/${result.id}`)
        } catch (error) {
            console.error('创建问卷失败:', error)
            toast.error('创建问卷失败')
        }
    }

    // 解析AI响应
    const parseAIResponse = (aiResponse: string, originalPrompt: string) => {
        try {
            // 处理可能的markdown代码块格式
            let jsonStr = aiResponse

            // 移除 ```json 和 ``` 标记
            jsonStr = jsonStr.replace(/```json\s*\n?/g, '')
            jsonStr = jsonStr.replace(/```\s*$/g, '')

            // 移除开头和结尾的空白字符
            jsonStr = jsonStr.trim()

            const parsed = JSON.parse(jsonStr)

            // 验证和清理数据
            const survey = {
                title: parsed.title || '问卷调查',
                description: parsed.description || `基于"${originalPrompt}"生成的问卷`,
                questions: []
            }

            // 处理问题数组
            if (Array.isArray(parsed.questions)) {
                survey.questions = parsed.questions.map((q: any, index: number) => ({
                    id: q.id || `q_${index + 1}`,
                    type: q.type || 'single',
                    title: q.title || `问题${index + 1}`,
                    description: q.description || '',
                    required: q.required !== undefined ? q.required : true,
                    pageSize: q.pageSize || 1,
                    props: q.props || {}
                }))
            }

            return survey
        } catch (error) {
            console.error('Failed to parse AI response:', error)
            throw error
        }
    }

    return (
        <div className="space-y-6">
            {/* 输入区域 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI 问卷生成
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="ai-prompt" className="text-sm font-medium">
                            描述您想要的问卷
                        </label>
                        <Textarea
                            id="ai-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="例如：创建一个客户满意度调查问卷，包含产品体验、服务质量和改进建议..."
                            rows={3}
                            disabled={isGenerating}
                        />
                    </div>

                    {/* 示例提示词 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            示例提示词
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {examplePrompts.map((example, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-primary/10"
                                    onClick={() => !isGenerating && setPrompt(example)}
                                >
                                    {example}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="flex-1"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    生成问卷
                                </>
                            )}
                        </Button>

                        {isGenerating && (
                            <Button onClick={handleCancel} variant="outline">
                                取消
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 流式输出显示 */}
            {isGenerating && streamingContent && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            正在生成...
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm whitespace-pre-wrap font-mono">
                                {streamingContent}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 生成结果预览 */}
            {generatedSurvey && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                生成结果预览
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {isPreviewMode ? '隐藏预览' : '显示预览'}
                                </Button>
                                <Button
                                    onClick={handleCreateSurvey}
                                    disabled={createSurveyMutation.isPending}
                                >
                                    {createSurveyMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            创建中...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            创建问卷
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isPreviewMode ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">问卷标题</label>
                                    <p className="text-sm text-muted-foreground">{generatedSurvey.title}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">问卷描述</label>
                                    <p className="text-sm text-muted-foreground">{generatedSurvey.description}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">问题列表 ({generatedSurvey.questions?.length || 0} 个问题)</label>
                                    <div className="space-y-2 mt-2">
                                        {generatedSurvey.questions?.map((question: any, index: number) => (
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
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                点击"显示预览"查看生成的问卷内容
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 