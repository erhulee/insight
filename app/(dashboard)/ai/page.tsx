'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Plus, TestTube, CheckCircle, XCircle, Activity, Zap, Database, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { AIServiceConfigManager } from '@/components/ai-service-config-manager'
import { getActiveAIConfig, getStoredAIConfigs } from '@/lib/ai-service-config'
import { trpc } from '@/app/_trpc/client'
import { AIServiceConfig } from '@/lib/ai-service-config'

export default function AIPage() {
    const [activeConfig, setActiveConfig] = useState<AIServiceConfig | null>(null)
    const [allConfigs, setAllConfigs] = useState<AIServiceConfig[]>([])
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null)
    const [serviceStatus, setServiceStatus] = useState<{ available: boolean; models: string[]; currentModel: string; error?: string } | null>(null)

    // tRPC 查询和变更
    const testAIConnection = trpc.TestAIConnection.useMutation()
    const getAIStatus = trpc.GetAIStatus.useMutation()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const config = getActiveAIConfig()
        const configs = getStoredAIConfigs()
        setActiveConfig(config)
        setAllConfigs(configs)
    }

    const handleConfigChange = () => {
        loadData()
        // 重置状态
        setTestResult(null)
        setServiceStatus(null)
    }

    const handleTestConnection = async () => {
        if (!activeConfig) {
            toast.error('没有可用的AI服务配置')
            return
        }

        setIsTesting(true)
        setTestResult(null)

        try {
            // 使用 tRPC 调用服务端测试连接
            const result = await testAIConnection.mutateAsync({
                config: {
                    type: activeConfig.type,
                    baseUrl: activeConfig.baseUrl,
                    apiKey: activeConfig.apiKey,
                    model: activeConfig.model,
                    temperature: activeConfig.temperature,
                    topP: activeConfig.topP,
                    repeatPenalty: activeConfig.repeatPenalty,
                    maxTokens: activeConfig.maxTokens,
                }
            })

            setTestResult(result)

            if (result.success) {
                toast.success('连接测试成功！')
                // 测试成功后获取服务状态
                await loadServiceStatus()
            } else {
                toast.error(`连接测试失败: ${result.error}`)
            }
        } catch (error) {
            setTestResult({ success: false, error: '测试失败' })
            toast.error('连接测试失败')
        } finally {
            setIsTesting(false)
        }
    }

    const loadServiceStatus = async () => {
        if (!activeConfig) return

        try {
            // 使用 tRPC 调用服务端获取状态
            const status = await getAIStatus.mutateAsync({
                config: {
                    type: activeConfig.type,
                    baseUrl: activeConfig.baseUrl,
                    apiKey: activeConfig.apiKey,
                    model: activeConfig.model,
                    temperature: activeConfig.temperature,
                    topP: activeConfig.topP,
                    repeatPenalty: activeConfig.repeatPenalty,
                    maxTokens: activeConfig.maxTokens,
                }
            })

            setServiceStatus(status)
        } catch (error) {
            console.error('获取服务状态失败:', error)
        }
    }

    const getProviderIcon = (type: string) => {
        switch (type) {
            case 'openai':
                return <Zap className="h-4 w-4" />
            case 'ollama':
                return <Database className="h-4 w-4" />
            case 'anthropic':
                return <Globe className="h-4 w-4" />
            default:
                return <Settings className="h-4 w-4" />
        }
    }

    const getProviderColor = (type: string) => {
        switch (type) {
            case 'openai':
                return 'bg-green-100 text-green-800'
            case 'ollama':
                return 'bg-blue-100 text-blue-800'
            case 'anthropic':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="border-b">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-medium">AI 服务配置</h1>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* 页面标题和说明 */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">AI 服务配置管理</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            配置和管理您的AI服务提供商，支持OpenAI、Ollama、Anthropic等多种服务。
                        </p>
                    </div>

                    {/* 快速状态概览 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Settings className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">配置总数</p>
                                        <p className="text-2xl font-bold">{allConfigs.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">活跃配置</p>
                                        <p className="text-2xl font-bold">
                                            {activeConfig ? activeConfig.name : '无'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">连接状态</p>
                                        <p className="text-2xl font-bold">
                                            {testResult?.success ? '正常' : '未知'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="configs" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="configs">服务配置</TabsTrigger>
                            <TabsTrigger value="status">连接状态</TabsTrigger>
                            <TabsTrigger value="monitor">服务监控</TabsTrigger>
                        </TabsList>

                        {/* 服务配置标签页 */}
                        <TabsContent value="configs" className="space-y-6">
                            <AIServiceConfigManager onConfigChange={handleConfigChange} />
                        </TabsContent>

                        {/* 连接状态标签页 */}
                        <TabsContent value="status" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        当前活跃配置
                                    </CardTitle>
                                    <CardDescription>
                                        查看当前使用的AI服务配置状态
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {activeConfig ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">配置名称:</span>
                                                        <Badge variant="outline">{activeConfig.name}</Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">服务类型:</span>
                                                        <Badge className={getProviderColor(activeConfig.type)}>
                                                            {getProviderIcon(activeConfig.type)}
                                                            {activeConfig.type}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">服务地址:</span>
                                                        <code className="text-sm bg-muted px-2 py-1 rounded">
                                                            {activeConfig.baseUrl}
                                                        </code>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">模型:</span>
                                                        <Badge variant="secondary">{activeConfig.model}</Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">Temperature:</span>
                                                        <Badge variant="outline">{activeConfig.temperature}</Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">Top P:</span>
                                                        <Badge variant="outline">{activeConfig.topP}</Badge>
                                                    </div>

                                                    {activeConfig.repeatPenalty && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">重复惩罚:</span>
                                                            <Badge variant="outline">{activeConfig.repeatPenalty}</Badge>
                                                        </div>
                                                    )}

                                                    {activeConfig.maxTokens && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">最大令牌:</span>
                                                            <Badge variant="outline">{activeConfig.maxTokens}</Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 连接测试 */}
                                            <div className="pt-4 border-t">
                                                <Button
                                                    onClick={handleTestConnection}
                                                    disabled={isTesting || testAIConnection.isLoading}
                                                    variant="outline"
                                                    className="w-full md:w-auto"
                                                >
                                                    {isTesting || testAIConnection.isLoading ? (
                                                        <>
                                                            <TestTube className="mr-2 h-4 w-4 animate-spin" />
                                                            测试中...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TestTube className="mr-2 h-4 w-4" />
                                                            测试连接
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* 测试结果 */}
                                            {testResult && (
                                                <Alert variant={testResult.success ? 'default' : 'destructive'}>
                                                    {testResult.success ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                    <AlertDescription>
                                                        {testResult.success ? '连接正常' : `连接失败: ${testResult.error}`}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                没有可用的AI服务配置，请先添加配置
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 服务监控标签页 */}
                        <TabsContent value="monitor" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        服务状态监控
                                    </CardTitle>
                                    <CardDescription>
                                        实时监控AI服务的可用性和性能指标
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {activeConfig ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Button
                                                    onClick={loadServiceStatus}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={getAIStatus.isLoading}
                                                >
                                                    <Activity className="h-4 w-4 mr-2" />
                                                    {getAIStatus.isLoading ? '获取中...' : '刷新状态'}
                                                </Button>
                                            </div>

                                            {serviceStatus ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <span className="text-sm font-medium">服务状态:</span>
                                                            <Badge variant={serviceStatus.available ? 'default' : 'destructive'}>
                                                                {serviceStatus.available ? '可用' : '不可用'}
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <span className="text-sm font-medium">当前模型:</span>
                                                            <Badge variant="outline">
                                                                {serviceStatus.currentModel || '未知'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {serviceStatus.models.length > 0 && (
                                                        <div className="space-y-2">
                                                            <span className="text-sm font-medium">可用模型:</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {serviceStatus.models.map((model) => (
                                                                    <Badge key={model} variant="secondary">
                                                                        {model}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {serviceStatus.error && (
                                                        <Alert variant="destructive">
                                                            <XCircle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                错误信息: {serviceStatus.error}
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">
                                                        点击"刷新状态"按钮获取服务状态信息
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">
                                                请先选择一个活跃的AI服务配置
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
