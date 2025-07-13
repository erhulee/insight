import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, Search, FileText } from 'lucide-react'
import { SurveyOverview } from '@/app/developer/components/survey-overview'
import { LayoutHeader } from '@/components/layout-header'
import { Button } from '@/components/ui/button'
import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

const prisma = new PrismaClient()


export default async function DashboardPage() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect('/login')
  }
  // 服务端获取问卷数据
  const surveys = await prisma.survey.findMany({
    where: {
      ownerId: userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  console.log("surveys", surveys)

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
            <Button asChild className="gap-1">
              <a href="/dashboard/create">
                <PlusCircle className="h-4 w-4" />
                创建问卷
              </a>
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
              />
            </div>

            <Tabs defaultValue="all" className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="published">已发布</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 问卷列表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
            {surveys.length > 0 ? (
              // 问卷列表
              surveys.map((survey) => (
                <SurveyOverview
                  key={survey.id}
                  survey={survey as any}
                  handleDelete={async (id: string) => {
                    // 'use server'
                    // await prisma.survey.update({
                    //   where: { id },
                    //   data: { deletedAt: new Date() }
                    // })
                  }}
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
                  创建您的第一个问卷开始使用
                </p>
                <Button asChild className="gap-1">
                  <a href="/dashboard/create">
                    <PlusCircle className="h-4 w-4" />
                    创建问卷
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
