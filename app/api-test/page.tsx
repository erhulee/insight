'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

export default function ApiTestPage() {
    const [templateId, setTemplateId] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [testData, setTestData] = useState('{\n  "name": "张三",\n  "age": 25,\n  "email": "zhangsan@example.com"\n}')
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 渲染模板
    const renderTemplate = async () => {
        if (!templateId) {
            setError('请输入模板ID')
            return
        }

        setLoading(true)
        setError('')
        setResponse(null)

        try {
            const params = new URLSearchParams({
                templateId,
                ...JSON.parse(testData)
            })

            const headers: Record<string, string> = {}
            if (apiKey) {
                headers['x-api-key'] = apiKey
            }

            const res = await fetch(`/api/render?${params}`, { headers })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '请求失败')
            }

            setResponse(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知错误')
        } finally {
            setLoading(false)
        }
    }

    // 提交数据
    const submitData = async () => {
        if (!templateId) {
            setError('请输入模板ID')
            return
        }

        setLoading(true)
        setError('')
        setResponse(null)

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (apiKey) {
                headers['x-api-key'] = apiKey
            }

            const res = await fetch('/api/render', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    templateId,
                    data: JSON.parse(testData)
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '请求失败')
            }

            setResponse(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知错误')
        } finally {
            setLoading(false)
        }
    }

    // 获取模板信息
    const getTemplateInfo = async () => {
        if (!templateId) {
            setError('请输入模板ID')
            return
        }

        setLoading(true)
        setError('')
        setResponse(null)

        try {
            const headers: Record<string, string> = {}
            if (apiKey) {
                headers['x-api-key'] = apiKey
            }

            const res = await fetch(`/api/templates/${templateId}`, { headers })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '请求失败')
            }

            setResponse(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知错误')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">用户自渲染 API 测试</h1>
                <p className="text-muted-foreground">
                    测试和演示用户自渲染 RESTful API 的功能
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 输入区域 */}
                <Card>
                    <CardHeader>
                        <CardTitle>API 配置</CardTitle>
                        <CardDescription>
                            配置 API 参数和测试数据
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="templateId">模板 ID</Label>
                            <Input
                                id="templateId"
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                placeholder="输入模板ID"
                            />
                        </div>

                        <div>
                            <Label htmlFor="apiKey">API 密钥 (可选)</Label>
                            <Input
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="输入API密钥（私有模板需要）"
                                type="password"
                            />
                        </div>

                        <div>
                            <Label htmlFor="testData">测试数据 (JSON)</Label>
                            <Textarea
                                id="testData"
                                value={testData}
                                onChange={(e) => setTestData(e.target.value)}
                                placeholder="输入JSON格式的测试数据"
                                rows={6}
                            />
                        </div>

                        <Tabs defaultValue="render" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="render">渲染模板</TabsTrigger>
                                <TabsTrigger value="submit">提交数据</TabsTrigger>
                                <TabsTrigger value="info">模板信息</TabsTrigger>
                            </TabsList>

                            <TabsContent value="render" className="space-y-4">
                                <Button
                                    onClick={renderTemplate}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? '渲染中...' : '渲染模板'}
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    <p>• 支持 GET 请求渲染模板</p>
                                    <p>• 可返回 JSON 或 HTML 格式</p>
                                    <p>• 支持公开和私有模板</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="submit" className="space-y-4">
                                <Button
                                    onClick={submitData}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? '提交中...' : '提交数据'}
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    <p>• 支持 POST 请求提交数据</p>
                                    <p>• 自动生成会话ID</p>
                                    <p>• 数据会被安全存储</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="info" className="space-y-4">
                                <Button
                                    onClick={getTemplateInfo}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? '获取中...' : '获取模板信息'}
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    <p>• 获取模板详细信息</p>
                                    <p>• 包含配置和元数据</p>
                                    <p>• 支持访问权限控制</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* 响应区域 */}
                <Card>
                    <CardHeader>
                        <CardTitle>API 响应</CardTitle>
                        <CardDescription>
                            查看 API 请求的响应结果
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Badge variant="destructive">错误</Badge>
                                    <span className="text-red-800">{error}</span>
                                </div>
                            </div>
                        )}

                        {response && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="default">成功</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        响应时间: {new Date().toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <pre className="text-sm overflow-auto max-h-96">
                                        {JSON.stringify(response, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {!response && !error && !loading && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>点击左侧按钮开始测试 API</p>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">请求中...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* API 文档链接 */}
            <Card className="mt-6">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-2">
                            查看完整的 API 文档
                        </p>
                        <Button variant="outline" asChild>
                            <a href="/docs/api-documentation.md" target="_blank" rel="noopener noreferrer">
                                打开文档
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 