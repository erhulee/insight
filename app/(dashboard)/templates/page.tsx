'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutHeader } from '@/components/layout-header'
import { trpc } from '@/app/_trpc/client'
import { TemplateCard } from './_components/TemplateCard'
import { NoData } from './_components/NoData'

// Constants
const INITIAL_PAGE = 1
const INITIAL_LIMIT = 10
const DEFAULT_CATEGORY = 'all'
const DEFAULT_TAGS = 'all'
const DEFAULT_TAB = 'all'

// Types
type Category = 'all'
type TabType = 'all' | 'popular' | 'featured'

export default function TemplatesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>(DEFAULT_CATEGORY)
  const [activeTab, setActiveTab] = useState<TabType>(DEFAULT_TAB)

  // Queries
  const { data: templateData, isLoading, isError } = trpc.GetSurveyTemplates.useQuery({
    page: INITIAL_PAGE,
    limit: INITIAL_LIMIT,
    category: selectedCategory,
    tags: DEFAULT_TAGS,
  })

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as Category)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
  }

  // Render helpers
  const renderTemplates = () => {
    if (isError) {
      return <NoData />
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      )
    }

    if (!templateData?.templates?.length) {
      return <NoData />
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 grid-cols-2">
        {templateData.templates.map((template: any) => (
          <TemplateCard
            key={template.id}
            templateId={template.id}
            title={template.name}
            description=""
            questionsCnt={3}
            tags={[]}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4">
        <LayoutHeader activeTab="templates" hideBorder />
      </div>

      {/* Main Content */}
      <main className="container mx-auto lg:px-4 lg:py-8 py-4">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="text-center mb-8 flex flex-col justify-start items-start">
            <h1 className="lg:text-3xl font-bold mb-2 text-xl">
              问卷模板库
            </h1>
            <p className="text-muted-foreground">
              选择一个专业设计的模板，快速开始您的问卷调查
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索模板..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类别</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Navigation */}
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="popular">热门</TabsTrigger>
              <TabsTrigger value="featured">精选</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Template Grid */}
          {renderTemplates()}
        </div>
      </main>
    </div>
  )
}
