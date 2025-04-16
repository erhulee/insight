"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Tag, Users, BarChart, Briefcase, GraduationCap, Heart, ShoppingCart, LayoutDashboard } from "lucide-react"
import { saveToLocalStorage } from "@/lib/utils"
import { RedirectHandler } from "@/components/redirect-handler"
import { toast } from "sonner"
import { InsightBrand } from "@/components/common/insight-brand"
import { UserInfoAvatar } from "@/components/common/userInfoAvatar"

// 模板数据
const TEMPLATES = [
  {
    id: "template-1",
    title: "客户满意度调查",
    description: "收集客户对产品或服务的反馈，了解满意度和改进点",
    category: "客户反馈",
    questions: 8,
    popular: true,
    featured: true,
  },
  {
    id: "template-2",
    title: "活动报名表",
    description: "收集活动参与者的基本信息和特殊需求",
    category: "活动管理",
    questions: 6,
    popular: true,
    featured: true,
  },
  {
    id: "template-3",
    title: "产品市场调研",
    description: "了解目标用户的需求和偏好，为产品决策提供依据",
    category: "市场研究",
    questions: 10,
    popular: false,
    featured: true,
  },
  {
    id: "template-4",
    title: "员工满意度调查",
    description: "了解员工对工作环境、管理和公司文化的看法",
    category: "人力资源",
    questions: 12,
    popular: true,
    featured: false,
  },
  {
    id: "template-5",
    title: "课程评价表",
    description: "收集学生对课程内容、教学方法和教师表现的反馈",
    category: "教育",
    questions: 9,
    popular: false,
    featured: false,
  },
  {
    id: "template-6",
    title: "网站用户体验调查",
    description: "了解用户对网站设计、功能和易用性的评价",
    category: "用户体验",
    questions: 7,
    popular: true,
    featured: false,
  },
  {
    id: "template-7",
    title: "会议反馈表",
    description: "收集参会者对会议内容、组织和设施的评价",
    category: "活动管理",
    questions: 5,
    popular: false,
    featured: false,
  },
  {
    id: "template-8",
    title: "产品反馈调查",
    description: "收集用户对产品功能、性能和价值的反馈",
    category: "产品研发",
    questions: 11,
    popular: true,
    featured: false,
  },
  {
    id: "template-9",
    title: "健康状况问卷",
    description: "收集个人健康状况、生活习惯和健康目标信息",
    category: "健康医疗",
    questions: 15,
    popular: false,
    featured: false,
  },
  {
    id: "template-10",
    title: "电商购物体验",
    description: "了解顾客对购物流程、产品质量和客户服务的评价",
    category: "电子商务",
    questions: 8,
    popular: true,
    featured: false,
  },
]

// 类别图标映射
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  客户反馈: <Users className="h-4 w-4" />,
  活动管理: <Tag className="h-4 w-4" />,
  市场研究: <BarChart className="h-4 w-4" />,
  人力资源: <Briefcase className="h-4 w-4" />,
  教育: <GraduationCap className="h-4 w-4" />,
  用户体验: <Users className="h-4 w-4" />,
  产品研发: <Tag className="h-4 w-4" />,
  健康医疗: <Heart className="h-4 w-4" />,
  电子商务: <ShoppingCart className="h-4 w-4" />,
}

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [redirectToEdit, setRedirectToEdit] = useState(false)
  const [newSurveyId, setNewSurveyId] = useState("")

  // 获取所有类别
  const categories = Array.from(new Set(TEMPLATES.map((template) => template.category)))

  // 过滤模板
  const filteredTemplates = TEMPLATES.filter((template) => {
    // 搜索过滤
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    // 类别过滤
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    // 标签过滤
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "popular" && template.popular) ||
      (activeTab === "featured" && template.featured)

    return matchesSearch && matchesCategory && matchesTab
  })

  // 使用模板创建问卷
  const handleUseTemplate = async (templateId: string) => {
    setIsCreating(true)

    try {
      // 生成唯一ID
      const surveyId = `survey-${uuidv4()}`
      setNewSurveyId(surveyId)

      // 获取模板数据
      const template = TEMPLATES.find((t) => t.id === templateId)

      if (!template) {
        throw new Error("模板不存在")
      }

      // 创建基于模板的问卷数据
      const newSurvey = {
        id: surveyId,
        title: `${template.title} 副本`,
        description: template.description,
        questions: [], // 实际应用中应该包含模板的问题
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false,
      }

      // 保存到本地存储（实际应用中应该调用API）
      saveToLocalStorage(`survey_${surveyId}`, newSurvey)

      // 显示成功消息
      toast("问卷创建成功", {
        description: "正在跳转到编辑页面...",
      })

      // 设置重定向标志
      setRedirectToEdit(true)
    } catch (error) {
      console.error("创建问卷失败:", error)
      toast("创建失败", {
        description: "创建问卷时出现错误，请重试",
      })
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {redirectToEdit && <RedirectHandler redirectPath={`/dashboard/edit/${newSurveyId}`} />}

      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className=" flex h-16 items-center justify-between px-4">
          <InsightBrand></InsightBrand>
          <div className=" flex flex-row gap-4" >
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                我的问卷
              </Link>
              <Link href="/templates" className="text-sm font-medium text-primary">
                模板中心
              </Link>
            </nav>
            <UserInfoAvatar></UserInfoAvatar>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8 flex flex-col justify-start items-start">
            <h1 className="text-3xl font-bold mb-2">问卷模板库</h1>
            <p className="text-muted-foreground">选择一个专业设计的模板，快速开始您的问卷调查</p>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索模板..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类别</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 标签页 */}
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="popular">热门</TabsTrigger>
              <TabsTrigger value="featured">精选</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 模板列表 */}
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
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
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        {CATEGORY_ICONS[template.category]}
                        {template.category}
                      </span>
                      <span>{template.questions} 个问题</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUseTemplate(template.id)}
                      disabled={isCreating}
                    >
                      使用此模板
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">未找到匹配的模板</h3>
              <p className="text-muted-foreground mb-4">尝试使用不同的搜索词或清除过滤器</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setActiveTab("all")
                }}
              >
                清除筛选条件
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
