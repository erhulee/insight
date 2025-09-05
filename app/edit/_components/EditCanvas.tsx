import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { scrollToElement } from '@/lib/utils'
import { preset, QuestionType } from '@/components/survey-editor/buildin/form-item'
import { cloneDeep } from 'lodash-es'
import { EditQuestionItem } from './EditQuestionItem'
import {
  Question,
} from '@/app/(dashboard)/dashboard/_valtio/runtime'
import { QuestionSchemaType } from '@/lib/dsl'
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core'
import { useAction } from '../_hooks/useAction'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// 问题类型定义
const questionTypes = preset.map((item) => ({
  id: item.type,
  name: item.title,
  icon: <item.icon className="h-4 w-4" />,
}))

/**
 * Main canvas component for editing survey questions
 */
export const Canvas: React.FC = () => {
  const { questions, selectQuestion, addQuestion, handleDragEnd, deleteQuestion, isQuestionSelected } = useAction()

  const handleSelectQuestion = (question: Question) => {
    selectQuestion(question)
  }

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  })

  /**
   * Duplicates a question and inserts it after the original
   */
  const handleDuplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find((q) => q.id === id)
    if (!questionToDuplicate) return

    const duplicatedQuestion: Question = {
      ...cloneDeep(questionToDuplicate),
      id: uuidv4(),
    }

    const index = questions.findIndex((q) => q.id === id)
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index + 1, 0, duplicatedQuestion)

    // 滚动到复制的问题
    setTimeout(() => {
      scrollToElement(duplicatedQuestion.id, 100)
    }, 100)
  }

  const CanvasSkeleton = () => {
    return (
      <div className=' space-y-4 flex flex-col justify-center items-center h-full' >
        {[1, 2, 3].map(() => (<Card className=' w-full' >
          <CardHeader>
            <Skeleton className=" h-5 w-[180px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 w-full">
              <Skeleton className=" h-8 w-full" />
              <Skeleton className=" h-6 w-full" />
            </div>
          </CardContent>
        </Card>))}
      </div>
    )
  }

  const CanvasNoData = () => {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">问卷中还没有问题</p>
        <Button onClick={() => addQuestion(QuestionType.Text)}>
          <Plus className="h-4 w-4 mr-2" /> 添加第一个问题
        </Button>
      </div>
    )
  }


  // 渲染预览内容
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* 问题列表 */}
        <DndContext
          sensors={[pointerSensor]}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {questions.length === 0 ? (
              <CanvasNoData />
            ) : (
              questions.map((question, index) => (
                <EditQuestionItem
                  key={question.id}
                  question={question}
                  isPreview={false}
                  isSelected={isQuestionSelected(question.id)}
                  onSelect={() => handleSelectQuestion(question)}
                  onDelete={deleteQuestion}
                  onDuplicate={handleDuplicateQuestion}
                  index={index}
                />
              ))
            )}
          </div>
        </DndContext>

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
                    onClick={() => addQuestion(type.id as QuestionType)}
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
    </div >
  )
}
