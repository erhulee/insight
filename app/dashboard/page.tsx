"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, FileText, BarChart3, Clock } from "lucide-react"
import type { Survey } from "@/lib/types"
import { RedirectHandler } from "@/components/redirect-handler"

export default function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [redirectToCreate, setRedirectToCreate] = useState(false)

  // 加载问卷数据
  useEffect(() => {
    // 模拟从API加载数据
    // 在实际应用中，这里应该从API获取问卷列表
    setTimeout(() => {
      const storedSurveys: Record<string, Survey> = {}

      // 从localStorage获取所有问卷
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("survey_")) {
          try {
            const survey = JSON.parse(localStorage.getItem(key) || "")
            storedSurveys[key.replace("survey_", "")] = survey
          } catch (error) {
            console.error("Error parsing survey:", error)
          }
        }
      }

      // 如果没有问卷，创建一个示例问卷
      if (Object.keys(storedSurveys).length === 0) {
        const exampleSurveys = [
          {
            id: "example-1",
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true,
          },
          {
            id: "example-2",
            title: "活动反馈表",
            description: "收集参与者对活动的反馈意见",
            questions: [],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            published: false,
          },
        ]

        exampleSurveys.forEach((survey) => {
          localStorage.setItem(`survey_${survey.id}`, JSON.stringify(survey))
          storedSurveys[survey.id] = survey
        })
      }

      setSurveys(Object.values(storedSurveys))
      setIsLoading(false)
    }, 1000)
  }, [])

  // 创建新问卷
  const handleCreateSurvey = () => {
    const newSurveyId = `survey-${Date.now()}`
    setRedirectToCreate(true)

    // 在实际应用中，这里应该调用API创建新问卷
    // 然后重定向到编辑页面
    localStorage.setItem(
      `survey_${newSurveyId}`,
      JSON.stringify({
        id: newSurveyId,
        title: "新问卷",
        description: "",
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false,
      }),
    )

    // 重定向到编辑页面
    window.location.href = `/dashboard/edit/${newSurveyId}`
  }

  // 过滤问卷
  const filteredSurveys = surveys.filter((survey) => {
    // 根据搜索查询过滤
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase())

    // 根据标签过滤
    if (activeTab === "all") return matchesSearch
    if (activeTab === "published") return matchesSearch && survey.published
    if (activeTab === "drafts") return matchesSearch && !survey.published

    return matchesSearch
  })

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {redirectToCreate && <RedirectHandler redirectPath={`/dashboard/edit/survey-${Date.now()}`} />}

      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <FileText className="h-6 w-6" />
            <span>问卷星</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium">
              我的问卷
            </Link>
            <Link href="/templates" className="text-sm font-medium text-muted-foreground">
              模板中心
            </Link>
            <Link href="/account" className="text-sm font-medium text-muted-foreground">
              账户设置
            </Link>
          </nav>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* 标题和创建按钮 */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">我的问卷</h1>
            <Button onClick={handleCreateSurvey} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              创建问卷
            </Button>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索问卷..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="published">已发布</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 问卷列表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // 加载状态
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-muted rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-4 w-1/3 bg-muted rounded"></div>
                  </CardFooter>
                </Card>
              ))
            ) : filteredSurveys.length > 0 ? (
              // 问卷列表
              filteredSurveys.map((survey) => (
                <Card key={survey.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>更新于 {formatDate(survey.updatedAt)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {survey.description || `包含 ${survey.questions.length} 个问题`}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          survey.published ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {survey.published ? "已发布" : "草稿"}
                      </span>
                      <span className="text-xs text-muted-foreground">{survey.questions.length} 个问题</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/edit/${survey.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      {survey.published && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/results/${survey.id}`}>
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // 空状态
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">没有找到问卷</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "尝试使用不同的搜索词或清除过滤器" : "创建您的第一个问卷开始使用"}
                </p>
                <Button onClick={handleCreateSurvey} className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  创建问卷
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
