'use client'
import type React from 'react'
import { useState, use, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Eye,
	Braces,
	Brush,
	AlignJustify,
	BookTemplate,
	File,
} from 'lucide-react'
import { DragDropProvider } from '@/components/survey-editor/drag-drop-context'
import { toast } from 'sonner'
import {
	RenameInput,
	Canvas,
	SurveyPagiNation,
	JsonEditor,
	EditQuestionConfig,
	SuveryPageConfig,
} from '../ui'
import { trpc } from '@/app/_trpc/client'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { cloneDeep } from 'lodash-es'
import {
	initRuntimeStore,
	updateRuntimeQuestion,
	useRuntimeState,
} from '@/app/(dashboard)/dashboard/_valtio/runtime'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type {
	Question,
	RuntimeState,
} from '@/app/(dashboard)/dashboard/_valtio/runtime'
import { EmptyState } from '@/components/ui/empty-state'

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable'
import { WidgetPanel } from '../_component/widget-panel'
import { EditHeader } from '../_component/EditHeader'
import { EditHeaderSkeleton } from '../_component/EditHeader/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 定义页面参数类型
interface PageParams {
	id: string
}

// 定义搜索参数类型
interface SearchParams {
	tab?: 'page' | 'component'
}

// 定义页面属性类型
interface EditSurveyPageProps {
	params: Promise<PageParams>
	searchParams: Promise<SearchParams>
}

type ActiveTab = 'design' | 'json' | 'preview'

type QuestionUpdateAction = 'update-attr'

export default function EditSurveyPage({
	params,
	searchParams,
}: EditSurveyPageProps) {
	const router = useRouter()
	const runtimeState = useRuntimeState()
	const selectedQuestionId = runtimeState.selectedQuestionID

	// 解析异步参数
	const resolvedParams = use(params)
	const resolvedSearchParams = use(searchParams)
	const publishSurveyMutation = trpc.surver.PublishSurvey.useMutation()
	const updateSurveyMutation = trpc.surver.UpdateSurvey.useMutation()

	// 获取问卷数据
	const {
		data: survey,
		isError,
		refetch,
		isLoading,
	} = trpc.surver.GetSurvey.useQuery({
		id: resolvedParams.id,
	})

	const clientSearchParams = useSearchParams()
	const pathname = usePathname()
	const activeTab = (clientSearchParams.get('view') as ActiveTab) ?? 'design'

	// 初始化运行时存储
	useEffect(() => {
		if (survey != null) {
			const questions =
				((survey as any).questions as unknown as Question[]) ?? []
			const runtimeStateData: Partial<RuntimeState> = {
				surveyId: survey.id,
				questions: questions,
				pageCount: survey.pageCount,
				currentPage: 1,
				selectedQuestionID: null,
				currentQuestion: questions.filter(
					(question) => question.ownerPage === 1,
				),
			}
			initRuntimeStore(runtimeStateData as RuntimeState)
		}
	}, [survey])

	/**
	 * 更新问题属性
	 * @param action 更新动作类型
	 * @param values 要更新的值
	 */
	const handleUpdateQuestion = (
		action: QuestionUpdateAction,
		values: Record<string, any>,
	) => {
		switch (action) {
			case 'update-attr':
				const oldQuestions: Question[] = cloneDeep(
					runtimeState.questions,
				) as Question[]
				oldQuestions.forEach((question) => {
					if (question.id === selectedQuestionId) {
						if (question.props == null) {
							question.props = {}
						}
						Object.assign(question.props, values)
					}
				})
				updateRuntimeQuestion(oldQuestions)
				break
			default:
				console.warn(`Unknown action: ${action}`)
		}
	}

	/**
	 * 重命名问卷
	 * @param name 新名称
	 */
	const handleRenameSurvey = async (name: string) => {
		try {
			await updateSurveyMutation.mutateAsync({
				id: survey!.id,
				title: name,
			})
			refetch()
			toast.success('问卷重命名成功')
		} catch (error) {
			toast.error('问卷重命名失败')
			console.error('重命名问卷失败:', error)
		}
	}

	/**
	 * 创建模板
	 */
	const handleCreateTemplate = async () => {
		try {
			// TODO: 实现保存为模板的逻辑
			// const response = await saveSurveyAsTemplateMutation.mutateAsync({
			//   name: survey?.name!,
			//   questions: survey?.questions,
			//   tags: [],
			// })
			toast.success('创建模板成功')
		} catch (error) {
			toast.error('创建模板失败')
			console.error('创建模板失败:', error)
		}
	}

	/**
	 * 返回问卷列表
	 */
	const handleBackToDashboard = () => {
		router.push('/dashboard')
	}

	/**
	 * 分享问卷
	 */
	const handleShareSurvey = () => {
		router.push(`/dashboard/share/${resolvedParams.id}`)
	}

	/**
	 * 发布/取消发布问卷
	 * @param published 是否发布
	 */
	const handlePublishSurvey = async (published: boolean) => {
		try {
			const response = await publishSurveyMutation.mutateAsync({
				id: resolvedParams.id,
				published,
			})
			if (response.published) {
				refetch()
				toast.success('发布成功', {
					description: '问卷已成功发布，现在可以分享给他人填写',
				})
			} else {
				toast.success('已取消发布', {
					description: '线上用户将无法访问该问卷',
				})
			}
		} catch (error) {
			toast.error('操作失败', {
				description: '处理问卷状态时出现错误',
			})
			console.error('处理问卷状态失败:', error)
		}
	}

	const mainContent = useMemo(() => {
		if (isLoading) {
			return (
				<div className="p-4 space-y-4">
					{/* 标题 Skeleton */}
					<Skeleton className="h-6 w-40" />
					{/* 三个问题块 Skeleton */}
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-5 w-56" />
								<div className="space-y-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							</div>
						))}
					</div>
					{/* 底部操作区 Skeleton */}
					<div className="flex gap-2 pt-2">
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-20" />
					</div>
				</div>
			)
		}
		if (survey == null || isError) {
			return (
				<div className="flex items-center justify-center h-full">
					<EmptyState
						title="问卷不存在"
						description="您访问的问卷不存在或已被删除"
						icons={[File]}
					/>
				</div>
			)
		}
		switch (activeTab) {
			case 'json':
				return <JsonEditor />
			case 'design':
				return <Canvas />
			case 'preview':
				return (
					<div className="p-4 text-center text-muted-foreground">
						预览功能开发中...
					</div>
				)
		}
	}, [activeTab, survey, isLoading, isError])

	return (
		<div className="h-screen bg-background w-full overflow-hidden flex flex-col ">
			{/* 顶部导航栏 */}
			{survey == null ? (
				<EditHeaderSkeleton />
			) : (
				<EditHeader
					handleShareSurvey={handleShareSurvey}
					publish={{
						isPublished: survey.published,
						mutationStatus: publishSurveyMutation.status,
						handlePublishSurvey: handlePublishSurvey,
					}}
					handleBackToDashboard={handleBackToDashboard}
				/>
			)}

			<ResizablePanelGroup
				direction="horizontal"
				className=" w-full rounded-lg border md:min-w-[450px] flex-shrink"
			>
				<ResizablePanel defaultSize={18}>
					{/* 左侧面板 - 问题类型 */}
					<WidgetPanel />
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel defaultSize={60}>
					{/* 中间面板 - 问题类型 */}
					<div className="flex-1 overflow-hidden h-full">
						<div className="py-2 px-4 flex justify-between items-center">
							<div className="flex flex-row items-center gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
											<AlignJustify className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent side="bottom">
										<DropdownMenuItem
											className="text-sm"
											onClick={handleCreateTemplate}
										>
											<BookTemplate className="w-4 h-4 mr-2" />
											<span>保存为模板</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								{survey && (
									<RenameInput
										id={survey?.id}
										title={survey?.title}
										onUpdate={handleRenameSurvey}
									/>
								)}
							</div>
							<SurveyPagiNation />
							<ToggleGroup
								type="single"
								size="sm"
								value={activeTab}
								onValueChange={(value) => {
									if (value) {
										const params = new URLSearchParams(
											clientSearchParams.toString(),
										)
										params.set('view', value)
										router.replace(`${pathname}?${params.toString()}`)
									}
								}}
							>
								<ToggleGroupItem value="json">
									<Braces className="w-4 h-4" />
								</ToggleGroupItem>
								<ToggleGroupItem value="design">
									<Brush className="w-4 h-4" />
								</ToggleGroupItem>
								<ToggleGroupItem value="preview">
									<Eye className="w-4 h-4" />
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<DragDropProvider>{mainContent}</DragDropProvider>
					</div>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel defaultSize={20}>
					{resolvedSearchParams.tab === 'page' ? (
						<SuveryPageConfig />
					) : (
						<EditQuestionConfig />
					)}
				</ResizablePanel>
			</ResizablePanelGroup>

			{/* 发布配置 */}
			{/* <Sheet open={sheetVisible} onOpenChange={setSheetVisible}>
        <SheetContent className="w-96">
          <SheetHeader>
            <SheetTitle className="flex flex-row gap-2 items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <LinkIcon className="h-4 w-4" />
              </div>
              用户满意度调查
            </SheetTitle>
            <SheetDescription>创建于 2023-04-15 · 124 份回复</SheetDescription>
          </SheetHeader>

          <div className="grid gap-4 py-4">
            <ShareConfig />
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">保存更改</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet> */}
		</div>
	)
}
