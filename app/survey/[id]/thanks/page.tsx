"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Home } from "lucide-react"
import type { Survey } from "@/lib/types"
import { getFromLocalStorage } from "@/lib/utils"
import { RedirectHandler } from "@/components/redirect-handler"

export default function ThanksPage({ params }: { params: { id: string } }) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [redirectToHome, setRedirectToHome] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(10)

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

  // 倒计时重定向
  useEffect(() => {
    if (!isLoading && survey?.settings?.thankYouScreen?.redirectUrl) {
      const delay = survey.settings.thankYouScreen.redirectDelay || 10
      setRedirectCountdown(delay)

      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setRedirectToHome(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isLoading, survey])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  const thankYouTitle = survey?.settings?.thankYouScreen?.title || "感谢您的参与！"
  const thankYouDescription = survey?.settings?.thankYouScreen?.description || "您的反馈对我们非常重要。"
  const redirectUrl = survey?.settings?.thankYouScreen?.redirectUrl || "/"

  return (
    <div className="min-h-screen bg-background">
      {redirectToHome && <RedirectHandler redirectPath={redirectUrl} />}

      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <FileText className="h-6 w-6" />
            <span>问卷星</span>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12 max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{thankYouTitle}</CardTitle>
            <CardDescription>{thankYouDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">您的回答已成功提交。</p>
            {survey?.settings?.thankYouScreen?.redirectUrl && (
              <p className="text-sm text-muted-foreground mt-4">{redirectCountdown}秒后自动跳转...</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/" className="gap-1">
                <Home className="h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
