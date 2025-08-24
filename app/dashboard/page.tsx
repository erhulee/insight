"use client"
import { PlusCircle, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutHeader } from '@/components/layout-header'
import { SurveyCard } from '@/components/survey/survey-card'
import { trpc } from '../_trpc/client'
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

// 常量定义
const CREATE_SURVEY_PATH = '/dashboard/create'
const DEFAULT_TAB = 'all'
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

// 类型定义
type TabValue = 'all' | 'published' | 'drafts'
type PageSize = typeof PAGE_SIZE_OPTIONS[number]

interface PaginationParams {
  page: number
  limit: number
}

interface URLUpdateParams {
  [key: string]: string | number
}

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 从 URL 获取分页参数
  const currentPage = parseInt(searchParams.get('page') || DEFAULT_PAGE.toString())
  const currentLimit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT.toString())
  const currentTab = searchParams.get('tab') || DEFAULT_TAB
  const currentSearch = searchParams.get('search') || ''

  // 获取问卷列表数据
  const { data, isLoading, isError } = trpc.GetSurveyList.useQuery({
    page: currentPage,
    limit: currentLimit,
  })

  /**
   * 更新 URL 查询参数
   * @param params 要更新的参数
   */
  const updateURL = (params: URLUpdateParams) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === 0) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, value.toString())
      }
    })

    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  /**
   * 处理分页变化
   * @param page 页码
   */
  const handlePageChange = (page: number) => {
    updateURL({ page })
  }

  /**
   * 处理页面大小变化
   * @param limit 每页显示数量
   */
  const handlePageSizeChange = (limit: string) => {
    updateURL({ limit: parseInt(limit), page: 1 }) // 改变页面大小时重置到第一页
  }

  /**
   * 处理标签变化
   * @param tab 标签值
   */
  const handleTabChange = (tab: string) => {
    updateURL({ tab, page: 1 }) // 改变标签时重置到第一页
  }

  /**
   * 处理搜索变化
   * @param search 搜索关键词
   */
  const handleSearchChange = (search: string) => {
    updateURL({ search, page: 1 }) // 搜索时重置到第一页
  }

  /**
   * 生成分页项目
   * @returns 分页组件数组
   */
  const generatePaginationItems = () => {
    if (!data) return []

    const { page, pages } = data
    const items = []

    // 始终显示第一页
    if (page > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      )
    }

    // 如果有间隙则显示省略号
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // 显示当前页和相邻页
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      if (i === 1 || i === pages) continue // 跳过第一页和最后一页，因为它们单独处理
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === page}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // 如果有间隙则显示省略号
    if (page < pages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // 始终显示最后一页
    if (pages > 1 && page < pages) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(pages)}>{pages}</PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  /**
   * 渲染空状态
   */
  const renderEmptyState = () => (
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

  /**
   * 渲染问卷列表
   */
  const renderSurveyList = useMemo(() => {
    if (isLoading) {
      return null
    }

    const { surveys = [] } = data || {}

    if (surveys.length === 0) {
      return renderEmptyState()
    }

    return surveys.map((survey: any) => (
      <SurveyCard
        key={survey.id}
        survey={survey}
      />
    ))
  }, [data, isLoading])

  /**
   * 渲染分页控件
   */
  const renderPagination = () => {
    if (!data || data.pages <= 1) return null

    return (
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t">
        <Pagination className="flex-shrink-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {generatePaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(data.pages, currentPage + 1))}
                className={currentPage >= data.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页显示</span>
          <Select value={currentLimit.toString()} onValueChange={handlePageSizeChange}>
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
          <div>条，共 {data.total} 条</div>
        </div>
      </div>
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
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="published">已发布</TabsTrigger>
                <TabsTrigger value="drafts">草稿</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 问卷网格 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
            {renderSurveyList}
          </div>

          {/* 分页控件 */}
          {renderPagination()}
        </div>
      </main>
    </div>
  )
}

