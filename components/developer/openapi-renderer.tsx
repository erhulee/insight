"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Copy, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface OpenApiRendererProps {
  specUrl: string
}

export function OpenApiRenderer({ specUrl }: OpenApiRendererProps) {
  const [spec, setSpec] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch(specUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        let data

        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          // Assume YAML - in a real app, you'd use a YAML parser here
          const text = await response.text()
          // Mock parsing for demo purposes
          data = {
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
                },
              },
            },
          }
        }

        setSpec(data)
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching OpenAPI spec:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setIsLoading(false)
      }
    }

    fetchSpec()
  }, [specUrl])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast("已复制", {
      description: "代码已复制到剪贴板",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">加载失败</CardTitle>
          <CardDescription>无法加载API规范</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!spec) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* API信息 */}
      <Card>
        <CardHeader>
          <CardTitle>{spec.info.title}</CardTitle>
          <CardDescription>版本: {spec.info.version}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{spec.info.description}</p>

          {spec.info.contact && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">联系方式</h3>
              <ul className="text-sm">
                {spec.info.contact.name && <li>名称: {spec.info.contact.name}</li>}
                {spec.info.contact.email && <li>邮箱: {spec.info.contact.email}</li>}
                {spec.info.contact.url && <li>网址: {spec.info.contact.url}</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 服务器信息 */}
      {spec.servers && spec.servers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>服务器</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {spec.servers.map((server: any, index: number) => (
                <li key={index} className="flex flex-col">
                  <span className="font-medium">{server.url}</span>
                  {server.description && <span className="text-sm text-muted-foreground">{server.description}</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* API端点 */}
      <Card>
        <CardHeader>
          <CardTitle>API端点</CardTitle>
          <CardDescription>可用的API端点列表</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(spec.paths || {}).map(([path, methods]: [string, any]) => (
              <AccordionItem key={path} value={path}>
                <AccordionTrigger className="text-sm font-medium">{path}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-4">
                    {Object.entries(methods).map(([method, details]: [string, any]) => (
                      <div key={`${path}-${method}`} className="border rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={
                              method === "get"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : method === "post"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : method === "put"
                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    : method === "delete"
                                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {method.toUpperCase()}
                          </Badge>
                          <h3 className="font-medium">{details.summary}</h3>
                        </div>

                        {details.description && (
                          <p className="text-sm text-muted-foreground mb-4">{details.description}</p>
                        )}

                        <Tabs defaultValue="parameters">
                          <TabsList>
                            <TabsTrigger value="parameters">参数</TabsTrigger>
                            <TabsTrigger value="responses">响应</TabsTrigger>
                            <TabsTrigger value="examples">示例</TabsTrigger>
                          </TabsList>

                          <TabsContent value="parameters">
                            {details.parameters && details.parameters.length > 0 ? (
                              <div className="space-y-4">
                                <table className="min-w-full border-collapse">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="py-2 px-4 text-left font-medium">名称</th>
                                      <th className="py-2 px-4 text-left font-medium">位置</th>
                                      <th className="py-2 px-4 text-left font-medium">类型</th>
                                      <th className="py-2 px-4 text-left font-medium">必填</th>
                                      <th className="py-2 px-4 text-left font-medium">描述</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.parameters.map((param: any, index: number) => (
                                      <tr key={index} className="border-b">
                                        <td className="py-2 px-4 font-mono text-xs">{param.name}</td>
                                        <td className="py-2 px-4">{param.in}</td>
                                        <td className="py-2 px-4">{param.schema?.type || "-"}</td>
                                        <td className="py-2 px-4">{param.required ? "是" : "否"}</td>
                                        <td className="py-2 px-4">{param.description || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">无参数</p>
                            )}

                            {details.requestBody && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">请求体</h4>
                                {details.requestBody.required && <p className="text-xs text-destructive mb-2">必填</p>}
                                {details.requestBody.content &&
                                  Object.entries(details.requestBody.content).map(
                                    ([contentType, content]: [string, any]) => (
                                      <div key={contentType} className="space-y-2">
                                        <p className="text-xs font-mono">{contentType}</p>
                                        {content.example && (
                                          <div className="relative">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="absolute right-2 top-2"
                                              onClick={() => handleCopyCode(JSON.stringify(content.example, null, 2))}
                                            >
                                              <Copy className="h-4 w-4" />
                                            </Button>
                                            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                                              <code>{JSON.stringify(content.example, null, 2)}</code>
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    ),
                                  )}
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="responses">
                            {details.responses && Object.entries(details.responses).length > 0 ? (
                              <div className="space-y-4">
                                {Object.entries(details.responses).map(([code, response]: [string, any]) => (
                                  <div key={code} className="border rounded-md p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge
                                        variant="outline"
                                        className={
                                          code.startsWith("2")
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : code.startsWith("4")
                                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                              : code.startsWith("5")
                                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                        }
                                      >
                                        {code}
                                      </Badge>
                                      <h4 className="font-medium">{response.description}</h4>
                                    </div>

                                    {response.content &&
                                      Object.entries(response.content).map(([contentType, content]: [string, any]) => (
                                        <div key={contentType} className="mt-2">
                                          <p className="text-xs font-mono mb-2">{contentType}</p>
                                          {content.example && (
                                            <div className="relative">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-2"
                                                onClick={() => handleCopyCode(JSON.stringify(content.example, null, 2))}
                                              >
                                                <Copy className="h-4 w-4" />
                                              </Button>
                                              <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                                                <code>{JSON.stringify(content.example, null, 2)}</code>
                                              </pre>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">无响应信息</p>
                            )}
                          </TabsContent>

                          <TabsContent value="examples">
                            <div className="space-y-4">
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2"
                                  onClick={() =>
                                    handleCopyCode(
                                      `curl -X ${method.toUpperCase()} "https://api.wenjuanxing.com/v1${path}" \\\n-H "Authorization: Bearer YOUR_API_KEY" \\\n-H "Content-Type: application/json"`,
                                    )
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                                  <code>{`curl -X ${method.toUpperCase()} "https://api.wenjuanxing.com/v1${path}" \\\n-H "Authorization: Bearer YOUR_API_KEY" \\\n-H "Content-Type: application/json"`}</code>
                                </pre>
                              </div>

                              <Button variant="outline" size="sm" className="gap-1">
                                在API Explorer中尝试
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
