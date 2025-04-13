"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, BarChart3, PieChart, ListFilter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SurveyResults() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState("summary")

  // 模拟问卷数据
  const survey = {
    id,
    title: "用户满意度调查",
    description: "感谢您参与本次调查，您的反馈对我们非常重要。",
    createdAt: "2023-04-15",
    updatedAt: "2023-04-20",
    responses: 124,
    questions: [
      {
        id: "q1",
        type: "radio",
        title: "您对我们的产品总体满意度如何？",
        options: [
          { id: "o1", text: "非常满意" },
          { id: "o2", text: "满意" },
          { id: "o3", text: "一般" },
          { id: "o4", text: "不满意" },
          { id: "o5", text: "非常不满意" },
        ],
        stats: [
          { option: "非常满意", count: 45, percentage: 36 },
          { option: "满意", count: 52, percentage: 42 },
          { option: "一般", count: 18, percentage: 15 },
          { option: "不满意", count: 6, percentage: 5 },
          { option: "非常不满意", count: 3, percentage: 2 },
        ],
      },
      {
        id: "q2",
        type: "checkbox",
        title: "您最喜欢我们产品的哪些方面？（可多选）",
        options: [
          { id: "o1", text: "用户界面" },
          { id: "o2", text: "功能丰富" },
          { id: "o3", text: "易用性" },
          { id: "o4", text: "性能" },
          { id: "o5", text: "客户支持" },
        ],
        stats: [
          { option: "用户界面", count: 78, percentage: 63 },
          { option: "功能丰富", count: 92, percentage: 74 },
          { option: "易用性", count: 65, percentage: 52 },
          { option: "性能", count: 43, percentage: 35 },
          { option: "客户支持", count: 31, percentage: 25 },
        ],
      },
      {
        id: "q3",
        type: "text",
        title: "您对我们产品有什么建议或反馈？",
        responses: [
          "希望能增加更多自定义选项",
          "界面可以更简洁一些",
          "移动端体验需要优化",
          "总体来说很满意，希望继续保持",
          "希望能提供更多模板",
        ],
      },
    ],
    respondents: [
      { id: "r1", submittedAt: "2023-04-16 09:23", email: "user1@example.com" },
      { id: "r2", submittedAt: "2023-04-16 10:45", email: "user2@example.com" },
      { id: "r3", submittedAt: "2023-04-16 14:12", email: "user3@example.com" },
      { id: "r4", submittedAt: "2023-04-17 08:30", email: "user4@example.com" },
      { id: "r5", submittedAt: "2023-04-17 16:05", email: "user5@example.com" },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
              <FileText className="h-6 w-6" />
              <span>问卷星</span>
            </Link>
            <h1 className="text-lg font-medium">{survey.title} - 数据分析</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              导出数据
            </Button>
            <Link href={`/dashboard/edit/${id}`}>
              <Button variant="outline" size="sm">
                返回编辑
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container px-4">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">总回复数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{survey.responses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">完成率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">平均完成时间</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3分42秒</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="summary">数据概览</TabsTrigger>
                <TabsTrigger value="questions">问题分析</TabsTrigger>
                <TabsTrigger value="respondents">回复列表</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>回复趋势</CardTitle>
                    <CardDescription>过去30天的回复数量</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">这里将显示回复趋势图表</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="mt-4 space-y-6">
                {survey.questions.map((question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle>{question.title}</CardTitle>
                      <CardDescription>
                        {question.type === "radio" ? "单选题" : question.type === "checkbox" ? "多选题" : "文本题"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(question.type === "radio" || question.type === "checkbox") && (
                        <div className="space-y-4">
                          <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                            <div className="text-center">
                              <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">这里将显示选项分布图表</p>
                            </div>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>选项</TableHead>
                                <TableHead className="text-right">回复数</TableHead>
                                <TableHead className="text-right">百分比</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {question.stats.map((stat, index) => (
                                <TableRow key={index}>
                                  <TableCell>{stat.option}</TableCell>
                                  <TableCell className="text-right">{stat.count}</TableCell>
                                  <TableCell className="text-right">{stat.percentage}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {question.type === "text" && (
                        <div className="space-y-4">
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" className="gap-1">
                              <ListFilter className="h-4 w-4" />
                              筛选
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.responses.map((response, index) => (
                              <div key={index} className="rounded-md border p-3">
                                {response}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="respondents" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>回复列表</CardTitle>
                    <CardDescription>所有提交的回复</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>提交时间</TableHead>
                          <TableHead>邮箱</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {survey.respondents.map((respondent) => (
                          <TableRow key={respondent.id}>
                            <TableCell>{respondent.submittedAt}</TableCell>
                            <TableCell>{respondent.email}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                查看详情
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
