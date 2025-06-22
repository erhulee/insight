'use client'
import type React from 'react'
import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, Braces, Brush, LinkIcon, AlignJustify, BookTemplate } from 'lucide-react'
import { DragDropProvider } from '@/components/survey-editor/drag-drop-context'
import { toast } from 'sonner'
import { publish, unpublish } from './service'
import { RenameInput } from '../_components/RenameInput'
import { trpc } from '@/app/_trpc/client'
import { Canvas } from '../_components/EditCanvas'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ShareConfig } from '../_components/shareConfig'
import { EditHeader } from '../_components/EditHeader'
import { WidgetPanel } from '../_components/WidgetPanel'
import { cloneDeep } from 'lodash-es'
import { SurveyPagiNation } from '../_components/SurveyPagiNation'
import { useSnapshot } from 'valtio'
import { initRuntimeStore, runtimeStore, updateRuntimeQuestion } from '../../_valtio/runtime'
import { JsonEditor } from '../_components/JsonEditor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditQuestionConfig } from '../_components/EditQuestionConfig'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EditSurveyPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const router = useRouter()
  const runtimeState = useSnapshot(runtimeStore)
  const selectedQuestionId = runtimeState.selectedQuestionID
  const params = use(props.params)
  const {
    data: survey,
    isError,
    refetch,
    isLoading,
  } = trpc.GetSurvey.useQuery(
    {
      id: params.id,
    },
    {
      initialData: {} as any,
    },
  )
  const udpateSurveyMudation = trpc.UpdateSurvey.useMutation()
  const saveSurveyAsTemplateMutation = trpc.CreateTemplateSurvey.useMutation()
  useEffect(() => {
    if (survey != null) {
      const questions = ((survey as any).questions as unknown as Question[]) ?? []
      initRuntimeStore({
        surveyId: survey.id,
        questions: questions,
        pageCount: survey.pageCount,
        currentPage: 1,
        selectedQuestionID: null,
        currentQuestion: questions.filter((i) => i.ownerPage == 1),
      })
    }
  }, [survey])
  const [sheetVisible, setSheetVisible] = useState(false)

  const [activeTab, setActiveTab] = useState<'design' | 'json' | 'previwe'>('design')

  // 更新问题
  const handleUpdateQuestion = (action: 'update-attr', values: Record<string, any>) => {
    switch (action) {
      case 'update-attr':
        const oldQuestions: Question[] = cloneDeep(runtimeState.questions) as any
        oldQuestions.forEach((q) => {
          if (q.field === selectedQuestionId) {
            if (q.attr == null) {
              q.attr = {}
            }
            Object.assign(q.attr, values)
          }
        })
        updateRuntimeQuestion(oldQuestions)
    }
  }

  const renameSurvey = async (name: string) => {
    const response = await udpateSurveyMudation.mutateAsync({
      id: survey!.id,
      title: name,
    })
    refetch()
  }

  const createTemplate = async () => {
    try {
      const response = await saveSurveyAsTemplateMutation.mutateAsync({
        name: survey?.name!,
        //@ts-ignore
        questions: survey?.questions,
        tags: [],
      })
      toast.success('创建模版成功')
    } catch {
      toast.error('创建模版失败')
    }
  }

  // 返回问卷列表
  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }
  // 分享问卷
  const handleShareSurvey = () => {
    router.push(`/dashboard/share/${params.id}`)
  }
  // 发布问卷
  const handlePublishSurvey = async (published: boolean) => {
    if (published) {
      const ok = await publish(params.id)
      if (ok) {
        refetch()
        toast('发布成功', {
          description: '问卷已成功发布，现在可以分享给他人填写',
        })
      } else {
        toast('发布失败', {
          description: '发布问卷时出现错误，请重试',
        })
      }
    } else {
      const ok = await unpublish(params.id)
      if (ok) {
        refetch()
        toast('已取消发布', {
          description: '线上用户将无法访问该问卷',
        })
      } else {
        toast('取消失败', {
          description: '修改问卷状态时出现错误，请重试',
        })
      }
    }
  }

  if (isError || survey == null) {
    return <div>程序异常</div>
  } else {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* 顶部导航栏 */}
        <EditHeader
          handleShareSurvey={handleShareSurvey}
          handlePublishSurvey={handlePublishSurvey}
          handleBackToDashboard={handleBackToDashboard}
          published={survey.published}
        ></EditHeader>
        {/* 主要内容区域 - 三栏布局 */}
        <DragDropProvider>
          <div className="flex-1 flex overflow-hidden">
            {/* 左侧面板 - 问题类型 */}
            <WidgetPanel></WidgetPanel>
            {/* 中间面板 - 问题列表/预览 */}
            {isLoading ? (
              <div>loading...</div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <div className=" py-2 px-4 flex justify-between">
                  <div className=" flex flex-row items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <AlignJustify className=" w-4 h-4"></AlignJustify>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom">
                        <DropdownMenuItem
                          className=" text-sm"
                          onClick={() => {
                            createTemplate()
                          }}
                        >
                          <BookTemplate></BookTemplate>
                          <span className=" text-sm">保存为模版</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <RenameInput
                      id={survey.id}
                      title={survey.name}
                      onUpdate={renameSurvey}
                    ></RenameInput>
                  </div>
                  <SurveyPagiNation></SurveyPagiNation>
                  <ToggleGroup
                    type="single"
                    size="sm"
                    value={activeTab}
                    onValueChange={(v) => {
                      setActiveTab(v as any)
                    }}
                  >
                    <ToggleGroupItem value="json">
                      <Braces></Braces>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="design">
                      <Brush></Brush>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="preview">
                      <Eye></Eye>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                {activeTab === 'json' && <JsonEditor></JsonEditor>}
                {activeTab === 'design' && <Canvas></Canvas>}
              </div>
            )}
            {/* 右侧面板 - 问题设置 */}
            <EditQuestionConfig></EditQuestionConfig>
          </div>
        </DragDropProvider>
        {/* 发布配置 */}
        <div>
          <Sheet open={sheetVisible} onOpenChange={setSheetVisible}>
            <SheetContent className=" w-96">
              <SheetHeader>
                <SheetTitle className=" flex flex-row gap-2 items-center  ">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  用户满意度调查
                </SheetTitle>
                <SheetDescription>创建于 2023-04-15 · 124 份回复</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <ShareConfig></ShareConfig>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  }
}
