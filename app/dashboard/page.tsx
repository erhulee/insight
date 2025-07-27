"use client"
import { PlusCircle, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutHeader } from '@/components/layout-header'
import { SurveyCard } from '@/components/survey/survey-card'
import { trpc } from '../_trpc/client'
import { useMemo } from 'react'

// Constants
const CREATE_SURVEY_PATH = '/dashboard/create'
const DEFAULT_TAB = 'all'



export default function DashboardPage() {
  const { data, isLoading, isError } = trpc.GetSurveyList.useQuery({
    page: 1,
    limit: 10,
  })

  // Render helpers
  const renderSurveyList = useMemo(() => {
    if (isLoading) {
      return null
    }
    const { surveys, total, page, limit, pages } = data;
    if (surveys.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">没有找到问卷</h3>
          <p className="text-muted-foreground mb-4">
            创建您的第一个问卷开始使用
          </p>
          <Button asChild className="gap-1">
            <a href={CREATE_SURVEY_PATH}>
              <PlusCircle className="h-4 w-4" />
              创建问卷
            </a>
          </Button>
        </div>
      )
    }

    return surveys.map((survey) => (
      <SurveyCard
        key={survey.id}
        survey={survey}
        onDelete={() => { }} // This will be handled by the component internally
      />
    ))
  }, [data, isLoading])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4">
        <LayoutHeader activeTab="dashboard" hideBorder />
      </div>

      {/* Main Content */}
      <main className="container 2xl:px-4 2xl:py-6 py-4 mx-auto">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="2xl:text-2xl font-bold text-xl">
              我的问卷
            </h1>
            <Button asChild className="gap-1">
              <a href={CREATE_SURVEY_PATH}>
                <PlusCircle className="h-4 w-4" />
                创建问卷
              </a>
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索问卷..."
                className="pl-8"
              />
            </div>

            <Tabs defaultValue={DEFAULT_TAB} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="published">已发布</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Survey Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
            {renderSurveyList}
          </div>
        </div>
      </main>
    </div>
  )
}
