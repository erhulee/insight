"use client"
import { PlusCircle, Search, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutHeader } from '@/components/layout-header'
import { SurveyCard } from '@/components/survey/survey-card'
import { trpc } from '../_trpc/client'
import { useMemo, useEffect, useState } from 'react'
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

// Constants
const CREATE_SURVEY_PATH = '/dashboard/create'
const DEFAULT_TAB = 'all'
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const PAGE_SIZE_OPTIONS = [10, 20, 50]


export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get pagination params from URL
  const currentPage = parseInt(searchParams.get('page') || DEFAULT_PAGE.toString())
  const currentLimit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT.toString())
  const currentTab = searchParams.get('tab') || DEFAULT_TAB
  const currentSearch = searchParams.get('search') || ''

  const { data, isLoading, isError } = trpc.GetSurveyList.useQuery({
    page: currentPage,
    limit: currentLimit,
  })

  // Update URL with new query parameters
  const updateURL = (params: Record<string, string | number>) => {
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

  // Handle pagination change
  const handlePageChange = (page: number) => {
    updateURL({ page })
  }

  // Handle page size change
  const handlePageSizeChange = (limit: string) => {
    updateURL({ limit: parseInt(limit), page: 1 }) // Reset to first page when changing page size
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    updateURL({ tab, page: 1 }) // Reset to first page when changing tabs
  }

  // Handle search change
  const handleSearchChange = (search: string) => {
    updateURL({ search, page: 1 }) // Reset to first page when searching
  }

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!data) return []

    const { page, pages } = data
    const items = []

    // Always show first page
    if (page > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      )
    }

    // Show ellipsis if there's a gap
    if (page > 3) {
      items.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Show current page and neighbors
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      if (i === 1 || i === pages) continue // Skip first and last as they're handled separately
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

    // Show ellipsis if there's a gap
    if (page < pages - 2) {
      items.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Always show last page
    if (pages > 1 && page < pages) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => handlePageChange(pages)}>{pages}</PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  // Render helpers
  const renderSurveyList = useMemo(() => {
    if (isLoading) {
      return null
    }
    const { surveys, total, page, limit, pages } = data || {};
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
        survey={survey as any}
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

          {/* Survey Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-2">
            {renderSurveyList}
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t">
              <Pagination className='flex-shrink-0'>
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground ">
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
          )}
        </div>
      </main>
    </div>
  )
}

