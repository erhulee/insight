"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import type { Question } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, Trash2, Copy } from "lucide-react"
import { useDragDrop } from "./drag-drop-context"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { QuestionRender } from "./buildin/form-runtime/question-render"

interface QuestionItemProps {
  question: Question
  isSelected: boolean
  isPreview: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  questions: Question[]
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>
}

export function QuestionItem({
  question,
  isSelected,
  isPreview,
  onSelect,
  onDelete,
  onDuplicate,
  questions,
  setQuestions,
}: QuestionItemProps) {
  const { handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragDrop()
  const cardRef = useRef<HTMLDivElement>(null)

  // 确保元素ID始终存在
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.id = question.id
    }
  }, [question.id])

  // 安全的拖拽处理函数
  const safeDragStart = (e: React.DragEvent) => {
    try {
      handleDragStart(e, question)
    } catch (error) {
      console.error("Error in drag start:", error)
    }
  }

  const safeDragEnd = (e: React.DragEvent) => {
    try {
      handleDragEnd(e)
    } catch (error) {
      console.error("Error in drag end:", error)
    }
  }

  const safeDragOver = (e: React.DragEvent) => {
    try {
      handleDragOver(e, question.id)
    } catch (error) {
      console.error("Error in drag over:", error)
    }
  }

  const safeDrop = (e: React.DragEvent) => {
    try {
      handleDrop(e, questions, setQuestions)
    } catch (error) {
      console.error("Error in drop:", error)
    }
  }
  return (
    <Card
      ref={cardRef}
      className={cn(
        "question-item group mb-4 transition-all",
        isSelected && !isPreview && "selected border-primary",
        isPreview && "preview-item",
      )}
      onClick={() => onSelect(question.id)}
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
          <Badge variant="secondary">{question.name}</Badge>
          <p className="text-sm font-medium">{question.title}</p>
        </div>
        {!isPreview && (
          <div className="question-actions flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(question.id)
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
                onDelete(question.id)
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
