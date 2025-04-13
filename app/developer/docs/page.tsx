"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Search, ChevronRight, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { OpenApiRenderer } from "@/components/developer/openapi-renderer"
import { toast } from "@/components/ui/use-toast"

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "已复制",
      description: "代码已复制到剪贴板",
    })
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
      <div className="container px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧导航 */}
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索文档..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-sm">入门指南</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="#overview"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      概述
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#authentication"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      认证
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#rate-limits"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      速率限制
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#errors"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      错误处理
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-sm">API参考</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="#surveys"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      问卷
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#questions"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      问题
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#responses"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      回复
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#stats"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      统计
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#webhooks"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      Webhooks
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-sm">指南</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="#guides-create-survey"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      创建问卷
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#guides-collect-responses"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      收集回复
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#guides-analyze-data"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      分析数据
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#guides-webhooks"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      使用Webhooks
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-sm">资源</h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/developer/api-explorer"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      API Explorer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/examples"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      代码示例
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/openapi.yaml"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      OpenAPI规范
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/changelog"
                      className="text-muted-foreground hover:text-foreground text-sm flex items-center py-1"
                    >
                      更新日志
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 主要内容 */}
          <div className="flex-1 max-w-3xl">
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl font-bold mb-4">问卷星 API 文档</h1>
                <p className="text-muted-foreground text-lg mb-6">
                  全面的API文档，帮助您将问卷功能集成到您的应用程序中
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="text-sm">
                    版本: 1.0.0
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    基础URL: https://api.wenjuanxing.com/v1
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/developer/api-explorer" className="gap-1">
                      API Explorer
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/openapi.yaml" className="gap-1">
                      下载OpenAPI规范
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 概述 */}
              <div id="overview" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">概述</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4">
                      问卷星API是一个RESTful
                      API，允许开发者以编程方式访问和管理问卷、问题和回复数据。您可以创建自定义问卷界面，集成数据到您的系统中，或构建自动化工作流。
                    </p>
                    <p className="mb-4">API使用JSON格式进行数据交换，并使用标准HTTP方法和状态码。</p>
                    <h3 className="text-lg font-medium mb-2">基础URL</h3>
                    <p className="mb-4">所有API请求都应该发送到以下基础URL：</p>
                    <div className="bg-muted p-3 rounded-md mb-4">
                      <code>https://api.wenjuanxing.com/v1</code>
                    </div>
                    <h3 className="text-lg font-medium mb-2">请求格式</h3>
                    <p className="mb-4">
                      对于POST和PUT请求，请求体应该是JSON格式。请确保设置Content-Type头为application/json。
                    </p>
                    <h3 className="text-lg font-medium mb-2">响应格式</h3>
                    <p>所有API响应都是JSON格式，并包含以下结构：</p>
                    <div className="relative mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={() =>
                          handleCopyCode(
                            `{
  "data": {
    // 响应数据
  },
  "meta": {
    // 元数据，如分页信息
  }
}`,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                        <code>{`{
  "data": {
    // 响应数据
  },
  "meta": {
    // 元数据，如分页信息
  }
}`}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 认证 */}
              <div id="authentication" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">认证</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4">
                      问卷星API使用Bearer Token认证方式。您需要在请求头中添加Authorization头，值为"Bearer
                      "加上您的API密钥。
                    </p>
                    <div className="relative mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={() => handleCopyCode(`Authorization: Bearer YOUR_API_KEY`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                        <code>Authorization: Bearer YOUR_API_KEY</code>
                      </pre>
                    </div>
                    <h3 className="text-lg font-medium mb-2">获取API密钥</h3>
                    <p className="mb-4">
                      您可以在
                      <Link href="/developer/api-keys" className="text-primary hover:underline mx-1">
                        API密钥管理
                      </Link>
                      页面创建和管理您的API密钥。
                    </p>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                      <h4 className="text-amber-800 font-medium mb-2">安全提示</h4>
                      <p className="text-amber-700 text-sm">
                        请妥善保管您的API密钥，不要将其包含在客户端代码中或泄露给他人。如果您怀疑API密钥已泄露，请立即重新生成。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 速率限制 */}
              <div id="rate-limits" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">速率限制</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4">
                      为了确保API的稳定性和可用性，我们对API请求有速率限制。限制根据您的账户类型而有所不同。
                    </p>
                    <table className="w-full border-collapse mb-4">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">账户类型</th>
                          <th className="text-left py-2">每分钟请求数</th>
                          <th className="text-left py-2">每天请求数</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">免费</td>
                          <td className="py-2">60</td>
                          <td className="py-2">1,000</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">专业版</td>
                          <td className="py-2">120</td>
                          <td className="py-2">5,000</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">企业版</td>
                          <td className="py-2">300</td>
                          <td className="py-2">无限制</td>
                        </tr>
                      </tbody>
                    </table>
                    <h3 className="text-lg font-medium mb-2">速率限制头</h3>
                    <p className="mb-4">每个API响应都包含以下头，用于跟踪您的速率限制使用情况：</p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>
                        <code>X-RateLimit-Limit</code>：当前时间窗口内的请求限制
                      </li>
                      <li>
                        <code>X-RateLimit-Remaining</code>：当前时间窗口内剩余的请求数
                      </li>
                      <li>
                        <code>X-RateLimit-Reset</code>：当前时间窗口重置的时间戳（Unix时间戳）
                      </li>
                    </ul>
                    <h3 className="text-lg font-medium mb-2">超出限制</h3>
                    <p>
                      如果您超出速率限制，API将返回429 Too Many
                      Requests状态码。您应该等待一段时间再重试请求，或考虑升级您的账户以获取更高的限制。
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 错误处理 */}
              <div id="errors" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">错误处理</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4">当API请求失败时，您将收到一个包含错误信息的JSON响应，以及相应的HTTP状态码。</p>
                    <div className="relative mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={() =>
                          handleCopyCode(
                            `{
  "error": {
    "code": "validation_error",
    "message": "请求参数验证失败"
  }
}`,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                        <code>{`{
  "error": {
    "code": "validation_error",
    "message": "请求参数验证失败"
  }
}`}</code>
                      </pre>
                    </div>
                    <h3 className="text-lg font-medium mb-2">常见HTTP状态码</h3>
                    <table className="w-full border-collapse mb-4">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">状态码</th>
                          <th className="text-left py-2">描述</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">200 OK</td>
                          <td className="py-2">请求成功</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">201 Created</td>
                          <td className="py-2">资源创建成功</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">204 No Content</td>
                          <td className="py-2">请求成功，但没有返回内容（如删除操作）</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">400 Bad Request</td>
                          <td className="py-2">请求参数错误</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">401 Unauthorized</td>
                          <td className="py-2">认证失败或未提供认证信息</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">403 Forbidden</td>
                          <td className="py-2">没有权限访问资源</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">404 Not Found</td>
                          <td className="py-2">请求的资源不存在</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">429 Too Many Requests</td>
                          <td className="py-2">超出速率限制</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">500 Internal Server Error</td>
                          <td className="py-2">服务器内部错误</td>
                        </tr>
                      </tbody>
                    </table>
                    <h3 className="text-lg font-medium mb-2">错误代码</h3>
                    <p className="mb-4">错误响应中的code字段提供了更具体的错误类型：</p>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">错误代码</th>
                          <th className="text-left py-2">描述</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">unauthorized</td>
                          <td className="py-2">认证失败或未提供认证信息</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">forbidden</td>
                          <td className="py-2">没有权限访问资源</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">not_found</td>
                          <td className="py-2">请求的资源不存在</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">validation_error</td>
                          <td className="py-2">请求参数验证失败</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">rate_limit_exceeded</td>
                          <td className="py-2">超出速率限制</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">server_error</td>
                          <td className="py-2">服务器内部错误</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              {/* API参考 - 问卷 */}
              <div id="surveys" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">问卷</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="mb-4">问卷API允许您创建、获取、更新和删除问卷。</p>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="get-surveys">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              GET
                            </Badge>
                            <span>/surveys</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium mb-2">获取问卷列表</h3>
                              <p className="text-muted-foreground mb-4">获取当前用户的问卷列表</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">查询参数</h4>
                              <table className="w-full border-collapse mb-4">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">参数</th>
                                    <th className="text-left py-2">类型</th>
                                    <th className="text-left py-2">描述</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="py-2">page</td>
                                    <td className="py-2">integer</td>
                                    <td className="py-2">页码，默认为1</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="py-2">limit</td>
                                    <td className="py-2">integer</td>
                                    <td className="py-2">每页数量，默认为10，最大为100</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="py-2">status</td>
                                    <td className="py-2">string</td>
                                    <td className="py-2">筛选状态：all（默认）、draft、published</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="py-2">sort</td>
                                    <td className="py-2">string</td>
                                    <td className="py-2">排序字段：created_at、updated_at（默认）</td>
                                  </tr>
                                  <tr className="border-b">
                                    <td className="py-2">order</td>
                                    <td className="py-2">string</td>
                                    <td className="py-2">排序方向：asc、desc（默认）</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">响应</h4>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2 z-10"
                                  onClick={() =>
                                    handleCopyCode(
                                      `{
  "data": [
    {
      "id": "survey-123456",
      "title": "客户满意度调查",
      "description": "了解客户对我们产品和服务的满意度",
      "questions_count": 8,
      "responses_count": 124,
      "created_at": "2023-04-15T10:30:00Z",
      "updated_at": "2023-04-20T15:45:00Z",
      "published": true
    },
    {
      "id": "survey-789012",
      "title": "产品反馈调查",
      "description": "收集用户对新功能的反馈",
      "questions_count": 5,
      "responses_count": 42,
      "created_at": "2023-05-10T09:15:00Z",
      "updated_at": "2023-05-12T14:20:00Z",
      "published": true
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 25,
    "limit": 10
  }
}`,
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                  <code>{`{
  "data": [
    {
      "id": "survey-123456",
      "title": "客户满意度调查",
      "description": "了解客户对我们产品和服务的满意度",
      "questions_count": 8,
      "responses_count": 124,
      "created_at": "2023-04-15T10:30:00Z",
      "updated_at": "2023-04-20T15:45:00Z",
      "published": true
    },
    {
      "id": "survey-789012",
      "title": "产品反馈调查",
      "description": "收集用户对新功能的反馈",
      "questions_count": 5,
      "responses_count": 42,
      "created_at": "2023-05-10T09:15:00Z",
      "updated_at": "2023-05-12T14:20:00Z",
      "published": true
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 25,
    "limit": 10
  }
}`}</code>
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">代码示例</h4>
                              <Tabs defaultValue="javascript">
                                <TabsList className="mb-2">
                                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                                  <TabsTrigger value="python">Python</TabsTrigger>
                                  <TabsTrigger value="curl">cURL</TabsTrigger>
                                </TabsList>
                                <TabsContent value="javascript" className="relative">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 z-10"
                                    onClick={() =>
                                      handleCopyCode(
                                        `async function getSurveys() {
  try {
    const response = await fetch("https://api.wenjuanxing.com/v1/surveys?page=1&limit=10", {
      method: "GET",
      headers: {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log("问卷列表:", data);
    return data;
  } catch (error) {
    console.error("获取问卷列表失败:", error);
  }
}

// 调用函数
getSurveys();`,
                                      )
                                    }
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                    <code>{`async function getSurveys() {
  try {
    const response = await fetch("https://api.wenjuanxing.com/v1/surveys?page=1&limit=10", {
      method: "GET",
      headers: {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log("问卷列表:", data);
    return data;
  } catch (error) {
    console.error("获取问卷列表失败:", error);
  }
}

// 调用函数
getSurveys();`}</code>
                                  </pre>
                                </TabsContent>
                                <TabsContent value="python" className="relative">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 z-10"
                                    onClick={() =>
                                      handleCopyCode(
                                        `import requests

def get_surveys():
    url = "https://api.wenjuanxing.com/v1/surveys"
    params = {
        "page": 1,
        "limit": 10
    }
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        print("问卷列表:", data)
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP错误: {http_err}")
    except Exception as err:
        print(f"其他错误: {err}")

# 调用函数
get_surveys()`,
                                      )
                                    }
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                    <code>{`import requests

def get_surveys():
    url = "https://api.wenjuanxing.com/v1/surveys"
    params = {
        "page": 1,
        "limit": 10
    }
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        print("问卷列表:", data)
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP错误: {http_err}")
    except Exception as err:
        print(f"其他错误: {err}")

# 调用函数
get_surveys()`}</code>
                                  </pre>
                                </TabsContent>
                                <TabsContent value="curl" className="relative">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 z-10"
                                    onClick={() =>
                                      handleCopyCode(
                                        `curl -X GET "https://api.wenjuanxing.com/v1/surveys?page=1&limit=10" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json"`,
                                      )
                                    }
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                    <code>{`curl -X GET "https://api.wenjuanxing.com/v1/surveys?page=1&limit=10" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json"`}</code>
                                  </pre>
                                </TabsContent>
                              </Tabs>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="post-surveys">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              POST
                            </Badge>
                            <span>/surveys</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium mb-2">创建问卷</h3>
                              <p className="text-muted-foreground mb-4">创建一个新的问卷</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">请求体</h4>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2 z-10"
                                  onClick={() =>
                                    handleCopyCode(
                                      `{
  "title": "客户满意度调查",
  "description": "了解客户对我们产品和服务的满意度",
  "questions": [
    {
      "type": "radio",
      "title": "您对我们的产品总体满意度如何？",
      "required": true,
      "options": [
        {"text": "非常满意"},
        {"text": "满意"},
        {"text": "一般"},
        {"text": "不满意"},
        {"text": "非常不满意"}
      ]
    },
    {
      "type": "text",
      "title": "您有什么建议可以帮助我们改进产品？",
      "required": false,
      "multiline": true
    }
  ],
  "published": false
}`,
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                  <code>{`{
  "title": "客户满意度调查",
  "description": "了解客户对我们产品和服务的满意度",
  "questions": [
    {
      "type": "radio",
      "title": "您对我们的产品总体满意度如何？",
      "required": true,
      "options": [
        {"text": "非常满意"},
        {"text": "满意"},
        {"text": "一般"},
        {"text": "不满意"},
        {"text": "非常不满意"}
      ]
    },
    {
      "type": "text",
      "title": "您有什么建议可以帮助我们改进产品？",
      "required": false,
      "multiline": true
    }
  ],
  "published": false
}`}</code>
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">响应</h4>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2 z-10"
                                  onClick={() =>
                                    handleCopyCode(
                                      `{
  "data": {
    "id": "survey-123456",
    "title": "客户满意度调查",
    "description": "了解客户对我们产品和服务的满意度",
    "questions": [
      {
        "id": "q1",
        "type": "radio",
        "title": "您对我们的产品总体满意度如何？",
        "required": true,
        "options": [
          {"text": "非常满意"},
          {"text": "满意"},
          {"text": "一般"},
          {"text": "不满意"},
          {"text": "非常不满意"}
        ]
      },
      {
        "id": "q2",
        "type": "text",
        "title": "您有什么建议可以帮助我们改进产品？",
        "required": false,
        "multiline": true
      }
    ],
    "created_at": "2023-04-15T10:30:00Z",
    "updated_at": "2023-04-15T10:30:00Z",
    "published": false
  }
}`,
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                  <code>{`{
  "data": {
    "id": "survey-123456",
    "title": "客户满意度调查",
    "description": "了解客户对我们产品和服务的满意度",
    "questions": [
      {
        "id": "q1",
        "type": "radio",
        "title": "您对我们的产品总体满意度如何？",
        "required": true,
        "options": [
          {"text": "非常满意"},
          {"text": "满意"},
          {"text": "一般"},
          {"text": "不满意"},
          {"text": "非常不满意"}
        ]
      },
      {
        "id": "q2",
        "type": "text",
        "title": "您有什么建议可以帮助我们改进产品？",
        "required": false,
        "multiline": true
      }
    ],
    "created_at": "2023-04-15T10:30:00Z",
    "updated_at": "2023-04-15T10:30:00Z",
    "published": false
  }
}`}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="get-survey">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              GET
                            </Badge>
                            <span>/surveys/{"{id}"}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium mb-2">获取问卷详情</h3>
                              <p className="text-muted-foreground mb-4">获取单个问卷的详细信息，包括问题和选项</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">路径参数</h4>
                              <table className="w-full border-collapse mb-4">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">参数</th>
                                    <th className="text-left py-2">类型</th>
                                    <th className="text-left py-2">描述</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b">
                                    <td className="py-2">id</td>
                                    <td className="py-2">string</td>
                                    <td className="py-2">问卷ID</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">响应</h4>
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2 z-10"
                                  onClick={() =>
                                    handleCopyCode(
                                      `{
  "data": {
    "id": "survey-123456",
    "title": "客户满意度调查",
    "description": "了解客户对我们产品和服务的满意度",
    "questions": [
      {
        "id": "q1",
        "type": "radio",
        "title": "您对我们的产品总体满意度如何？",
        "required": true,
        "options": [
          {"text": "非常满意", "value": "5"},
          {"text": "满意", "value": "4"},
          {"text": "一般", "value": "3"},
          {"text": "不满意", "value": "2"},
          {"text": "非常不满意", "value": "1"}
        ]
      },
      {
        "id": "q2",
        "type": "text",
        "title": "您有什么建议可以帮助我们改进产品？",
        "required": false,
        "multiline": true
      }
    ],
    "settings": {
      "showProgressBar": true,
      "showQuestionNumbers": true
    },
    "theme": {
      "primaryColor": "#3b82f6",
      "backgroundColor": "#ffffff"
    },
    "created_at": "2023-04-15T10:30:00Z",
    "updated_at": "2023-04-20T15:45:00Z",
    "published": true
  }
}`,
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                  <code>{`{
  "data": {
    "id": "survey-123456",
    "title": "客户满意度调查",
    "description": "了解客户对我们产品和服务的满意度",
    "questions": [
      {
        "id": "q1",
        "type": "radio",
        "title": "您对我们的产品总体满意度如何？",
        "required": true,
        "options": [
          {"text": "非常满意", "value": "5"},
          {"text": "满意", "value": "4"},
          {"text": "一般", "value": "3"},
          {"text": "不满意", "value": "2"},
          {"text": "非常不满意", "value": "1"}
        ]
      },
      {
        "id": "q2",
        "type": "text",
        "title": "您有什么建议可以帮助我们改进产品？",
        "required": false,
        "multiline": true
      }
    ],
    "settings": {
      "showProgressBar": true,
      "showQuestionNumbers": true
    },
    "theme": {
      "primaryColor": "#3b82f6",
      "backgroundColor": "#ffffff"
    },
    "created_at": "2023-04-15T10:30:00Z",
    "updated_at": "2023-04-20T15:45:00Z",
    "published": true
  }
}`}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/developer/api-explorer" className="gap-1">
                          在API Explorer中尝试
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* OpenAPI规范渲染 */}
              <div id="openapi-spec" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4">完整API规范</h2>
                <OpenApiRenderer specUrl="/openapi.yaml" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
