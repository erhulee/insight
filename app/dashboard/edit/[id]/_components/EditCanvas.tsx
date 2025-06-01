import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Question } from '@/lib/types'
import { scrollToElement } from '@/lib/utils'
import { preset, QuestionType } from '@/components/survey-editor/buildin/form-item'
import { cloneDeep } from 'lodash-es'
import { EditQuestionItem } from './EditQuestionItem'
import { useSnapshot } from 'valtio'
import {
  addQuestion,
  deleteQuestion,
  runtimeStore,
  selectQuestion,
} from '@/app/dashboard/_valtio/runtime'
type Props = {}
// 问题类型定义
const questionTypes = preset.map((item) => ({
  id: item.type,
  name: item.title,
  icon: <item.icon className="h-4 w-4"></item.icon>,
}))
export function Canvas(props: Props) {
  const runtimeState = useSnapshot(runtimeStore)
  const questions = runtimeState.currentQuestion
  const handleSelectQuestion = (question: Question) => {
    selectQuestion(question)
  }
  // 复制问题
  const handleDuplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find((q) => q.field === id)!
    if (!questionToDuplicate) return

    const duplicatedQuestion: Question = {
      ...JSON.parse(JSON.stringify(questionToDuplicate)),
      id: uuidv4(),
    }

    const index = questions.findIndex((q) => q.field === id)
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index + 1, 0, duplicatedQuestion)
    // 滚动到复制的问题
    setTimeout(() => {
      scrollToElement(duplicatedQuestion.field, 100)
    }, 100)
  }
  const handleDeleteQuestion = (id: string) => {
    deleteQuestion(id)
  }
  const handleDescriptionChange = () => {}

  const handleAddQuestion = (type: QuestionType) => {
    const questionPreset = cloneDeep(preset.find((item) => item.type == type))
    const newQuestion: Question = {
      field: uuidv4(),
      ...questionPreset,
    } as any
    addQuestion(newQuestion)
    // setSelectedQuestionId(newQuestion.id)
    // 滚动到新添加的问题
    setTimeout(() => {
      scrollToElement(newQuestion.field, 100)
    }, 100)
  }
  // 渲染预览内容
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* 问卷描述 */}
        {/* <div className="mb-6">
                <Textarea
                    value={survey.description}
                    onChange={handleDescriptionChange}
                    placeholder="问卷描述（可选）"
                    className="resize-none"
                    rows={2}
                />
            </div> */}

        {/* 问题列表 */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">问卷中还没有问题</p>
              <Button onClick={() => handleAddQuestion(QuestionType.Text)}>
                <Plus className="h-4 w-4 mr-2" /> 添加第一个问题
              </Button>
            </div>
          ) : (
            questions.map((question) => (
              <EditQuestionItem
                key={question.field}
                question={question}
                isPreview={false}
                onSelect={() => {
                  handleSelectQuestion(question)
                }}
                onDelete={handleDeleteQuestion}
                onDuplicate={handleDuplicateQuestion}
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
          </Tabs>
        </div>
      </div>
    </div>
  )
}
