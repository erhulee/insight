'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuestionRender } from '@/components/survey-editor/buildin/form-runtime/question-render'
import { QuestionSchemaType } from '@/lib/dsl'
import { DroppableItem } from './drag/dropItem'
import DragItem from './drag/dragItem'

interface QuestionItemProps {
  question: QuestionSchemaType
  isSelected: boolean
  isPreview: boolean
  onSelect: () => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  index: number
}

interface EditorQuestionContentProps extends Omit<QuestionItemProps, 'isSelected'> {
  isSelected?: boolean
}

/**
 * Renders the content of a question item in the editor
 */
const EditorQuestionContent: React.FC<EditorQuestionContentProps> = ({
  question,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate(question.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(question.id)
  }

  console.log("q:", question)

  return (
    <Card
      className={cn('question-item group ')}
      onClick={onSelect}
    >
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'p-1 rounded-md',
              'hover:bg-muted/50'
            )}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          {question.required && <span className=" text-red-500 " >*</span>}
          <span className="text-sm font-bold">{question.title}</span>
        </div>
        <div className="question-actions flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDuplicate}
            title="复制问题"
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="删除问题"
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 overflow-y-auto">
        <QuestionRender question={question} />
      </CardContent>
    </Card>
  )
}

/**
 * Main question item component with drag and drop functionality
 */
export const EditQuestionItem: React.FC<QuestionItemProps> = ({
  question,
  isSelected,
  ...props
}) => {
  console.log("is Selectrd:?", isSelected)
  return (
    <DroppableItem id={question.id}>
      <div
        className={cn(
          isSelected && 'selected border-primary border rounded-md',
          'hover:shadow-md'
        )}
      >
        <DragItem id={question.id}>
          <EditorQuestionContent
            question={question}
            {...props}
          />
        </DragItem>
      </div>
    </DroppableItem>
  )
}
