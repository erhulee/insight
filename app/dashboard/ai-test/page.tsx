'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TestTube } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'

export default function AITestPage() {
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<any>(null)

    const generateMutation = trpc.GenerateAISurvey.useMutation()
    const statusQuery = trpc.GetOllamaStatus.useQuery()

    const handleTestGeneration = async () => {
        if (!prompt.trim()) {
            toast.error('请输入测试提示词')
            return
        }

        setIsGenerating(true)
        try {
            const survey = await generateMutation.mutateAsync({
                prompt: prompt.trim()
            })
            setResult(survey)
            toast.success('生成成功！')
        } catch (error) {
            toast.error('生成失败，请检查Ollama服务')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCheckStatus = async () => {
        try {
            await statusQuery.refetch()
            const status = statusQuery.data
            if (status?.available) {
                toast.success(`Ollama服务正常，当前模型: ${status.currentModel}`)
            } else {
                toast.error('Ollama服务不可用')
            }
        } catch (error) {
            toast.error('检查状态失败')
        }
    }

    const examplePrompts = [
        '创建一个简单的客户满意度调查',
        '设计一个员工工作环境问卷',
        '制作一个产品需求调研',
        '创建一个活动反馈问卷'
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="border-b">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-medium">AI 功能测试</h1>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* 状态检查 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TestTube className="h-5 w-5" />
                                服务状态检查
                            </CardTitle>
                            <CardDescription>
                                检查Ollama服务是否正常运行
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleCheckStatus} variant="outline">
                                检查服务状态
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 测试生成 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>AI 问卷生成测试</CardTitle>
                            <CardDescription>
                                测试AI问卷生成功能，输入描述生成问卷
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="test-prompt" className="text-sm font-medium">
                                    测试提示词
                                </label>
                                <Textarea
                                    id="test-prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="输入问卷描述进行测试..."
                                    rows={3}
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
                                            onClick={() => setPrompt(example)}
                                        >
                                            {example}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleTestGeneration}
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
                                        <TestTube className="mr-2 h-4 w-4" />
                                        测试生成
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 生成结果 */}
                    {result && (
                        <Card>
                            <CardHeader>
                                <CardTitle>生成结果</CardTitle>
                                <CardDescription>
                                    查看AI生成的问卷内容
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">问卷标题</label>
                                        <p className="text-sm text-muted-foreground">{result.title}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">问卷描述</label>
                                        <p className="text-sm text-muted-foreground">{result.description}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">问题数量</label>
                                        <p className="text-sm text-muted-foreground">{result.questions?.length || 0} 个问题</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">问题列表</label>
                                        <div className="space-y-2 mt-2">
                                            {result.questions?.map((question: any, index: number) => (
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
                            </CardContent>
                        </Card>
                    )}

                    {/* 使用说明 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>使用说明</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <p><strong>测试步骤：</strong></p>
                                <ol className="list-decimal list-inside space-y-1 mt-2">
                                    <li>确保Ollama服务正在运行</li>
                                    <li>点击"检查服务状态"验证连接</li>
                                    <li>输入问卷描述或选择示例提示词</li>
                                    <li>点击"测试生成"查看结果</li>
                                </ol>

                                <p className="mt-4"><strong>故障排除：</strong></p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>如果服务不可用，请启动Ollama：<code className="bg-gray-100 px-1 rounded">ollama serve</code></li>
                                    <li>如果模型未下载，请运行：<code className="bg-gray-100 px-1 rounded">ollama pull qwen2.5:7b</code></li>
                                    <li>如果生成失败，请检查网络连接和模型状态</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
} 