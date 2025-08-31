"use client"
import { PlusCircle, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutHeader } from '@/components/layout-header'
import { SurveyCard } from '@/components/survey/survey-card'
import { trpc } from '@/app/_trpc/client'
import { useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListLoading } from '@/components/ui/loading'
import { useUrlParams } from '@/hooks/common/useUrlParams'

// 常量定义
const CREATE_SURVEY_PATH = '/dashboard/create'
const DEFAULT_TAB = 'all'
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

// 类型定义
type TabValue = 'all' | 'published' | 'drafts'
type PageSize = typeof PAGE_SIZE_OPTIONS[number]

export default function DashboardPage() {
  const { params, updateParams } = useUrlParams({
    defaults: {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      tab: DEFAULT_TAB,
      search: ''
    },
    parse: {
      page: (value) => parseInt(value),
      limit: (value) => parseInt(value),
      tab: (value) => value as TabValue,
      search: (value) => value
    }
  })


  // 获取问卷列表数据
  const { data, isLoading, isError } = trpc.surver.GetSurveyList.useQuery({
    page: params.page,
    limit: params.limit,
    type: params.tab as 'all' | 'published' | 'drafts',
  })


  /**
   * 处理分页变化
   * @param page 页码
   */
  const handlePageChange = (page: number) => {
    updateParams({ page })
  }

  /**
   * 处理页面大小变化
   * @param limit 每页显示数量
   */
  const handlePageSizeChange = (limit: string) => {
    // 改变页面大小时重置到第一页
    updateParams({ limit: parseInt(limit), page: 1 })
  }

  /**
   * 处理标签变化
   * @param tab 标签值
   */
  const handleTabChange = (tab: string) => {
    updateParams({ tab, page: 1 }) // 改变标签时重置到第一页
  }

  /**
   * 处理搜索变化
   * @param search 搜索关键词
   */
  const handleSearchChange = (search: string) => {
    updateParams({ search, page: 1 }) // 搜索时重置到第一页
  }

  /**
   * 构建分页序列（包含页码与省略号）
   */
  const buildPaginationSequence = (page: number, pages: number): (number | 'ellipsis')[] => {
    if (pages <= 1) return []

    const sequence: (number | 'ellipsis')[] = []

    const windowStart = Math.max(2, page - 1)
    const windowEnd = Math.min(pages - 1, page + 1)

    sequence.push(1)
    if (windowStart > 2) sequence.push('ellipsis')
    for (let i = windowStart; i <= windowEnd; i++) sequence.push(i)
    if (windowEnd < pages - 1) sequence.push('ellipsis')
    if (pages > 1) sequence.push(pages)

    return sequence
  }

  /**
   * 分页组件（更易读、职责单一）
   */
  const PaginationBar = ({
    page,
    pages,
    total,
    limit,
    onPageChange,
    onLimitChange,
  }: {
    page: number
    pages: number
    total: number
    limit: number
    onPageChange: (p: number) => void
    onLimitChange: (v: string) => void
  }) => {
    const sequence = buildPaginationSequence(page, pages)
    return (
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t">
        <Pagination className="flex-shrink-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {sequence.map((item, idx) => (
              <PaginationItem key={`${item}-${idx}`}>
                {item === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink onClick={() => onPageChange(item)} isActive={item === page}>
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(pages, page + 1))}
                className={page >= pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页显示</span>
          <Select value={limit.toString()} onValueChange={onLimitChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>条，共 {total} 条</div>
        </div>
      </div>
    )
  }


  /**
   * 渲染问卷列表
   */
  const renderSurveyList = useMemo(() => {
    const { surveys = [] } = data || {}
    switch (true) {
      case isLoading:
        return <ListLoading items={9} columns={3}></ListLoading>
      case isError:
        return <div>数据错误</div>
      case surveys.length === 0:
        return <div className="col-span-full text-center py-12">
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
      default:
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
          {surveys.map((survey: any) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
            />
          ))}
        </div>
    }
  }, [data, isLoading, isError])

  /**
   * 渲染分页控件
   */
  const renderPagination = () => {
    if (!data || data.pages <= 1) return null
    return (
      <PaginationBar
        page={params.page}
        pages={data.pages}
        total={data.total}
        limit={params.limit}
        onPageChange={handlePageChange}
        onLimitChange={handlePageSizeChange}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="px-4">
        <LayoutHeader activeTab="dashboard" hideBorder />
      </div>

      {/* 主要内容 */}
      <main className="container 2xl:px-4 2xl:py-6 py-4 mx-auto">
        <div className="flex flex-col gap-6">
          {/* 页面标题 */}
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

          {/* 搜索和筛选控件 */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索问卷..."
                className="pl-8"
                value={params.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Tabs value={params.tab} onValueChange={handleTabChange} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="published">已发布</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 问卷网格 */}

          {renderSurveyList}
          {/* 分页控件 */}
          {renderPagination()}
        </div>
      </main>
    </div>
  )
}

