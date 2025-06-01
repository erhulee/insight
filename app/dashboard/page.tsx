'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, Search, FileText } from 'lucide-react'
import { SurveyOverview } from '@/app/developer/components/survey-overview'
import { trpc } from '@/app/_trpc/client'
import { LayoutHeader } from '@/components/layout-header'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const { data: surveys, isLoading, refetch, isError, error } = trpc.GetSurveyList.useQuery()
  if (error && error.data?.code == 'UNAUTHORIZED') {
    toast('未登录或登录已过期, 3秒后为您跳转')
    return null
  }
  // 创建新问卷
  const deleteMutation = trpc.DeleteSurvey.useMutation({
    onSuccess: () => refetch(),
  })
  const handleCreateSurvey = async () => {
    window.location.href = '/dashboard/create'
  }
  const handleDeleteSurvey = async (id: string) => {
    deleteMutation.mutate({ id })
  }

  // 过滤问卷
  const filteredSurveys =
    surveys?.filter((survey) => {
      // 根据搜索查询过滤
      const matchesSearch = survey.name.toLowerCase().includes(searchQuery.toLowerCase())
      // 根据标签过滤
      if (activeTab === 'all') return matchesSearch
      if (activeTab === 'published') return matchesSearch && survey.published
      if (activeTab === 'drafts') return matchesSearch && !survey.published
      return matchesSearch
    }) ?? []
  return (
    <div className="min-h-screen bg-background bg-gray-50">
      {/* 顶部导航栏 */}
      <div className=" px-4">
        <LayoutHeader></LayoutHeader>
      </div>
      {/* 主要内容区域 */}
      <main className="container 2xl:px-4 2xl:py-6 py-4 mx-auto ">
        <div className="flex flex-col gap-6">
          {/* 标题和创建按钮 */}
          <div className="flex items-center justify-between">
            <h1 className="2xl:text-2xl font-bold text-xl">我的问卷</h1>
            <Button onClick={handleCreateSurvey} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              创建问卷
            </Button>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索问卷..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="published">已发布</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 问卷列表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
            {isLoading ? (
              // 加载状态
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-muted rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-4 w-1/3 bg-muted rounded"></div>
                  </CardFooter>
                </Card>
              ))
            ) : filteredSurveys.length > 0 ? (
              // 问卷列表
              filteredSurveys.map((survey) => (
                <SurveyOverview
                  key={survey.id}
                  survey={survey as any}
                  handleDelete={handleDeleteSurvey}
                ></SurveyOverview>
              ))
            ) : (
              // 空状态
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">没有找到问卷</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? '尝试使用不同的搜索词或清除过滤器' : '创建您的第一个问卷开始使用'}
                </p>
                <Button onClick={handleCreateSurvey} className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  创建问卷
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
