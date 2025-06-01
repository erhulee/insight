'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Code, Upload, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getFromLocalStorage } from '@/lib/utils'
import { toast } from 'sonner'

export default function SelfRenderPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'editor'>('upload')
  const [specUrl, setSpecUrl] = useState('')
  const [specContent, setSpecContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string>('')
  const [renderedSurvey, setRenderedSurvey] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // 加载API密钥
  useEffect(() => {
    const storedKeys = getFromLocalStorage<any[]>('api_keys', [])
    setApiKeys(storedKeys)
    if (storedKeys.length > 0) {
      setSelectedApiKey(storedKeys[0].key)
    }
  }, [])

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setValidationErrors([])

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        setSpecContent(content)
        validateSpec(content)
        setIsLoading(false)
      } catch (error) {
        console.error('Error reading file:', error)
        toast({
          title: '读取文件失败',
          description: '无法读取上传的文件',
          variant: 'destructive',
        })
        setIsLoading(false)
      }
    }
    reader.onerror = () => {
      toast({
        title: '读取文件失败',
        description: '无法读取上传的文件',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
    reader.readAsText(file)
  }

  // 从URL加载规范
  const handleLoadFromUrl = async () => {
    if (!specUrl) {
      toast({
        title: '请输入URL',
        description: '请输入有效的OpenAPI规范URL',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setValidationErrors([])

    try {
      const response = await fetch(specUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const content = await response.text()
      setSpecContent(content)
      validateSpec(content)
    } catch (error) {
      console.error('Error fetching spec:', error)
      toast({
        title: '加载失败',
        description: '无法从URL加载OpenAPI规范',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 验证OpenAPI规范
  const validateSpec = (content: string) => {
    const errors = []

    try {
      // 尝试解析JSON
      let spec
      try {
        spec = JSON.parse(content)
      } catch {
        // 如果不是JSON，假设是YAML
        // 在实际应用中，这里应该使用YAML解析库
        errors.push('无法解析规范内容。请确保内容是有效的JSON或YAML格式。')
        setValidationErrors(errors)
        return
      }

      // 验证基本结构
      if (!spec.openapi) {
        errors.push("缺少'openapi'字段。规范必须包含OpenAPI版本。")
      }

      if (!spec.info) {
        errors.push("缺少'info'字段。规范必须包含API信息。")
      } else {
        if (!spec.info.title) {
          errors.push("缺少'info.title'字段。规范必须包含API标题。")
        }
        if (!spec.info.version) {
          errors.push("缺少'info.version'字段。规范必须包含API版本。")
        }
      }

      if (!spec.paths) {
        errors.push("缺少'paths'字段。规范必须包含API路径。")
      }

      // 验证问卷相关路径
      let hasSurveyEndpoints = false
      if (spec.paths) {
        for (const path in spec.paths) {
          if (path.includes('/surveys')) {
            hasSurveyEndpoints = true
            break
          }
        }
      }

      if (!hasSurveyEndpoints) {
        errors.push('规范中没有问卷相关的端点。自渲染功能需要问卷相关的API端点。')
      }

      setValidationErrors(errors)
    } catch (error) {
      console.error('Error validating spec:', error)
      errors.push('验证规范时出错。请确保内容是有效的OpenAPI规范。')
      setValidationErrors(errors)
    }
  }

  // 渲染问卷
  const handleRenderSurvey = () => {
    if (validationErrors.length > 0) {
      toast({
        title: '验证失败',
        description: '请先修复OpenAPI规范中的错误',
        variant: 'destructive',
      })
      return
    }

    if (!selectedApiKey) {
      toast({
        title: '未选择API密钥',
        description: '请选择一个API密钥用于访问API',
        variant: 'destructive',
      })
      return
    }

    setIsRendering(true)

    // 模拟渲染过程
    setTimeout(() => {
      // 创建一个模拟的渲染结果
      const mockSurvey = {
        id: 'survey-123456',
        title: '客户满意度调查',
        description: '了解客户对我们产品和服务的满意度',
        questions: [
          {
            id: 'q1',
            type: 'radio',
            title: '您对我们的产品总体满意度如何？',
            required: true,
            options: [
              { text: '非常满意', value: '5' },
              { text: '满意', value: '4' },
              { text: '一般', value: '3' },
              { text: '不满意', value: '2' },
              { text: '非常不满意', value: '1' },
            ],
          },
          {
            id: 'q2',
            type: 'text',
            title: '您有什么建议可以帮助我们改进产品？',
            required: false,
            multiline: true,
          },
        ],
        settings: {
          showProgressBar: true,
          showQuestionNumbers: true,
        },
        theme: {
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
        },
      }

      setRenderedSurvey(mockSurvey)
      setIsRendering(false)

      toast('渲染成功', {
        description: '问卷已成功渲染',
      })
    }, 2000)
  }

  // 渲染问卷UI
  const renderSurveyUI = () => {
    if (!renderedSurvey) return null

    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{renderedSurvey.title}</h2>
          {renderedSurvey.description && (
            <p className="text-gray-600">{renderedSurvey.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {renderedSurvey.questions.map((question: any, index: number) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-lg font-medium">
                  {renderedSurvey.settings?.showQuestionNumbers && `${index + 1}. `}
                  {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
              </div>

              {question.type === 'radio' && (
                <div className="space-y-2 mt-3">
                  {question.options.map((option: any, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`${question.id}-${optIndex}`}
                        name={question.id}
                        value={option.value}
                        className="h-4 w-4 text-primary"
                      />
                      <label htmlFor={`${question.id}-${optIndex}`} className="text-sm">
                        {option.text}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'text' && (
                <div className="mt-3">
                  {question.multiline ? (
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      placeholder="请输入..."
                    ></textarea>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="请输入..."
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button>提交</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <FileText className="h-6 w-6" />
            <span>问卷星</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              我的问卷
            </Link>
            <Link href="/developer" className="text-sm font-medium text-primary">
              开发者中心
            </Link>
          </nav>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">OpenAPI自渲染</h1>
          <p className="text-muted-foreground">上传或提供OpenAPI规范，自动渲染问卷界面</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧面板 - 规范输入 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>OpenAPI规范</CardTitle>
                <CardDescription>上传、输入URL或直接编辑OpenAPI规范</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">上传文件</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="editor">编辑器</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4 mt-4">
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-8 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">上传OpenAPI规范文件</h3>
                      <p className="text-muted-foreground mb-4">支持JSON或YAML格式</p>
                      <Input
                        type="file"
                        accept=".json,.yaml,.yml"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="spec-file"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="spec-file" className="cursor-pointer">
                          选择文件
                        </label>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="spec-url">OpenAPI规范URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="spec-url"
                          placeholder="https://example.com/openapi.json"
                          value={specUrl}
                          onChange={(e) => setSpecUrl(e.target.value)}
                        />
                        <Button onClick={handleLoadFromUrl} disabled={isLoading}>
                          {isLoading ? '加载中...' : '加载'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        输入包含OpenAPI规范的URL，支持JSON或YAML格式
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="editor" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="spec-editor">OpenAPI规范内容</Label>
                      <Textarea
                        id="spec-editor"
                        placeholder="在此粘贴或编辑OpenAPI规范内容..."
                        className="font-mono h-[400px]"
                        value={specContent}
                        onChange={(e) => {
                          setSpecContent(e.target.value)
                          validateSpec(e.target.value)
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        直接编辑OpenAPI规范内容，支持JSON或YAML格式
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 验证错误 */}
                {validationErrors.length > 0 && (
                  <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">验证错误</h4>
                        <ul className="text-sm text-red-700 space-y-1 list-disc pl-4">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* API密钥选择 */}
                <div className="mt-6 space-y-2">
                  <Label htmlFor="api-key">API密钥</Label>
                  {apiKeys.length > 0 ? (
                    <select
                      id="api-key"
                      className="w-full p-2 border rounded-md bg-background"
                      value={selectedApiKey}
                      onChange={(e) => setSelectedApiKey(e.target.value)}
                    >
                      {apiKeys.map((key) => (
                        <option key={key.id} value={key.key}>
                          {key.name} ({key.prefix}...)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input id="api-key" placeholder="您还没有API密钥" disabled />
                      <Button asChild variant="outline" size="sm">
                        <Link href="/developer/api-keys">创建密钥</Link>
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">选择用于访问API的密钥</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleRenderSurvey}
                  disabled={
                    isLoading ||
                    isRendering ||
                    !specContent ||
                    validationErrors.length > 0 ||
                    !selectedApiKey
                  }
                  className="w-full"
                >
                  {isRendering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      渲染中...
                    </>
                  ) : (
                    '渲染问卷'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* 右侧面板 - 渲染结果 */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>渲染结果</CardTitle>
                <CardDescription>基于OpenAPI规范渲染的问卷界面</CardDescription>
              </CardHeader>
              <CardContent>
                {renderedSurvey ? (
                  renderSurveyUI()
                ) : (
                  <div className="text-center py-12">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">等待渲染</h3>
                    <p className="text-muted-foreground mb-4">
                      上传或提供OpenAPI规范，然后点击"渲染问卷"按钮
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" disabled={!renderedSurvey}>
                  重置
                </Button>
                <Button disabled={!renderedSurvey}>
                  <Check className="h-4 w-4 mr-2" />
                  应用
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>如何使用OpenAPI自渲染</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <p className="font-medium">准备OpenAPI规范</p>
                  <p className="text-muted-foreground">
                    创建一个符合OpenAPI 3.0规范的文档，描述您的问卷API。您可以使用我们的
                    <Link href="/openapi.yaml" className="text-primary hover:underline mx-1">
                      示例规范
                    </Link>
                    作为参考。
                  </p>
                </li>
                <li>
                  <p className="font-medium">上传或提供规范</p>
                  <p className="text-muted-foreground">
                    通过上传文件、提供URL或直接在编辑器中编辑来提供您的OpenAPI规范。
                  </p>
                </li>
                <li>
                  <p className="font-medium">选择API密钥</p>
                  <p className="text-muted-foreground">
                    选择一个API密钥用于访问API。如果您还没有API密钥，请先
                    <Link href="/developer/api-keys" className="text-primary hover:underline mx-1">
                      创建一个
                    </Link>
                    。
                  </p>
                </li>
                <li>
                  <p className="font-medium">渲染问卷</p>
                  <p className="text-muted-foreground">
                    点击"渲染问卷"按钮，系统将根据您的OpenAPI规范自动生成问卷界面。
                  </p>
                </li>
                <li>
                  <p className="font-medium">应用渲染结果</p>
                  <p className="text-muted-foreground">
                    检查渲染结果，如果满意，点击"应用"按钮将其应用到您的系统中。
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
