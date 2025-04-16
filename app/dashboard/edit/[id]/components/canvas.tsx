import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings } from "lucide-react"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { QuestionItem } from "@/components/survey-editor/question-item"
import { Question } from "@/lib/types"
import { scrollToElement, } from "@/lib/utils"
import { preset } from "@/components/survey-editor/buildin/form-item"
type Props = {
    survey: any
    questions: any[]
    selectedQuestionId: string | null
    onQuestionsChange: (questions: any[]) => void
    onQuestionSelect: (id: string) => void
}
// 问题类型定义
const questionTypes = preset.map((item) => ({
    id: item.key,
    name: item.name,
    icon: <item.icon className="h-4 w-4"></item.icon>
}))
export function Canvas(props: Props) {
    const { questions, survey, onQuestionsChange } = props;
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

        onQuestionsChange(updatedQuestions)
        setSelectedQuestionId(duplicatedQuestion.id)

        // 滚动到复制的问题
        setTimeout(() => {
            scrollToElement(duplicatedQuestion.id, 100)
        }, 100)
    }
    const handleDeleteQuestion = (id: string) => {
        const updatedQuestions = questions.filter((q) => q.id !== id)
        // 如果删除的是当前选中的问题，选中第一个问题或清除选择
        if (id === selectedQuestionId) {
            setSelectedQuestionId(updatedQuestions.length > 0 ? updatedQuestions[0].id : null)
        }
        onQuestionsChange(updatedQuestions)

    }
    const handleDescriptionChange = () => {

    }

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
        onQuestionsChange(updatedQuestions)
        setSelectedQuestionId(newQuestion.id)
        // 滚动到新添加的问题
        setTimeout(() => {
            scrollToElement(newQuestion.id, 100)
        }, 100)
    }
    // 渲染预览内容

    return <div className="h-full flex flex-col">
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
                        {/* <div className="space-y-2">
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
                        </div> */}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </div>

}