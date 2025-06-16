'use client'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
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

export function EditorQuestionContent({
  question,
  onSelect,
  onDelete,
  onDuplicate,
}: QuestionItemProps) {

  return (<Card
    className={cn(
      'question-item group mb-4 ',
    )}
    onClick={onSelect}
  >
    <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'p-1 rounded-md ',
            'hover:bg-muted/50',
          )}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="text-sm font-bold">{question.title}</span>
      </div>
      <div>{question.id}</div>
      <div className="question-actions flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(question.id)
          }}
          title="复制问题"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 "
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(question.id)
          }}
          title="删除问题"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 "
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent className="p-3 overflow-y-auto">
      <QuestionRender question={question}></QuestionRender>
    </CardContent>
  </Card>
  )
}

export function EditQuestionItem(props: QuestionItemProps) {
  const {
    question,
  } = props;
  const [isSelected, setIsSelected] = useState(false)

  // useEffect(() => {
  //   const unsubscribe = subscribeKey(runtimeStore, 'selectedQuestionID', (selectedId) => {
  //     setIsSelected(selectedId === question.id)
  //   })
  //   return () => unsubscribe()
  // }, [question.id])

  return (
    <DroppableItem id={question.id}>
      <div className={cn(
        isSelected && 'selected border-primary',
        'hover:shadow-md',)}>
        <DragItem id={question.id}>
          <EditorQuestionContent {...props}></EditorQuestionContent>
        </DragItem>
      </div>
    </DroppableItem>

  )
}
