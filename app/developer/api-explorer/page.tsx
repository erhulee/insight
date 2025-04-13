"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Code, Play, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getFromLocalStorage } from "@/lib/utils"

export default function ApiExplorerPage() {
  const [openApiSpec, setOpenApiSpec] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [selectedApiKey, setSelectedApiKey] = useState<string>("")
  const [requestParams, setRequestParams] = useState<Record<string, any>>({})
  const [requestBody, setRequestBody] = useState<string>("")
  const [responseData, setResponseData] = useState<string>("")
  const [isExecuting, setIsExecuting] = useState(false)

  // 加载OpenAPI规范
  useEffect(() => {
    const fetchOpenApiSpec = async () => {
      try {
        const response = await fetch("/openapi.yaml")
        const text = await response.text()

        // 这里应该使用一个YAML解析库，但为了简化示例，我们使用一个模拟的解析结果
        const mockParsedSpec = {
          info: {
            title: "问卷星 API",
            version: "1.0.0",
            description: "问卷星 API 允许开发者以编程方式访问和管理问卷、问题和回复数据。",
          },
          paths: {
            "/surveys": {
              get: {
                summary: "获取问卷列表",
                description: "获取当前用户的问卷列表",
                parameters: [
                  { name: "page", in: "query", description: "页码，默认为1", schema: { type: "integer", default: 1 } },
                  {
                    name: "limit",
                    in: "query",
                    description: "每页数量，默认为10，最大为100",
                    schema: { type: "integer", default: 10 },
                  },
                ],
                responses: {
                  "200": {
                    description: "成功",
                    content: {
                      "application/json": {
                        example: {
                          data: [
                            {
                              id: "survey-123456",
                              title: "客户满意度调查",
                              description: "了解客户对我们产品和服务的满意度",
                              questions_count: 8,
                              responses_count: 124,
                              created_at: "2023-04-15T10:30:00Z",
                              updated_at: "2023-04-20T15:45:00Z",
                              published: true,
                            },
                          ],
                          meta: {
                            current_page: 1,
                            total_pages: 3,
                            total_count: 25,
                            limit: 10,
                          },
                        },
                      },
                    },
                  },
                },
              },
              post: {
                summary: "创建问卷",
                description: "创建一个新的问卷",
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      example: {
                        title: "产品反馈调查",
                        description: "帮助我们改进产品",
                        questions: [
                          {
                            type: "radio",
                            title: "您使用我们的产品多久了？",
                            required: true,
                            options: [
                              { text: "不到1个月" },
                              { text: "1-6个月" },
                              { text: "6-12个月" },
                              { text: "1年以上" },
                            ],
                          },
                        ],
                        published: false,
                      },
                    },
                  },
                },
                responses: {
                  "201": {
                    description: "创建成功",
                  },
                },
              },
            },
            "/surveys/{id}": {
              get: {
                summary: "获取问卷详情",
                description: "获取单个问卷的详细信息，包括问题和选项",
                parameters: [
                  { name: "id", in: "path", required: true, description: "问卷ID", schema: { type: "string" } },
                ],
                responses: {
                  "200": {
                    description: "成功",
                  },
                },
              },
              put: {
                summary: "更新问卷",
                description: "更新问卷信息",
                parameters: [
                  { name: "id", in: "path", required: true, description: "问卷ID", schema: { type: "string" } },
                ],
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      example: {
                        title: "更新后的问卷标题",
                        description: "更新后的问卷描述",
                      },
                    },
                  },
                },
                responses: {
                  "200": {
                    description: "更新成功",
                  },
                },
              },
              delete: {
                summary: "删除问卷",
                description: "删除一个问卷",
                parameters: [
                  { name: "id", in: "path", required: true, description: "问卷ID", schema: { type: "string" } },
                ],
                responses: {
                  "204": {
                    description: "删除成功",
                  },
                },
              },
            },
          },
        }

        setOpenApiSpec(mockParsedSpec)
        setIsLoading(false)
      } catch (error) {
        console.error("加载OpenAPI规范失败:", error)
        toast({
          title: "加载失败",
          description: "加载API规范时出现错误",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchOpenApiSpec()
  }, [])

  // 加载API密钥
  useEffect(() => {
    const storedKeys = getFromLocalStorage<any[]>("api_keys", [])
    setApiKeys(storedKeys)
    if (storedKeys.length > 0) {
      setSelectedApiKey(storedKeys[0].key)
    }
  }, [])

  // 选择端点和方法
  const handleSelectEndpoint = (endpoint: string, method: string) => {
    setSelectedEndpoint(endpoint)
    setSelectedMethod(method)
    setRequestParams({})
    setRequestBody("")
    setResponseData("")

    // 如果有请求体示例，设置默认请求体
    if (openApiSpec?.paths[endpoint]?.[method]?.requestBody?.content?.["application/json"]?.example) {
      setRequestBody(
        JSON.stringify(openApiSpec.paths[endpoint][method].requestBody.content["application/json"].example, null, 2),
      )
    }
  }

  // 更新请求参数
  const handleParamChange = (name: string, value: string) => {
    setRequestParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 执行API请求
  const handleExecuteRequest = () => {
    if (!selectedEndpoint || !selectedMethod || !selectedApiKey) {
      toast({
        title: "无法执行请求",
        description: "请选择端点、方法和API密钥",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)

    // 构建请求URL
    let url = `https://api.wenjuanxing.com/v1${selectedEndpoint}`

    // 替换路径参数
    const pathParams =
      openApiSpec?.paths[selectedEndpoint]?.[selectedMethod]?.parameters?.filter((p: any) => p.in === "path") || []

    pathParams.forEach((param: any) => {
      const paramValue = requestParams[param.name] || `{${param.name}}`
      url = url.replace(`{${param.name}}`, paramValue)
    })

    // 添加查询参数
    const queryParams =
      openApiSpec?.paths[selectedEndpoint]?.[selectedMethod]?.parameters?.filter((p: any) => p.in === "query") || []

    if (queryParams.length > 0) {
      url += "?"
      queryParams.forEach((param: any, index: number) => {
        if (requestParams[param.name]) {
          url += `${index > 0 ? "&" : ""}${param.name}=${requestParams[param.name]}`
        }
      })
    }

    // 模拟API响应
    setTimeout(() => {
      let mockResponse

      if (selectedMethod === "get") {
        if (selectedEndpoint === "/surveys") {
          mockResponse = {
            data: [
              {
                id: "survey-123456",
                title: "客户满意度调查",
                description: "了解客户对我们产品和服务的满意度",
                questions_count: 8,
                responses_count: 124,
                created_at: "2023-04-15T10:30:00Z",
                updated_at: "2023-04-20T15:45:00Z",
                published: true,
              },
              {
                id: "survey-789012",
                title: "产品反馈调查",
                description: "收集用户对新功能的反馈",
                questions_count: 5,
                responses_count: 42,
                created_at: "2023-05-10T09:15:00Z",
                updated_at: "2023-05-12T14:20:00Z",
                published: true,
              },
            ],
            meta: {
              current_page: 1,
              total_pages: 3,
              total_count: 25,
              limit: 10,
            },
          }
        } else if (selectedEndpoint === "/surveys/{id}") {
          const surveyId = requestParams.id || "survey-123456"
          mockResponse = {
            data: {
              id: surveyId,
              title: "客户满意度调查",
              description: "了解客户对我们产品和服务的满意度",
              questions: [
                {
                  id: "q1",
                  type: "radio",
                  title: "您对我们的产品总体满意度如何？",
                  required: true,
                  options: [
                    { text: "非常满意", value: "5" },
                    { text: "满意", value: "4" },
                    { text: "一般", value: "3" },
                    { text: "不满意", value: "2" },
                    { text: "非常不满意", value: "1" },
                  ],
                },
                {
                  id: "q2",
                  type: "text",
                  title: "您有什么建议可以帮助我们改进产品？",
                  required: false,
                  multiline: true,
                },
              ],
              settings: {
                showProgressBar: true,
                showQuestionNumbers: true,
              },
              theme: {
                primaryColor: "#3b82f6",
                backgroundColor: "#ffffff",
              },
              created_at: "2023-04-15T10:30:00Z",
              updated_at: "2023-04-20T15:45:00Z",
              published: true,
            },
          }
        }
      } else if (selectedMethod === "post") {
        if (selectedEndpoint === "/surveys") {
          let requestBodyObj = {}
          try {
            requestBodyObj = JSON.parse(requestBody)
          } catch (e) {
            requestBodyObj = { error: "Invalid JSON" }
          }

          mockResponse = {
            data: {
              id: "survey-" + Math.floor(Math.random() * 1000000),
              ...requestBodyObj,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }
        }
      } else if (selectedMethod === "put") {
        if (selectedEndpoint === "/surveys/{id}") {
          const surveyId = requestParams.id || "survey-123456"
          let requestBodyObj = {}
          try {
            requestBodyObj = JSON.parse(requestBody)
          } catch (e) {
            requestBodyObj = { error: "Invalid JSON" }
          }

          mockResponse = {
            data: {
              id: surveyId,
              ...requestBodyObj,
              updated_at: new Date().toISOString(),
            },
          }
        }
      } else if (selectedMethod === "delete") {
        mockResponse = null
      }

      setResponseData(JSON.stringify(mockResponse, null, 2))
      setIsExecuting(false)
    }, 1000)
  }

  // 复制代码
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "已复制",
      description: "代码已复制到剪贴板",
    })
  }

  // 生成请求代码示例
  const generateCodeExample = (language: string) => {
    if (!selectedEndpoint || !selectedMethod || !selectedApiKey) return ""

    let url = `https://api.wenjuanxing.com/v1${selectedEndpoint}`

    // 替换路径参数
    const pathParams =
      openApiSpec?.paths[selectedEndpoint]?.[selectedMethod]?.parameters?.filter((p: any) => p.in === "path") || []

    pathParams.forEach((param: any) => {
      const paramValue = requestParams[param.name] || `{${param.name}}`
      url = url.replace(`{${param.name}}`, paramValue)
    })

    // 添加查询参数
    const queryParams =
      openApiSpec?.paths[selectedEndpoint]?.[selectedMethod]?.parameters?.filter((p: any) => p.in === "query") || []

    if (queryParams.length > 0) {
      url += "?"
      queryParams.forEach((param: any, index: number) => {
        if (requestParams[param.name]) {
          url += `${index > 0 ? "&" : ""}${param.name}=${requestParams[param.name]}`
        }
      })
    }

    const hasBody = ["post", "put", "patch"].includes(selectedMethod) && requestBody

    switch (language) {
      case "curl":
        return `curl -X ${selectedMethod.toUpperCase()} "${url}" \\
-H "Authorization: Bearer ${selectedApiKey}" \\
-H "Content-Type: application/json"${
          hasBody
            ? ` \\
-d '${requestBody}'`
            : ""
        }`

      case "javascript":
        return `const response = await fetch("${url}", {
  method: "${selectedMethod.toUpperCase()}",
  headers: {
    "Authorization": "Bearer ${selectedApiKey}",
    "Content-Type": "application/json"
  }${
    hasBody
      ? `,
  body: JSON.stringify(${requestBody})`
      : ""
  }
});

const data = await response.json();
console.log(data);`

      case "python":
        return `import requests

headers = {
    "Authorization": "Bearer ${selectedApiKey}",
    "Content-Type": "application/json"
}

${
  hasBody
    ? `payload = ${requestBody}

`
    : ""
}response = requests.${selectedMethod}("${url}", headers=headers${hasBody ? ", json=payload" : ""})
data = response.json()
print(data)`

      case "php":
        return `<?php
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "${url}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "${selectedMethod.toUpperCase()}",
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer ${selectedApiKey}",
        "Content-Type: application/json"
    ]${
      hasBody
        ? `,
    CURLOPT_POSTFIELDS => '${requestBody}'`
        : ""
    }
]);

$response = curl_exec($curl);
$data = json_decode($response, true);

curl_close($curl);
print_r($data);`

      default:
        return ""
    }
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
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
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
          <h1 className="text-3xl font-bold mb-2">API Explorer</h1>
          <p className="text-muted-foreground">交互式API探索工具，帮助您了解和测试问卷星API</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧面板 - API端点列表 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>API端点</CardTitle>
                  <CardDescription>选择一个API端点进行探索</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(openApiSpec?.paths || {}).map(([path, methods]: [string, any]) => (
                      <AccordionItem key={path} value={path}>
                        <AccordionTrigger className="text-sm font-medium">{path}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-4">
                            {Object.entries(methods).map(([method, details]: [string, any]) => (
                              <Button
                                key={`${path}-${method}`}
                                variant={selectedEndpoint === path && selectedMethod === method ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start gap-2 text-xs"
                                onClick={() => handleSelectEndpoint(path, method)}
                              >
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    method === "get"
                                      ? "bg-blue-100 text-blue-800"
                                      : method === "post"
                                        ? "bg-green-100 text-green-800"
                                        : method === "put"
                                          ? "bg-amber-100 text-amber-800"
                                          : method === "delete"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {method.toUpperCase()}
                                </span>
                                <span className="truncate">{details.summary}</span>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* 右侧面板 - API详情和测试 */}
            <div className="lg:col-span-2">
              {selectedEndpoint && selectedMethod ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            selectedMethod === "get"
                              ? "bg-blue-100 text-blue-800"
                              : selectedMethod === "post"
                                ? "bg-green-100 text-green-800"
                                : selectedMethod === "put"
                                  ? "bg-amber-100 text-amber-800"
                                  : selectedMethod === "delete"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedMethod.toUpperCase()}
                        </span>
                        <CardTitle>{selectedEndpoint}</CardTitle>
                      </div>
                      <CardDescription>
                        {openApiSpec?.paths[selectedEndpoint]?.[selectedMethod]?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* API密钥选择 */}
                        <div className="space-y-2">
                          <Label htmlFor="api-key">API密钥</Label>
                          {apiKeys.length > 0 ? (
                            <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
                              <SelectTrigger id="api-key">
                                <SelectValue placeholder="选择API密钥" />
                              </SelectTrigger>
                              <SelectContent>
                                {apiKeys.map((key) => (
                                  <SelectItem key={key.id} value={key.key}>
                                    {key.name} ({key.prefix}...)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input id="api-key" placeholder="您还没有API密钥" disabled />
                              <Button asChild variant="outline" size="sm">
                                <Link href="/developer/api-keys">创建密钥</Link>
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* 参数输入 */}
                        {openApiSpec?.paths[selectedEndpoint]?.[selectedMethod]?.parameters?.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">请求参数</h3>
                            <div className="space-y-4">
                              {/* 路径参数 */}
                              {openApiSpec.paths[selectedEndpoint][selectedMethod].parameters
                                .filter((param: any) => param.in === "path")
                                .map((param: any) => (
                                  <div key={param.name} className="space-y-2">
                                    <Label htmlFor={`param-${param.name}`}>
                                      {param.name}
                                      {param.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    <Input
                                      id={`param-${param.name}`}
                                      placeholder={param.description}
                                      value={requestParams[param.name] || ""}
                                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">{param.description}</p>
                                  </div>
                                ))}

                              {/* 查询参数 */}
                              {openApiSpec.paths[selectedEndpoint][selectedMethod].parameters
                                .filter((param: any) => param.in === "query")
                                .map((param: any) => (
                                  <div key={param.name} className="space-y-2">
                                    <Label htmlFor={`param-${param.name}`}>
                                      {param.name}
                                      {param.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    <Input
                                      id={`param-${param.name}`}
                                      placeholder={param.description}
                                      value={requestParams[param.name] || ""}
                                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">{param.description}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* 请求体 */}
                        {["post", "put", "patch"].includes(selectedMethod) && (
                          <div className="space-y-2">
                            <Label htmlFor="request-body">请求体 (JSON)</Label>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                onClick={() => handleCopyCode(requestBody)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Textarea
                                id="request-body"
                                className="font-mono h-64"
                                value={requestBody}
                                onChange={(e) => setRequestBody(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {/* 执行按钮 */}
                        <div className="flex justify-end">
                          <Button
                            onClick={handleExecuteRequest}
                            disabled={isExecuting || !selectedApiKey}
                            className="gap-1"
                          >
                            {isExecuting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                执行中...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                执行请求
                              </>
                            )}
                          </Button>
                        </div>

                        {/* 响应结果 */}
                        {responseData && (
                          <div className="space-y-2">
                            <Label>响应</Label>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                onClick={() => handleCopyCode(responseData)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto h-64">
                                <code>{responseData}</code>
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* 代码示例 */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">代码示例</h3>
                          <Tabs defaultValue="curl">
                            <TabsList>
                              <TabsTrigger value="curl">cURL</TabsTrigger>
                              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                              <TabsTrigger value="python">Python</TabsTrigger>
                              <TabsTrigger value="php">PHP</TabsTrigger>
                            </TabsList>
                            <TabsContent value="curl" className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                onClick={() => handleCopyCode(generateCodeExample("curl"))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                <code>{generateCodeExample("curl")}</code>
                              </pre>
                            </TabsContent>
                            <TabsContent value="javascript" className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                onClick={() => handleCopyCode(generateCodeExample("javascript"))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                <code>{generateCodeExample("javascript")}</code>
                              </pre>
                            </TabsContent>
                            <TabsContent value="python" className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                onClick={() => handleCopyCode(generateCodeExample("python"))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                <code>{generateCodeExample("python")}</code>
                              </pre>
                            </TabsContent>
                            <TabsContent value="php" className="relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2 z-10"
                                onClick={() => handleCopyCode(generateCodeExample("php"))}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                <code>{generateCodeExample("php")}</code>
                              </pre>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>API Explorer</CardTitle>
                    <CardDescription>从左侧选择一个API端点开始探索</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">选择一个API端点</h3>
                      <p className="text-muted-foreground mb-4">从左侧列表中选择一个API端点来查看详情并测试API</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
