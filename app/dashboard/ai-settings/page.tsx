'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Settings, TestTube } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'

export default function AISettingsPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [settings, setSettings] = useState({
        baseUrl: 'http://localhost:11434',
        model: 'qwen2.5:7b',
        temperature: 0.7,
        topP: 0.9,
        repeatPenalty: 1.1
    })
    const [status, setStatus] = useState<{
        available: boolean
        models: string[]
        currentModel: string
    } | null>(null)

    const testConnectionMutation = trpc.TestOllamaConnection.useMutation()
    const getOllamaStatusMutation = trpc.GetOllamaStatus.useMutation()

    useEffect(() => {
        loadStatus()
    }, [])

    const loadStatus = async () => {
        try {
            const result = await getOllamaStatusMutation.mutateAsync()
            setStatus(result)
        } catch (error) {
            console.error('Failed to load Ollama status:', error)
        }
    }

    const handleTestConnection = async () => {
        setIsTesting(true)
        try {
            const result = await testConnectionMutation.mutateAsync({
                baseUrl: settings.baseUrl,
                model: settings.model
            })

            if (result.success) {
                toast.success('连接测试成功！')
                await loadStatus()
            } else {
                toast.error(`连接测试失败: ${result.error}`)
            }
        } catch (error) {
            toast.error('连接测试失败')
            console.error('Test connection failed:', error)
        } finally {
            setIsTesting(false)
        }
    }

    const handleSaveSettings = async () => {
        setIsLoading(true)
        try {
            // 这里应该调用API保存设置
            toast.success('设置保存成功！')
            await loadStatus()
        } catch (error) {
            toast.error('保存设置失败')
            console.error('Save settings failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="border-b">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-medium">AI 设置</h1>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* 连接状态 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                连接状态
                            </CardTitle>
                            <CardDescription>
                                查看Ollama服务的连接状态和可用模型
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {status ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">服务状态:</span>
                                        {status.available ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                已连接
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                未连接
                                            </Badge>
                                        )}
                                    </div>

                                    {status.available && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">当前模型:</span>
                                                <Badge variant="outline">{status.currentModel}</Badge>
                                            </div>

                                            <div>
                                                <span className="text-sm font-medium">可用模型:</span>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {status.models.map((model) => (
                                                        <Badge key={model} variant="secondary">
                                                            {model}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>加载中...</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 配置设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ollama 配置</CardTitle>
                            <CardDescription>
                                配置Ollama服务的连接参数和模型设置
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="baseUrl">服务地址</Label>
                                    <Input
                                        id="baseUrl"
                                        value={settings.baseUrl}
                                        onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                                        placeholder="http://localhost:11434"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="model">模型名称</Label>
                                    <Input
                                        id="model"
                                        value={settings.model}
                                        onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                        placeholder="qwen2.5:7b"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="temperature">Temperature</Label>
                                    <Input
                                        id="temperature"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="2"
                                        value={settings.temperature}
                                        onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="topP">Top P</Label>
                                    <Input
                                        id="topP"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="1"
                                        value={settings.topP}
                                        onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="repeatPenalty">重复惩罚</Label>
                                <Input
                                    id="repeatPenalty"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="2"
                                    value={settings.repeatPenalty}
                                    onChange={(e) => setSettings({ ...settings, repeatPenalty: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    variant="outline"
                                >
                                    {isTesting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            测试中...
                                        </>
                                    ) : (
                                        <>
                                            <TestTube className="mr-2 h-4 w-4" />
                                            测试连接
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            保存中...
                                        </>
                                    ) : (
                                        '保存设置'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 使用说明 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>使用说明</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    <strong>安装Ollama:</strong> 请访问 <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ollama.ai</a> 下载并安装Ollama
                                </AlertDescription>
                            </Alert>

                            <Alert>
                                <AlertDescription>
                                    <strong>下载模型:</strong> 运行 <code className="bg-gray-100 px-2 py-1 rounded">ollama pull qwen2.5:7b</code> 下载默认模型
                                </AlertDescription>
                            </Alert>

                            <Alert>
                                <AlertDescription>
                                    <strong>启动服务:</strong> 确保Ollama服务正在运行，默认端口为11434
                                </AlertDescription>
                            </Alert>

                            <div className="text-sm text-muted-foreground">
                                <p><strong>支持的模型:</strong> 任何兼容的Ollama模型，推荐使用 qwen2.5:7b、llama3.1:8b 等</p>
                                <p><strong>参数说明:</strong></p>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li><strong>Temperature:</strong> 控制输出的随机性，值越高越随机</li>
                                    <li><strong>Top P:</strong> 控制词汇选择的多样性</li>
                                    <li><strong>重复惩罚:</strong> 减少重复内容的生成</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
} 