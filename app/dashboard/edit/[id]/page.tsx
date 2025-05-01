"use client"
import type React from "react"
import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Question } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Eye,
  Braces,
  Brush,
  LinkIcon,
} from "lucide-react"

import { DragDropProvider } from "@/components/survey-editor/drag-drop-context"
import { DevicePreview } from "@/components/survey-editor/device-preview"
import { scrollToElement, } from "@/lib/utils"
import { toast } from "sonner"
import { preset, QuestionType } from "@/components/survey-editor/buildin/form-item"
import { publish, unpublish } from "./service"
import { RenameInput } from "./components/rename-input"
import { trpc } from "@/app/_trpc/client"
import { Preview } from "./components/preview"
import { Canvas } from "./components/EditCanvas"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { JsonEditor } from "./components/jsonEditor"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShareConfig } from "./components/shareConfig"
import { EditHeader } from "./components/EditHeader"
import { WidgetPanel } from "./components/WidgetPanel"
import { QuestionConfig } from "./components/QuestionConfig"
import { cloneDeep } from "lodash-es"


export default function EditSurveyPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = use(props.params);
  const router = useRouter()
  const { data: survey, isError, refetch, isLoading } = trpc.GetSurvey.useQuery({
    id: params.id
  }, {
    initialData: {} as any
  })
  useEffect(() => {
    //TODO: use diff
    if (survey?.questions) {
      setQuestions(survey.questions)
    }
  }, [survey])
  console.log("survey:::::", survey)
  const saveMutation = trpc.SaveSurvey.useMutation({})
  const [sheetVisible, setSheetVisible] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeTab, setActiveTab] = useState<"design" | "json" | "previwe">("design")
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  // 添加问题
  const handleAddQuestion = (type: QuestionType) => {
    const meta = preset.find((item) => item.type === type)!
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      name: meta.title,
      attr: {},
    }
    const updatedQuestions = [...questions, newQuestion]
    setQuestions(updatedQuestions)
    setSelectedQuestionId(newQuestion.id)
    // 滚动到新添加的问题
    setTimeout(() => {
      scrollToElement(newQuestion.id, 100)
    }, 100)
  }

  // 更新问题
  const handleUpdateQuestion = (action: "update-attr", values: Record<string, any>) => {
    switch (action) {
      case "update-attr":
        const oldQuestions = cloneDeep(questions);
        oldQuestions.forEach((q) => {
          if (q.id === selectedQuestionId) {
            if (q.attr == null) {
              q.attr = {}
            }
            Object.assign(q.attr, values)
          }
        })
        console.log("更新问题:", oldQuestions)
        setQuestions(oldQuestions)
    }
  }
  // 保存问卷
  const handleSaveSurvey = async () => {
    try {
      await saveMutation.mutate({
        id: params.id,
        questions: JSON.stringify(questions)
      })
      toast.success("保存成功")
    } catch {
      toast.warning("保存失败")
    }
  }
  // 返回问卷列表
  const handleBackToDashboard = () => {
    router.push("/dashboard")
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
        toast("发布成功", {
          description: "问卷已成功发布，现在可以分享给他人填写",
        })
      } else {
        toast("发布失败", {
          description: "发布问卷时出现错误，请重试",
        })
      }
    } else {
      const ok = await unpublish(params.id)
      if (ok) {
        refetch()
        toast("已取消发布", {
          description: "线上用户将无法访问该问卷",
        })
      } else {
        toast("取消失败", {
          description: "修改问卷状态时出现错误，请重试",
        })
      }
    }

  }
  // 获取选中的问题
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId)
  if (isError || survey == null) {
    return (<div>程序异常</div>)
  } else {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* 顶部导航栏 */}
        <EditHeader
          handleSaveSurvey={handleSaveSurvey}
          handleShareSurvey={handleShareSurvey}
          handlePublishSurvey={handlePublishSurvey}
          handleBackToDashboard={handleBackToDashboard}
          published={survey.published}
        ></EditHeader>
        {/* 主要内容区域 - 三栏布局 */}
        <DragDropProvider>
          <div className="flex-1 flex overflow-hidden">
            {/* 左侧面板 - 问题类型 */}
            <WidgetPanel handleAddQuestion={handleAddQuestion}></WidgetPanel>
            {/* 中间面板 - 问题列表/预览 */}
            {isLoading ? <div>loading...</div> : <div className="flex-1 overflow-hidden">
              <div className=" py-2 px-4 flex justify-between" >
                <RenameInput id={survey.id} title={survey.name}></RenameInput>
                <ToggleGroup type="single" size="sm" value={activeTab} onValueChange={(v) => {
                  setActiveTab(v as any)
                }}>
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
              {activeTab === "json" && <JsonEditor questions={questions}></JsonEditor>}
              {activeTab === "design" && <Canvas
                selectedQuestionId={selectedQuestionId}
                onQuestionSelect={question => setSelectedQuestionId(question.id)}
                survey={survey}
                onQuestionsChange={(questions) => {
                  setQuestions(questions)
                }}
                questions={questions}></Canvas>}
              {activeTab === "previwe" && <DevicePreview><Preview survey={survey} questions={questions}></Preview></DevicePreview>}
            </div>}

            {/* 右侧面板 - 问题设置 */}
            <div className="w-80 border-l bg-muted/30 overflow-hidden hidden md:block">
              <div className="border-b p-4">
                <h3 className="font-medium">问题配置</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedQuestion
                    ? `编辑 "${selectedQuestion.type === QuestionType.Text ? "分节" : "问题"}" 的属性和选项`
                    : "请从左侧选择一个问题进行编辑"}
                </p>
              </div>
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="p-4">
                  {selectedQuestion ? (
                    <QuestionConfig question={selectedQuestion} onUpdate={(attr) => {
                      handleUpdateQuestion("update-attr", attr)
                    }} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>选择一个问题来配置其属性</p>
                      <p className="text-xs mt-2">或从左侧添加一个新问题</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DragDropProvider>
        {/* 发布配置 */}
        <div>
          <Sheet open={sheetVisible} onOpenChange={setSheetVisible}>
            <SheetContent className=" w-96">
              <SheetHeader>
                <SheetTitle className=" flex flex-row gap-2 items-center  " >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  用户满意度调查
                </SheetTitle>
                <SheetDescription>
                  创建于 2023-04-15 · 124 份回复
                </SheetDescription>
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
