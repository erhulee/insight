'use client'

import Link from 'next/link'
import {
  FileText,
  Key,
  Code,
  BookOpen,
  Terminal,
  Puzzle,
  Zap,
  ChevronRight,
  ExternalLink,
  Copy,
} from 'lucide-react'
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
import { toast } from 'sonner'
import { PromotionalHeader } from '@/components/developer/promotional-header'
import { PromotionalHero } from '@/components/developer/promotional-hero'
import { PromotionalFeatures } from '@/components/developer/promotional-features'
import { PromotionalNews } from '@/components/developer/promotional-news'
import { PromotionalOpenForms } from '@/components/developer/promotional-open-forms'

export default function DeveloperPage() {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast('已复制', {
      description: '代码已复制到剪贴板',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
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
      <main className=" container mx-auto px-4 py-8">
        <PromotionalHero />

        {/* 能力直达 */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="mb-4 text-center">
            <span className="text-xs tracking-wider text-muted-foreground uppercase">能力直达</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link href="/developer/docs" className="group rounded-lg border bg-background hover:bg-muted transition-colors p-4 flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm">文档站</span>
            </Link>
            <Link href="/developer/api-keys" className="group rounded-lg border bg-background hover:bg-muted transition-colors p-4 flex items-center justify-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <span className="text-sm">API 密钥</span>
            </Link>
            <Link href="/developer/webhooks" className="group rounded-lg border bg-background hover:bg-muted transition-colors p-4 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">Webhooks</span>
            </Link>
            <Link href="/developer/api-explorer" className="group rounded-lg border bg-background hover:bg-muted transition-colors p-4 flex items-center justify-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm">API Explorer</span>
            </Link>
            <Link href="/developer/examples" className="group rounded-lg border bg-background hover:bg-muted transition-colors p-4 flex items-center justify-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <span className="text-sm">代码示例</span>
            </Link>
            <Link href="/openapi.yaml" className="group rounded-lg border bg-background hover:bg-muted transition-colors p-4 flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-sm">OpenAPI</span>
            </Link>
          </div>
        </div>

        {/* 宣传模块 */}
        <PromotionalFeatures />
        <PromotionalNews />
        <PromotionalOpenForms />

        {/* 主要功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          <Card className="flex flex-col hover:shadow-md transition-shadow border-muted/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>API密钥管理</CardTitle>
              </div>
              <CardDescription>创建/重置 API Key，最小权限与速率控制</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                管理应用级凭证，支持只读密钥与每分钟速率限制；写操作建议携带 Idempotency-Key。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/developer/api-keys">管理API密钥</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col hover:shadow-md transition-shadow border-muted/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>API文档</CardTitle>
              </div>
              <CardDescription>详细的API参考文档和使用指南</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                浏览完整的API文档，了解可用的端点、请求参数、响应格式和认证方法。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/developer/docs">查看文档</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col hover:shadow-md transition-shadow border-muted/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>API Explorer</CardTitle>
              </div>
              <CardDescription>交互式API测试工具</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                测试 REST 端点与响应，验证鉴权/签名/限流行为，生成多语言代码示例。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/developer/api-explorer">试用API</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col hover:shadow-md transition-shadow border-muted/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>OpenAPI自渲染</CardTitle>
              </div>
              <CardDescription>使用OpenAPI规范自动生成问卷界面</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                上传或提供OpenAPI规范，自动生成问卷界面，无需编写前端代码。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/developer/self-render">开始自渲染</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col hover:shadow-md transition-shadow border-muted/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>代码示例</CardTitle>
              </div>
              <CardDescription>多种编程语言的集成示例</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                浏览各种编程语言的代码示例，包括JavaScript、Python、PHP等，快速开始集成。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/developer/examples">查看示例</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col hover:shadow-md transition-shadow border-muted/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Webhooks</CardTitle>
              </div>
              <CardDescription>实时事件通知</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">
                订阅 response.submitted 等事件，HMAC-SHA256 签名（X-OpenEvent/X-OpenTs/X-OpenSig），失败自动重试。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/developer/webhooks">管理Webhooks</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 快速入门 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">快速入门</h2>
          <Card className="border-muted/40">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">创建 API 密钥</h3>
                    <p className="text-muted-foreground mb-4">
                      在开发者中心创建应用与密钥，可选只读密钥与速率限制；请妥善保管凭证。
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/developer/api-keys" className="gap-1">
                        创建API密钥
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">配置 Webhooks 与签名</h3>
                    <p className="text-muted-foreground mb-4">
                      在 Webhooks 页面设置回调、签名密钥与订阅事件；使用交互工具发送测试事件并校验 HMAC 签名。
                    </p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/developer/docs" className="gap-1">
                          查看文档
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/developer/api-explorer" className="gap-1">
                          试用API
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">调用 API（幂等与限流）</h3>
                    <p className="text-muted-foreground mb-4">
                      通过 REST 端点集成，写请求携带 Idempotency-Key；注意 429 返回与 Retry-After 处理。
                    </p>
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                        4
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">查看 PRD 与 OpenAPI</h3>
                        <p className="text-muted-foreground mb-4">
                          对照 PRD 能力清单与数据模型进行集成，参考 OpenAPI 规范与示例。
                        </p>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href="/developer/docs/open-platform-prd" className="gap-1">
                              打开 PRD 要点
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href="/openapi.yaml" className="gap-1">
                              下载 OpenAPI
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-10"
                        onClick={() =>
                          handleCopyCode(
                            `const response = await fetch("https://api.wenjuanxing.com/v1/surveys", {
  method: "GET",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                        <code>{`const response = await fetch("https://api.wenjuanxing.com/v1/surveys", {
  method: "GET",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
});

const data = await response.json();
console.log(data);`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 代码示例 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">代码示例</h2>
          <Tabs defaultValue="javascript">
            <TabsList className="mb-4">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            <TabsContent value="javascript" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>获取问卷列表</CardTitle>
                  <CardDescription>使用JavaScript获取问卷列表</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `// 使用Fetch API
async function getSurveys() {
  try {
    const response = await fetch("https://api.wenjuanxing.com/v1/surveys", {
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
                      <code>{`// 使用Fetch API
async function getSurveys() {
  try {
    const response = await fetch("https://api.wenjuanxing.com/v1/surveys", {
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>创建问卷</CardTitle>
                  <CardDescription>使用JavaScript创建新问卷</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `async function createSurvey() {
  const surveyData = {
    title: "客户满意度调查",
    description: "了解客户对我们产品和服务的满意度",
    questions: [
      {
        type: "radio",
        title: "您对我们的产品总体满意度如何？",
        required: true,
        options: [
          { text: "非常满意" },
          { text: "满意" },
          { text: "一般" },
          { text: "不满意" },
          { text: "非常不满意" }
        ]
      },
      {
        type: "text",
        title: "您有什么建议可以帮助我们改进产品？",
        required: false,
        multiline: true
      }
    ],
    published: false
  };

  try {
    const response = await fetch("https://api.wenjuanxing.com/v1/surveys", {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(surveyData)
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log("创建的问卷:", data);
    return data;
  } catch (error) {
    console.error("创建问卷失败:", error);
  }
}

// 调用函数
createSurvey();`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{`async function createSurvey() {
  const surveyData = {
    title: "客户满意度调查",
    description: "了解客户对我们产品和服务的满意度",
    questions: [
      {
        type: "radio",
        title: "您对我们的产品总体满意度如何？",
        required: true,
        options: [
          { text: "非常满意" },
          { text: "满意" },
          { text: "一般" },
          { text: "不满意" },
          { text: "非常不满意" }
        ]
      },
      {
        type: "text",
        title: "您有什么建议可以帮助我们改进产品？",
        required: false,
        multiline: true
      }
    ],
    published: false
  };

  try {
    const response = await fetch("https://api.wenjuanxing.com/v1/surveys", {
      method: "POST",
      headers: {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(surveyData)
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log("创建的问卷:", data);
    return data;
  } catch (error) {
    console.error("创建问卷失败:", error);
  }
}

// 调用函数
createSurvey();`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="python" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>获取问卷列表</CardTitle>
                  <CardDescription>使用Python获取问卷列表</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `import requests

def get_surveys():
    url = "https://api.wenjuanxing.com/v1/surveys"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # 如果响应状态码不是200，将引发HTTPError异常
        
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
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # 如果响应状态码不是200，将引发HTTPError异常
        
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>创建问卷</CardTitle>
                  <CardDescription>使用Python创建新问卷</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `import requests
import json

def create_survey():
    url = "https://api.wenjuanxing.com/v1/surveys"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    survey_data = {
        "title": "客户满意度调查",
        "description": "了解客户对我们产品和服务的满意度",
        "questions": [
            {
                "type": "radio",
                "title": "您对我们的产品总体满意度如何？",
                "required": True,
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
                "required": False,
                "multiline": True
            }
        ],
        "published": False
    }
    
    try:
        response = requests.post(url, headers=headers, json=survey_data)
        response.raise_for_status()
        
        data = response.json()
        print("创建的问卷:", data)
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP错误: {http_err}")
    except Exception as err:
        print(f"其他错误: {err}")

# 调用函数
create_survey()`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{`import requests
import json

def create_survey():
    url = "https://api.wenjuanxing.com/v1/surveys"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    survey_data = {
        "title": "客户满意度调查",
        "description": "了解客户对我们产品和服务的满意度",
        "questions": [
            {
                "type": "radio",
                "title": "您对我们的产品总体满意度如何？",
                "required": True,
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
                "required": False,
                "multiline": True
            }
        ],
        "published": False
    }
    
    try:
        response = requests.post(url, headers=headers, json=survey_data)
        response.raise_for_status()
        
        data = response.json()
        print("创建的问卷:", data)
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP错误: {http_err}")
    except Exception as err:
        print(f"其他错误: {err}")

# 调用函数
create_survey()`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="php" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>获取问卷列表</CardTitle>
                  <CardDescription>使用PHP获取问卷列表</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `<?php
                          function getSurveys() {
                              $url = "https://api.wenjuanxing.com/v1/surveys";
                              $headers = [
                                  "Authorization: Bearer YOUR_API_KEY",
                                  "Content-Type: application/json"
                              ];

                              $curl = curl_init();
                              curl_setopt_array($curl, [
                                  CURLOPT_URL => $url,
                                  CURLOPT_RETURNTRANSFER => true,
                                  CURLOPT_HTTPHEADER => $headers
                              ]);

                              $response = curl_exec($curl);
                              $err = curl_error($curl);

                              curl_close($curl);

                              if ($err) {
                                  echo "cURL Error: " . $err;
                                  return null;
                              } else {
                                  $data = json_decode($response, true);
                                  echo "问卷列表: ";
                                  print_r($data);
                                  return $data;
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
                      <code>{`<?php
function getSurveys() {
    $url = "https://api.wenjuanxing.com/v1/surveys";
    $headers = [
        "Authorization: Bearer YOUR_API_KEY",
        "Content-Type: application/json"
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        echo "cURL Error: " . $err;
        return null;
    } else {
        $data = json_decode($response, true);
        echo "问卷列表: ";
        print_r($data);
        return $data;
    }
}

// 调用函数
getSurveys();`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>创建问卷</CardTitle>
                  <CardDescription>使用PHP创建新问卷</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `<?php
function createSurvey() {
    $url = "https://api.wenjuanxing.com/v1/surveys";
    $headers = [
        "Authorization: Bearer YOUR_API_KEY",
        "Content-Type: application/json"
    ];

    $surveyData = [
        "title" => "客户满意度调查",
        "description" => "了解客户对我们产品和服务的满意度",
        "questions" => [
            [
                "type" => "radio",
                "title" => "您对我们的产品总体满意度如何？",
                "required" => true,
                "options" => [
                    ["text" => "非常满意"],
                    ["text" => "满意"],
                    ["text" => "一般"],
                    ["text" => "不满意"],
                    ["text" => "非常不  => "满意"],
                    ["text" => "一般"],
                    ["text" => "不满意"],
                    ["text" => "非常不满意"]
                ]
            ],
            [
                "type" => "text",
                "title" => "您有什么建议可以帮助我们改进产品？",
                "required" => false,
                "multiline" => true
            ]
        ],
        "published" => false
    ];

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($surveyData)
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    if ($err) {
        echo "cURL Error: " . $err;
        return null;
    } else {
        $data = json_decode($response, true);
        echo "创建的问卷: ";
        print_r($data);
        return $data;
    }
}

// 调用函数
createSurvey();`,
                        )
                      }
                    ></Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curl" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>获取问卷列表</CardTitle>
                  <CardDescription>使用cURL获取问卷列表</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `curl -X GET "https://api.wenjuanxing.com/v1/surveys" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json"`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{`curl -X GET "https://api.wenjuanxing.com/v1/surveys" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json"`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>创建问卷</CardTitle>
                  <CardDescription>使用cURL创建新问卷</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 z-10"
                      onClick={() =>
                        handleCopyCode(
                          `curl -X POST "https://api.wenjuanxing.com/v1/surveys" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "title": "客户满意度调查",
  "description": "了解客户对我们产品和服务的满意度",
  "questions": [
    {
      "type": "radio",
      "title": "您对我们的产品总体满意度如何？",
      "required": true,
      "options": [
        {"text": "非常满意"},
        {\"text": "满意"},
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
}'`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{`curl -X POST "https://api.wenjuanxing.com/v1/surveys" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
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
}'`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 教程和指南 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">教程和指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>创建您的第一个问卷</CardTitle>
                <CardDescription>学习如何使用API创建和管理问卷</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">
                  本教程将指导您使用问卷星API创建、编辑和发布问卷，以及如何管理问题和选项。
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/developer/tutorials/create-survey">查看教程</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>收集和分析回复数据</CardTitle>
                <CardDescription>了解如何获取和处理问卷回复数据</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">
                  学习如何使用API获取问卷回复数据，以及如何分析和可视化这些数据。
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/developer/tutorials/analyze-responses">查看教程</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>使用Webhooks实现自动化</CardTitle>
                <CardDescription>配置Webhooks接收实时事件通知</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground">
                  本教程将指导您配置Webhooks，以便在问卷提交、更新等事件发生时接收实时通知。
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/developer/tutorials/webhooks">查看教程</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">常见问题</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">如何获取API密钥？</h3>
                  <p className="text-muted-foreground">
                    您可以在
                    <Link href="/developer/api-keys" className="text-primary hover:underline mx-1">
                      API密钥管理
                    </Link>
                    页面创建和管理您的API密钥。请妥善保管您的API密钥，不要泄露给他人。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">API有使用限制吗？</h3>
                  <p className="text-muted-foreground">
                    是的，我们对API请求有速率限制。免费用户每分钟可以发送60个请求，每天最多1000个请求。付费用户有更高的限制。您可以在响应头中查看剩余的请求配额。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">如何处理API错误？</h3>
                  <p className="text-muted-foreground">
                    API错误会返回相应的HTTP状态码和错误信息。您应该检查响应状态码，并根据错误信息进行相应处理。常见的错误包括认证错误（401）、请求参数错误（400）和资源不存在（404）。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">API支持哪些认证方式？</h3>
                  <p className="text-muted-foreground">
                    我们使用Bearer Token认证方式。您需要在请求头中添加"Authorization: Bearer
                    YOUR_API_KEY"。
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">如何获取更多帮助？</h3>
                  <p className="text-muted-foreground">
                    如果您有任何问题或需要帮助，可以查看我们的
                    <Link href="/developer/docs" className="text-primary hover:underline mx-1">
                      API文档
                    </Link>
                    或
                    <Link href="/support" className="text-primary hover:underline mx-1">
                      联系我们的支持团队
                    </Link>
                    。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 资源链接 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">相关资源</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>开发者资源</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/developer/docs"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <BookOpen className="h-4 w-4" />
                      API文档
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/docs/open-platform-prd"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      开放平台 PRD
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/api-explorer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Terminal className="h-4 w-4" />
                      API Explorer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/examples"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Code className="h-4 w-4" />
                      代码示例
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/changelog"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      API更新日志
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/openapi.yaml"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      OpenAPI规范
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>社区和支持</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/support"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      技术支持
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://github.com/wenjuanxing/api-examples"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      GitHub示例仓库
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://forum.wenjuanxing.com"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      开发者论坛
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog/developer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      开发者博客
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/developer/status"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      API状态页面
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
