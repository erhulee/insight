"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Smartphone, Monitor, Tablet } from "lucide-react"
import { getFromLocalStorage } from "@/lib/utils"
import type { Survey } from "@/lib/types"

export default function SurveyPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  // 加载问卷数据
  useEffect(() => {
    // 模拟从API加载数据
    setTimeout(() => {
      try {
        const loadedSurvey = getFromLocalStorage<Survey>(`survey_${params.id}`, null)
        setSurvey(loadedSurvey)
        setIsLoading(false)
      } catch (error) {
        console.error("加载问卷失败:", error)
        setIsLoading(false)
      }
    }, 500)
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载问卷中...</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>问卷不存在</CardTitle>
            <CardDescription>您访问的问卷不存在或已被删除</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              返回首页
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 渲染问卷内容
  const renderSurveyContent = () => {
    return (
      <div className="min-h-full bg-background p-4">
        {/* 问卷标题和描述 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
          {survey.description && <p className="text-muted-foreground">{survey.description}</p>}
        </div>

        {/* 问题列表 */}
        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="bg-card rounded-lg border p-4 shadow-sm">
              <div className="flex items-start gap-1 mb-2">
                <h3 className="text-base font-medium">
                  {index + 1}. {question.title}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </h3>
              </div>
              {question.description && <p className="text-sm text-muted-foreground mb-4">{question.description}</p>}

              {/* 根据问题类型渲染不同的输入控件 */}
              {/* 这里只是预览，不需要实际功能 */}
              {question.type === "text" && (
                <input
                  type="text"
                  placeholder={question.placeholder || "请输入..."}
                  className="w-full p-2 border rounded-md"
                  disabled
                />
              )}

              {question.type === "radio" && (
                <div className="space-y-2">
                  {question.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input type="radio" disabled className="h-4 w-4" />
                      <label className="text-sm">{option.text}</label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "checkbox" && (
                <div className="space-y-2">
                  {question.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input type="checkbox" disabled className="h-4 w-4 rounded" />
                      <label className="text-sm">{option.text}</label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "dropdown" && (
                <select className="w-full p-2 border rounded-md" disabled>
                  <option value="">请选择...</option>
                  {question.options?.map((option, i) => (
                    <option key={i} value={option.value}>
                      {option.text}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* 提交按钮 */}
        <div className="mt-8 flex justify-end">
          <Button className="px-8" disabled>
            提交问卷
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <FileText className="h-6 w-6" />
            <span>问卷星</span>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={device} onValueChange={(value) => setDevice(value as any)}>
              <TabsList>
                <TabsTrigger value="desktop" className="px-3">
                  <Monitor className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="tablet" className="px-3">
                  <Tablet className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="mobile" className="px-3">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/edit/${params.id}`}>返回编辑</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4">
        <div className="mx-auto flex justify-center">
          <div
            className={`transition-all duration-300 ease-in-out border rounded-lg shadow-sm overflow-hidden ${
              device === "desktop"
                ? "w-full max-w-4xl"
                : device === "tablet"
                  ? "w-[768px] max-w-full"
                  : "w-[375px] max-w-full"
            }`}
          >
            {renderSurveyContent()}
          </div>
        </div>
      </main>
    </div>
  )
}
