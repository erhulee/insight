"use client"
import type React from "react"
import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Question } from "@/lib/types"
import { Button } from "@/components/ui/button"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Save,
  Eye,
  ArrowLeft,
  Share2,
  Settings,
  Palette,
  Smartphone,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { QuestionConfig } from "@/components/survey-editor/question-config"
import { DragDropProvider } from "@/components/survey-editor/drag-drop-context"
import { DevicePreview } from "@/components/survey-editor/device-preview"
import { scrollToElement, } from "@/lib/utils"
import { toast } from "sonner"
import { preset } from "@/components/survey-editor/buildin/form-item"
import { publish, unpublish } from "./service"
import { RenameInput } from "./components/rename-input"
import { trpc } from "@/app/_trpc/client"
import { Preview } from "./components/preview"
import { Canvas } from "./components/canvas"

// 问题类型定义
const questionTypes = preset.map((item) => ({
  id: item.key,
  name: item.name,
  icon: <item.icon className="h-4 w-4"></item.icon>
}))

export default function EditSurveyPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = use(props.params);
  const router = useRouter()
  const { data: survey, isError, refetch } = trpc.GetSurvey.useQuery({
    id: params.id
  }, {
    initialData: {} as any
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<"design" | "settings" | "theme">("design")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)


  // 添加问题
  const handleAddQuestion = (type: string) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      title: type === "section" ? "分节标题" : "新问题",
      required: false,
    }

    // 根据问题类型添加特定属性
    if (type === "radio" || type === "checkbox" || type === "dropdown") {
      newQuestion.options = [
        { text: "选项 1", value: "option-1" },
        { text: "选项 2", value: "option-2" },
        { text: "选项 3", value: "option-3" },
      ]
    } else if (type === "rating") {
      newQuestion.maxRating = 5
      newQuestion.ratingType = "number"
    } else if (type === "text") {
      newQuestion.placeholder = "请输入..."
      newQuestion.multiline = false
    } else if (type === "file") {
      newQuestion.maxFiles = 1
      newQuestion.maxSize = 5 // MB
      newQuestion.fileTypes = ".pdf,.jpg,.png"
    }

    const updatedQuestions = [...questions, newQuestion]
    setQuestions(updatedQuestions)
    setSelectedQuestionId(newQuestion.id)
    setActiveTab("design")

    // 滚动到新添加的问题
    setTimeout(() => {
      scrollToElement(newQuestion.id, 100)
    }, 100)
  }

  // 更新问题
  const handleUpdateQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    setQuestions(updatedQuestions)
  }





  // 保存问卷
  const handleSaveSurvey = async () => {
    setIsSaving(true)
    try {
      // 更新问卷数据
      const updatedSurvey = {
        ...survey,
        questions,
        updatedAt: new Date().toISOString(),
      }

      setHasUnsavedChanges(false)




    } catch (error) {
      console.error("保存问卷失败:", error)
      toast("保存失败", {
        description: "保存问卷时出现错误，请重试",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 切换预览模式
  const handleTogglePreview = () => {
    setIsPreview(!isPreview)
  }

  // 返回问卷列表
  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      if (confirm("您有未保存的更改，确定要离开吗？")) {
        router.push("/dashboard")
      }
    } else {
      router.push("/dashboard")
    }
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
      console.log("取消发布", ok)
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
      <DragDropProvider>
        <div className="min-h-screen bg-background flex flex-col">
          {/* 顶部导航栏 */}
          <header className="border-b sticky top-0 z-10 bg-background">
            <div className=" flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <RenameInput id={survey.id} title={survey.name}></RenameInput>
                {saveSuccess && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    已保存
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isPreview ? "default" : "outline"}
                  size="sm"
                  onClick={handleTogglePreview}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {isPreview ? "退出预览" : "预览"}
                </Button>

                {survey.published ? <Button variant="outline" size="sm" onClick={() => { handlePublishSurvey(false) }} disabled={isSaving} className="gap-1">
                  <Smartphone className="h-4 w-4" />
                  取消发布
                </Button> : (
                  <Button variant="outline" size="sm" onClick={() => { handlePublishSurvey(true) }} disabled={isSaving} className="gap-1">
                    <Smartphone className="h-4 w-4" />
                    发布
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={handleShareSurvey} className="gap-1">
                  <Share2 className="h-4 w-4" />
                  分享
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveSurvey}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="gap-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* 主要内容区域 - 三栏布局 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 左侧面板 - 问题类型 */}
            {!isPreview && (
              <div className="w-64 border-r bg-muted/30 overflow-y-auto hidden lg:block">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium mb-2">基础模块</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {questionTypes.slice(0, 4).map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuestion(type.id)}
                        className="justify-start gap-1 h-auto py-2"
                      >
                        {type.icon}
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium mb-2">高级模块</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {questionTypes.slice(4).map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddQuestion(type.id)}
                        className="justify-start gap-1 h-auto py-2"
                      >
                        {type.icon}
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium mb-2">问卷设置</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-1"
                      onClick={() => {
                        setSelectedQuestionId(null)
                        setActiveTab("settings")
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      基本设置
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-1"
                      onClick={() => {
                        setSelectedQuestionId(null)
                        setActiveTab("theme")
                      }}
                    >
                      <Palette className="h-4 w-4" />
                      主题样式
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 中间面板 - 问题列表/预览 */}
            <div className={`flex-1 overflow-hidden ${isPreview ? "w-full" : ""}`}>
              {isPreview ? (
                <DevicePreview><Preview survey={survey} questions={questions}></Preview></DevicePreview>
              ) : (
                <Canvas
                  selectedQuestionId={selectedQuestionId}
                  onQuestionSelect={id => setSelectedQuestionId(id)}
                  survey={survey}
                  onQuestionsChange={(questions) => {
                    setQuestions(questions)
                  }} questions={questions}></Canvas>
              )}
            </div>

            {/* 右侧面板 - 问题设置 */}
            {!isPreview && (
              <div className="w-80 border-l bg-muted/30 overflow-hidden hidden md:block">
                <div className="border-b p-4">
                  <h3 className="font-medium">问题配置</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedQuestion
                      ? `编辑 "${selectedQuestion.type === "section" ? "分节" : "问题"}" 的属性和选项`
                      : "请从左侧选择一个问题进行编辑"}
                  </p>
                </div>

                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4">
                    {selectedQuestion ? (
                      <QuestionConfig question={selectedQuestion} onUpdate={handleUpdateQuestion} />
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>选择一个问题来配置其属性</p>
                        <p className="text-xs mt-2">或从左侧添加一个新问题</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DragDropProvider>
    )
  }

}
