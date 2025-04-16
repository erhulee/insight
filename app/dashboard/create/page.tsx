"use client"

import { useState } from "react"
import Link from "next/link"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, LayoutTemplateIcon as Template, ArrowLeft, Loader2, AudioLines } from "lucide-react"
import { saveToLocalStorage } from "@/lib/utils"
import { RedirectHandler } from "@/components/redirect-handler"
import { toast } from "sonner"
import { InsightBrand } from "@/components/common/insight-brand"

// 模板数据
const FEATURED_TEMPLATES = [
  {
    id: "template-1",
    title: "客户满意度调查",
    description: "收集客户对产品或服务的反馈，了解满意度和改进点",
    category: "客户反馈",
    questions: 8,
  },
  {
    id: "template-2",
    title: "活动报名表",
    description: "收集活动参与者的基本信息和特殊需求",
    category: "活动管理",
    questions: 6,
  },
  {
    id: "template-3",
    title: "产品市场调研",
    description: "了解目标用户的需求和偏好，为产品决策提供依据",
    category: "市场研究",
    questions: 10,
  },
  {
    id: "template-4",
    title: "员工满意度调查",
    description: "了解员工对工作环境、管理和公司文化的看法",
    category: "人力资源",
    questions: 12,
  },
]

export default function CreateSurveyPage() {
  const [title, setTitle] = useState("新问卷")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [redirectToEdit, setRedirectToEdit] = useState(false)
  const [newSurveyId, setNewSurveyId] = useState("")
  const [activeTab, setActiveTab] = useState("blank")

  // 创建空白问卷
  const handleCreateBlankSurvey = async () => {
    if (!title.trim()) {
      toast("请输入问卷标题", {
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // 生成唯一ID
      const surveyId = `survey-${uuidv4()}`
      setNewSurveyId(surveyId)

      // 创建问卷数据
      const newSurvey = {
        id: surveyId,
        title: title.trim(),
        description: description.trim(),
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false,
      }

      // 保存到本地存储（实际应用中应该调用API）
      saveToLocalStorage(`survey_${surveyId}`, newSurvey)

      // 显示成功消息
      toast({
        title: "问卷创建成功",
        description: "正在跳转到编辑页面...",
      })

      // 设置重定向标志
      setRedirectToEdit(true)
    } catch (error) {
      console.error("创建问卷失败:", error)
      toast({
        title: "创建失败",
        description: "创建问卷时出现错误，请重试",
        variant: "destructive",
      })
      setIsCreating(false)
    }
  }

  // 使用模板创建问卷
  const handleCreateFromTemplate = async (templateId: string) => {
    setIsCreating(true)

    try {
      // 生成唯一ID
      const surveyId = `survey-${uuidv4()}`
      setNewSurveyId(surveyId)

      // 获取模板数据（实际应用中应该从API获取）
      const template = FEATURED_TEMPLATES.find((t) => t.id === templateId)

      // 创建基于模板的问卷数据
      const newSurvey = {
        id: surveyId,
        title: template ? `${template.title} 副本` : title.trim(),
        description: template ? template.description : description.trim(),
        questions: [], // 实际应用中应该包含模板的问题
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false,
      }

      // 保存到本地存储（实际应用中应该调用API）
      saveToLocalStorage(`survey_${surveyId}`, newSurvey)

      // 显示成功消息
      toast({
        title: "问卷创建成功",
        description: "正在跳转到编辑页面...",
      })

      // 设置重定向标志
      setRedirectToEdit(true)
    } catch (error) {
      console.error("创建问卷失败:", error)
      toast({
        title: "创建失败",
        description: "创建问卷时出现错误，请重试",
        variant: "destructive",
      })
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {redirectToEdit && <RedirectHandler redirectPath={`/dashboard/edit/${newSurveyId}`} />}

      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <InsightBrand></InsightBrand>
            <h1 className="text-lg font-medium">创建问卷</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Link>
          </Button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blank" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              空白问卷
            </TabsTrigger>
            <TabsTrigger value="template" className="gap-2">
              <Template className="h-4 w-4" />
              使用模板
            </TabsTrigger>
          </TabsList>

          {/* 空白问卷选项 */}
          <TabsContent value="blank" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>创建空白问卷</CardTitle>
                <CardDescription>从零开始创建一个全新的问卷</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    问卷标题 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入问卷标题"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    问卷描述（可选）
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="输入问卷描述或说明"
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateBlankSurvey} disabled={isCreating} className="w-full">
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    "创建问卷"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 模板选项 */}
          <TabsContent value="template" className="mt-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">精选模板</h2>
              <p className="text-muted-foreground">选择一个模板快速开始，您可以在创建后自由编辑</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURED_TEMPLATES.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {template.category}
                      </span>
                      <span>{template.questions} 个问题</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCreateFromTemplate(template.id)}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          创建中...
                        </>
                      ) : (
                        "使用此模板"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/templates">浏览更多模板</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
