"use client"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, } from "lucide-react"
import { InsightBrand } from "@/components/common/insight-brand"
import { UserInfoAvatar } from "@/components/common/userInfoAvatar"
import { trpc } from "../_trpc/client"
import { TemplateCard } from "./_components/TemplateCard"
import { NoData } from "./_components/NoData"


export default function TemplatesPage() {
  const templateClient = trpc.GetTemplate.useQuery()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="min-h-screen bg-background">

      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className=" flex h-16 items-center justify-between px-4">
          <InsightBrand></InsightBrand>
          <div className=" flex flex-row gap-4" >
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                我的问卷
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

          {templateClient.isError ? <NoData></NoData> : templateClient.isLoading ? <div>loading</div> :
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templateClient.data?.map((template => (<TemplateCard questionsCnt={3} key={template.id} templateId={template.id} title={template.name} description={""} tags={[]}></TemplateCard>
              )))}
            </div>}
        </div>
      </main>
    </div>
  )
}
