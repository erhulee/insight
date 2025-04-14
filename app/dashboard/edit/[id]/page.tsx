"use client"
import type React from "react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Question, Survey } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Save,
  Eye,
  Plus,
  ArrowLeft,
  Share2,
  Settings,
  Palette,
  Smartphone,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { QuestionItem } from "@/components/survey-editor/question-item"
import { QuestionConfig } from "@/components/survey-editor/question-config"
import { DragDropProvider } from "@/components/survey-editor/drag-drop-context"
import { DevicePreview } from "@/components/survey-editor/device-preview"
import { scrollToElement, saveToLocalStorage } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { preset } from "@/components/survey-editor/buildin/form-item"
import { publish } from "./service"
import { RenameInput } from "./components/rename-input"
import { trpc } from "@/app/_trpc/client"

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
  const { data: survey } = trpc.GetSurvey.useQuery({
    id: params.id
  }, {
    initialData: {}
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<"design" | "settings" | "theme">("design")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)



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
    console.log("handleUpdateQuestion", updatedQuestion, updatedQuestions)

    setQuestions(updatedQuestions)
  }

  // 删除问题
  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id)
    setQuestions(updatedQuestions)

    // 如果删除的是当前选中的问题，选中第一个问题或清除选择
    if (id === selectedQuestionId) {
      setSelectedQuestionId(updatedQuestions.length > 0 ? updatedQuestions[0].id : null)
    }
  }

  // 复制问题
  const handleDuplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find((q) => q.id === id)
    if (!questionToDuplicate) return

    const duplicatedQuestion: Question = {
      ...JSON.parse(JSON.stringify(questionToDuplicate)),
      id: uuidv4(),
      title: `${questionToDuplicate.title} (复制)`,
    }

    const index = questions.findIndex((q) => q.id === id)
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index + 1, 0, duplicatedQuestion)

    setQuestions(updatedQuestions)
    setSelectedQuestionId(duplicatedQuestion.id)

    // 滚动到复制的问题
    setTimeout(() => {
      scrollToElement(duplicatedQuestion.id, 100)
    }, 100)
  }

  // 更新问卷标题
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurvey({ ...survey, title: e.target.value })
  }

  // 更新问卷描述
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSurvey({ ...survey, description: e.target.value })
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

      // 模拟API保存
      // 在实际应用中，这里应该调用API保存问卷数据
      saveToLocalStorage(`survey_${params.id}`, updatedSurvey)

      setHasUnsavedChanges(false)
      setSaveSuccess(true)

      // 3秒后隐藏成功提示
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("保存问卷失败:", error)
      toast({
        title: "保存失败",
        description: "保存问卷时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 切换预览模式
  const handleTogglePreview = () => {
    setIsPreview(!isPreview)
    setSelectedQuestionId(null)
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
  const handlePublishSurvey = async () => {
    const ok = await publish(params.id)
    if (ok) {
      toast({
        title: "发布成功",
        description: "问卷已成功发布，现在可以分享给他人填写",
      })
    } else {
      toast({
        title: "发布失败",
        description: "发布问卷时出现错误，请重试",
        variant: "destructive",
      })
    }
  }

  // 获取选中的问题
  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId)

  // 渲染预览内容
  const renderPreviewContent = () => {
    return (
      <div className="min-h-full bg-background p-4">
        {/* 问卷标题和描述 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
          {survey.description && <p className="text-muted-foreground">{survey.description}</p>}
        </div>

        {/* 问题列表 */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-card rounded-lg border p-4 shadow-sm">
              {question.type === "section" ? (
                <div>
                  <h3 className="text-xl font-medium">{question.title}</h3>
                  {question.description && <p className="text-muted-foreground mt-1">{question.description}</p>}
                  <Separator className="mt-4" />
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-1 mb-2">
                    <h3 className="text-base font-medium">
                      {index + 1}. {question.title}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </h3>
                  </div>
                  {question.description && <p className="text-sm text-muted-foreground mb-4">{question.description}</p>}

                  {/* 根据问题类型渲染不同的输入控件 */}
                  {question.type === "text" &&
                    (question.multiline ? (
                      <Textarea placeholder={question.placeholder} className="w-full" />
                    ) : (
                      <Input placeholder={question.placeholder} className="w-full" />
                    ))}

                  {question.type === "radio" && (
                    <div className="space-y-2">
                      {question.options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="radio" id={`${question.id}-${i}`} name={question.id} className="h-4 w-4" />
                          <label htmlFor={`${question.id}-${i}`} className="text-sm">
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "checkbox" && (
                    <div className="space-y-2">
                      {question.options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input type="checkbox" id={`${question.id}-${i}`} className="h-4 w-4 rounded" />
                          <label htmlFor={`${question.id}-${i}`} className="text-sm">
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "dropdown" && (
                    <select className="w-full p-2 border rounded-md">
                      <option value="">请选择...</option>
                      {question.options?.map((option, i) => (
                        <option key={i} value={option.value}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === "rating" && (
                    <div className="flex space-x-2">
                      {Array.from({ length: question.maxRating || 5 }).map((_, i) => (
                        <button
                          key={i}
                          className="w-10 h-10 rounded-md flex items-center justify-center border bg-background hover:bg-muted"
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === "date" && <Input type="date" className="w-full" />}

                  {question.type === "file" && (
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
                      <button className="mt-2 px-4 py-2 bg-primary/10 text-primary rounded-md text-sm">选择文件</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 提交按钮 */}
        <div className="mt-8 flex justify-end">
          <Button className="px-8">提交问卷</Button>
        </div>
      </div>
    )
  }
  console.log("questions:", questions)

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
              <RenameInput id={survey.id} title={survey.title}></RenameInput>
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

              {!survey.published && (
                <Button variant="outline" size="sm" onClick={handlePublishSurvey} disabled={isSaving} className="gap-1">
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
              <DevicePreview>{renderPreviewContent()}</DevicePreview>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {/* 问卷描述 */}
                  <div className="mb-6">
                    <Textarea
                      value={survey.description}
                      onChange={handleDescriptionChange}
                      placeholder="问卷描述（可选）"
                      className="resize-none"
                      rows={2}
                    />
                  </div>

                  {/* 问题列表 */}
                  <div className="space-y-4">
                    {questions.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">问卷中还没有问题</p>
                        <Button onClick={() => handleAddQuestion("text")}>
                          <Plus className="h-4 w-4 mr-2" /> 添加第一个问题
                        </Button>
                      </div>
                    ) : (
                      questions.map((question) => (
                        <QuestionItem
                          key={question.id}
                          question={question}
                          isSelected={selectedQuestionId === question.id}
                          isPreview={false}
                          onSelect={setSelectedQuestionId}
                          onDelete={handleDeleteQuestion}
                          onDuplicate={handleDuplicateQuestion}
                          questions={questions}
                          setQuestions={setQuestions}
                        />
                      ))
                    )}
                  </div>

                  {/* 添加问题按钮 - 移动设备上显示 */}
                  <div className="mt-6 lg:hidden">
                    <Tabs defaultValue="questions">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="questions">问题类型</TabsTrigger>
                        <TabsTrigger value="settings">问卷设置</TabsTrigger>
                      </TabsList>
                      <TabsContent value="questions" className="mt-4">
                        <div className="grid grid-cols-2 gap-2">
                          {questionTypes.map((type) => (
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
                      </TabsContent>
                      <TabsContent value="settings" className="mt-4">
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-1"
                            onClick={() => setActiveTab("settings")}
                          >
                            <Settings className="h-4 w-4" />
                            基本设置
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-1"
                            onClick={() => setActiveTab("theme")}
                          >
                            <Palette className="h-4 w-4" />
                            主题样式
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
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
