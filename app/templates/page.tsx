'use client'
import type React from 'react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'
import { trpc } from '../_trpc/client'
import { TemplateCard } from './_components/TemplateCard'
import { NoData } from './_components/NoData'
import { LayoutHeader } from '@/components/layout-header'

export default function TemplatesPage() {
  const templateClient = trpc.GetSurveyTemplates.useQuery({
    page: 1,
    limit: 10,
    category: 'all',
    tags: 'all',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className=" px-4">
        <LayoutHeader activeTab="templates" hideBorder></LayoutHeader>
      </div>

      {/* 主要内容区域 */}
      <main className="container mx-auto lg:px-4 lg:py-8 py-4">
        <div className="flex flex-col gap-6">
          {/* 标题 */}
          <div className="text-center mb-8 flex flex-col justify-start items-start">
            <h1 className="lg:text-3xl font-bold mb-2 text-xl ">问卷模板库</h1>
            <p className="text-muted-foreground">选择一个专业设计的模板，快速开始您的问卷调查</p>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex flex-row gap-4 mb-8">
            <div className="relative">
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
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="popular">热门</TabsTrigger>
              <TabsTrigger value="featured">精选</TabsTrigger>
            </TabsList>
          </Tabs>

          {templateClient.isError ? (
            <NoData></NoData>
          ) : templateClient.isLoading ? (
            <div>loading</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 grid-cols-2">
              {templateClient.data?.templates.map((template: any) => (
                <TemplateCard
                  questionsCnt={3}
                  key={template.id}
                  templateId={template.id}
                  title={template.name}
                  description={''}
                  tags={[]}
                ></TemplateCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
