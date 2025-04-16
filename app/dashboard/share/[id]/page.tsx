"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FileText, Copy, QrCode, Share2, Calendar, LinkIcon, Download } from "lucide-react"

export default function SurveyShare() {
  const { id } = useParams()
  const [surveyUrl, setSurveyUrl] = useState(`https://wenjuanxing.com/s/${id}`)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("link")

  // 复制链接
  const copyLink = () => {
    navigator.clipboard.writeText(surveyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className=" flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
              <FileText className="h-6 w-6" />
              <span>问卷星</span>
            </Link>
            <h1 className="text-lg font-medium">分享问卷</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/edit/${id}`}>
              <Button variant="outline" size="sm">
                返回编辑
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>用户满意度调查</CardTitle>
                <CardDescription>创建于 2023-04-15 · 124 份回复</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">问卷状态</p>
                      <p className="text-sm text-green-600">已发布，正在收集回复</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="survey-active" defaultChecked />
                    <Label htmlFor="survey-active">启用问卷</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link">链接分享</TabsTrigger>
                <TabsTrigger value="qrcode">二维码</TabsTrigger>
                <TabsTrigger value="embed">嵌入网页</TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>问卷链接</CardTitle>
                    <CardDescription>通过链接分享问卷</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input value={surveyUrl} readOnly className="flex-1" />
                      <Button onClick={copyLink} variant="outline" className="gap-1">
                        <Copy className="h-4 w-4" />
                        {copied ? "已复制" : "复制"}
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">问卷将一直有效</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      社交分享
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="qrcode" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>问卷二维码</CardTitle>
                    <CardDescription>扫描二维码填写问卷</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed">
                      <QrCode className="h-24 w-24 text-gray-300" />
                    </div>
                    <Button className="mt-4 gap-1">
                      <Download className="h-4 w-4" />
                      下载二维码
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="embed" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>嵌入代码</CardTitle>
                    <CardDescription>将问卷嵌入到您的网站</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md bg-gray-50 p-4">
                        <code className="text-sm text-gray-800">
                          {`<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                        </code>
                      </div>
                      <Button onClick={copyLink} variant="outline" className="gap-1">
                        <Copy className="h-4 w-4" />
                        {copied ? "已复制" : "复制代码"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>高级设置</CardTitle>
                <CardDescription>自定义问卷分享选项</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">问卷截止日期</Label>
                  <Input type="date" id="expiry-date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-responses">最大回复数量</Label>
                  <Input type="number" id="max-responses" placeholder="不限制" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="password-protect" />
                    <Label htmlFor="password-protect">密码保护</Label>
                  </div>
                  <Input type="password" placeholder="设置访问密码" disabled />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="collect-email" />
                  <Label htmlFor="collect-email">收集填写者邮箱</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="one-response" defaultChecked />
                  <Label htmlFor="one-response">每人只能提交一次</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button>保存设置</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
