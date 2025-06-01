'use client'
import type React from 'react'
import { useRef, useEffect } from 'react'
import type { Question } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDragDrop } from '@/components/survey-editor/drag-drop-context'
import { QuestionRender } from '@/components/survey-editor/buildin/form-runtime/question-render'
import { useSnapshot } from 'valtio'
import { runtimeStore } from '@/app/dashboard/_valtio/runtime'
import { Badge } from '@/components/ui/badge'

interface QuestionItemProps {
  question: Question
  isSelected: boolean
  isPreview: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export function EditQuestionItem({
  question,
  isPreview,
  onSelect,
  onDelete,
  onDuplicate,
}: QuestionItemProps) {
  const { handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragDrop()
  const selectedQuestionID = useSnapshot(runtimeStore).selectedQuestionID
  const isSelected = selectedQuestionID == question.field
  const cardRef = useRef<HTMLDivElement>(null)

  // 确保元素ID始终存在
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.id = question.field
    }
  }, [question.field])

  // 安全的拖拽处理函数
  const safeDragStart = (e: React.DragEvent) => {
    try {
      handleDragStart(e, question)
    } catch (error) {
      console.error('Error in drag start:', error)
    }
  }

  const safeDragEnd = (e: React.DragEvent) => {
    try {
      handleDragEnd(e)
    } catch (error) {
      console.error('Error in drag end:', error)
    }
  }

  const safeDragOver = (e: React.DragEvent) => {
    try {
      handleDragOver(e, question.field)
    } catch (error) {
      console.error('Error in drag over:', error)
    }
  }

  const safeDrop = (e: React.DragEvent) => {
    const questions: any = []
    try {
      // handleDrop(e, questions, setQuestions)
    } catch (error) {
      console.error('Error in drop:', error)
    }
  }
  console.log('qqqqq:', question)
  return (
    <Card
      ref={cardRef}
      className={cn(
        'question-item group transition-all',
        isSelected && !isPreview && 'selected border-primary',
        isPreview && 'preview-item',
      )}
      onClick={() => onSelect(question.field)}
      draggable={!isPreview}
      onDragStart={safeDragStart}
      onDragEnd={safeDragEnd}
      onDragOver={safeDragOver}
      onDrop={safeDrop}
    >
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {!isPreview && (
            <div className="drag-handle cursor-grab">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <span className=" text-sm font-bold">{question.attr['title']}</span>
          <Badge variant="secondary">{question.name}</Badge>
        </div>
        {!isPreview && (
          <div className="question-actions flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(question.field)
              }}
              title="复制问题"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(question.field)
              }}
              title="删除问题"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 max-h-[300px] overflow-y-auto">
        <QuestionRender question={question}></QuestionRender>
      </CardContent>
    </Card>
  )
}
