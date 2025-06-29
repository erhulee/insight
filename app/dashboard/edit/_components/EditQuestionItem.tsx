'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuestionRender } from '@/components/survey-editor/buildin/form-runtime/question-render'
import { QuestionSchemaType } from '@/lib/dsl'
import { DroppableItem } from './drag/dropItem'
import DragItem from './drag/dragItem'
import { useQuestionDescription } from '../_hooks/useQuestionDescription'
import { useEffect } from 'react'

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
  // 使用自定义 Hook 管理描述编辑
  const {
    description,
    isEditing,
    descriptionRef,
    handleFocus,
    handleBlur,
    handleInput,
    // handleKeyDown,
  } = useQuestionDescription(question.id, question.description || '')

  // 确保 contentEditable 元素的内容与状态同步
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.textContent = description
    }
  }, [])

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDuplicate(question.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(question.id)
  }

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
        {/* 优化的题目描述编辑区域 */}
        <div className="mb-3 relative">
          <p
            ref={descriptionRef}
            contentEditable={true}
            className={cn(
              'min-h-[24px] px-2 py-1 rounded-md text-sm',
              'border border-transparent hover:border-muted-foreground/20',
              'focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20',
              'transition-all duration-200 ease-in-out',
              'cursor-text relative z-10',
              isEditing && 'bg-muted/30 border-primary/30',
              'text-foreground',
              'text-sm text-muted-foreground/60 '

            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInput={handleInput}
            style={{
              minHeight: '24px',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.4',
            }}
          >
          </p>
          {/* 自定义 placeholder */}
          {!description && !isEditing && (
            <div className="absolute inset-0 px-2 py-1 text-sm text-muted-foreground/60  pointer-events-none">
              点击添加题目描述（选填）
            </div>
          )}
        </div>
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
