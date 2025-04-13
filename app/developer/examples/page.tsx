"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Search, Copy, ExternalLink, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export default function ExamplesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "已复制",
      description: "代码已复制到剪贴板",
    })
  }

  // 示例数据
  const examples = [
    {
      id: "create-survey",
      title: "创建问卷",
      description: "创建一个新的问卷，包含多种题型",
      category: "surveys",
      languages: ["javascript", "python", "php"],
      difficulty: "beginner",
    },
    {
      id: "update-survey",
      title: "更新问卷",
      description: "更新现有问卷的标题、描述和问题",
      category: "surveys",
      languages: ["javascript", "python"],
      difficulty: "beginner",
    },
    {
      id: "collect-responses",
      title: "收集问卷回复",
      description: "创建一个表单，提交问卷回复",
      category: "responses",
      languages: ["javascript", "html"],
      difficulty: "intermediate",
    },
    {
      id: "analyze-data",
      title: "分析问卷数据",
      description: "获取和分析问卷统计数据",
      category: "stats",
      languages: ["javascript", "python"],
      difficulty: "intermediate",
    },
    {
      id: "webhook-handler",
      title: "Webhook处理器",
      description: "创建一个处理问卷星Webhook的服务器",
      category: "webhooks",
      languages: ["javascript", "python", "php"],
      difficulty: "advanced",
    },
    {
      id: "custom-ui",
      title: "自定义问卷界面",
      description: "使用React创建自定义问卷界面",
      category: "ui",
      languages: ["javascript", "react"],
      difficulty: "advanced",
    },
  ]

  // 过滤示例
  const filteredExamples = examples.filter((example) => {
    // 搜索过滤
    const matchesSearch =
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase())

    // 标签过滤
    const matchesTab = activeTab === "all" || example.category === activeTab

    return matchesSearch && matchesTab
  })

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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">代码示例</h1>
          <p className="text-muted-foreground text-lg">浏览各种编程语言的集成示例，快速开始使用问卷星API</p>
        </div>

        {/* 搜索和过滤 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索示例..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="surveys">问卷</TabsTrigger>
              <TabsTrigger value="responses">回复</TabsTrigger>
              <TabsTrigger value="stats">统计</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="ui">UI</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 示例列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredExamples.map((example) => (
            <Card key={example.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{example.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      example.difficulty === "beginner"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : example.difficulty === "intermediate"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                  >
                    {example.difficulty === "beginner"
                      ? "初级"
                      : example.difficulty === "intermediate"
                        ? "中级"
                        : "高级"}
                  </Badge>
                </div>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  {example.languages.map((language) => (
                    <Badge key={language} variant="secondary" className="text-xs">
                      {language === "javascript"
                        ? "JavaScript"
                        : language === "python"
                          ? "Python"
                          : language === "php"
                            ? "PHP"
                            : language === "react"
                              ? "React"
                              : language === "html"
                                ? "HTML"
                                : language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/developer/examples/${example.id}`}>查看示例</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 示例详情 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">创建问卷示例</h2>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>创建问卷</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  初级
                </Badge>
              </div>
              <CardDescription>创建一个新的问卷，包含多种题型</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript">
                <TabsList className="mb-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript" className="relative">
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
        type: "checkbox",
        title: "您最喜欢我们产品的哪些方面？（可多选）",
        required: false,
        options: [
          { text: "用户界面" },
          { text: "功能丰富" },
          { text: "易用性" },
          { text: "性能" },
          { text: "客户支持" }
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
        type: "checkbox",
        title: "您最喜欢我们产品的哪些方面？（可多选）",
        required: false,
        options: [
          { text: "用户界面" },
          { text: "功能丰富" },
          { text: "易用性" },
          { text: "性能" },
          { text: "客户支持" }
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
                </TabsContent>

                <TabsContent value="python" className="relative">
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
                "type": "checkbox",
                "title": "您最喜欢我们产品的哪些方面？（可多选）",
                "required": False,
                "options": [
                    {"text": "用户界面"},
                    {"text": "功能丰富"},
                    {"text": "易用性"},
                    {"text": "性能"},
                    {"text": "客户支持"}
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
                "type": "checkbox",
                "title": "您最喜欢我们产品的哪些方面？（可多选）",
                "required": False,
                "options": [
                    {"text": "用户界面"},
                    {"text": "功能丰富"},
                    {"text": "易用性"},
                    {"text": "性能"},
                    {"text": "客户支持"}
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
                </TabsContent>

                <TabsContent value="php" className="relative">
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
                    ["text" => "非常不满意"]
                ]
            ],
            [
                "type" => "checkbox",
                "title" => "您最喜欢我们产品的哪些方面？（可多选）",
                "required" => false,
                "options" => [
                    ["text" => "用户界面"],
                    ["text" => "功能丰富"],
                    ["text" => "易用性"],
                    ["text" => "性能"],
                    ["text" => "客户支持"]
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
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>{`<?php
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
                    ["text" => "非常不满意"]
                ]
            ],
            [
                "type" => "checkbox",
                "title" => "您最喜欢我们产品的哪些方面？（可多选）",
                "required" => false,
                "options" => [
                    ["text" => "用户界面"],
                    ["text" => "功能丰富"],
                    ["text" => "易用性"],
                    ["text" => "性能"],
                    ["text" => "客户支持"]
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
createSurvey();`}</code>
                  </pre>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">说明</h3>
                <p className="text-muted-foreground">
                  这个示例演示了如何使用API创建一个新的问卷，包含单选题、多选题和文本题。您可以根据需要修改问卷标题、描述和问题。
                </p>
                <p className="text-muted-foreground">
                  创建问卷后，您可以通过更新问卷的published字段来发布问卷，或者使用/surveys/{"{id}"}/publish端点。
                </p>

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/developer/api-explorer" className="gap-1">
                      在API Explorer中尝试
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="#" className="gap-1">
                      下载完整示例
                      <Download className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 相关资源 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">相关资源</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API文档</CardTitle>
                <CardDescription>查看完整的API文档</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  浏览完整的API文档，了解可用的端点、请求参数、响应格式和认证方法。
                </p>
                <Button asChild>
                  <Link href="/developer/docs">查看文档</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Explorer</CardTitle>
                <CardDescription>交互式API测试工具</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  使用交互式工具测试API请求，查看响应结果，并生成多种编程语言的代码示例。
                </p>
                <Button asChild>
                  <Link href="/developer/api-explorer">试用API</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
