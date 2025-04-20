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

  // 渲染问题内容
  const renderQuestionContent = () => {
    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md bg-muted/50"
              placeholder={question.placeholder || "请输入..."}
              disabled={isPreview}
            />
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
          </div>
        )
      case "radio":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <div className="space-y-1">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    id={`option-${question.id}-${index}`}
                    disabled={isPreview}
                  />
                  <label htmlFor={`option-${question.id}-${index}`} className="text-sm">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )
      case "checkbox":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <div className="space-y-1">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" id={`option-${question.id}-${index}`} disabled={isPreview} />
                  <label htmlFor={`option-${question.id}-${index}`} className="text-sm">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )
      case "dropdown":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <select className="w-full px-3 py-2 border rounded-md bg-background" disabled={isPreview}>
              <option value="">请选择...</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option.value || option.text}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        )
      case "rating":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <div className="flex space-x-2">
              {Array.from({ length: question.maxRating || 5 }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center",
                    "border border-primary/20 hover:bg-primary/10",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  )}
                  disabled={isPreview}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )
      case "date":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <input type="date" className="w-full px-3 py-2 border rounded-md bg-background" disabled={isPreview} />
          </div>
        )
      case "file":
        return (
          <div className="space-y-2">
            {question.required && <span className="text-destructive text-sm">*</span>}
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-4 text-center">
              <p className="text-sm text-muted-foreground">点击或拖拽文件到此处上传</p>
              <input type="file" className="hidden" id={`file-${question.id}`} disabled={isPreview} />
              <label
                htmlFor={`file-${question.id}`}
                className="mt-2 inline-block px-4 py-2 bg-primary/10 text-primary rounded-md text-sm cursor-pointer"
              >
                选择文件
              </label>
            </div>
          </div>
        )
      case "section":
        return (
          <div className="space-y-2">
            {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
          </div>
        )
      default:
        return (
          <div className="space-y-2">
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
          </div>
        )
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
          <Badge variant="secondary">  {question.type === "section"
            ? "分节"
            : question.type === "text"
              ? "文本"
              : question.type === "radio"
                ? "单选"
                : question.type === "checkbox"
                  ? "多选"
                  : question.type === "dropdown"
                    ? "下拉"
                    : question.type === "rating"
                      ? "评分"
                      : question.type === "date"
                        ? "日期"
                        : question.type === "file"
                          ? "文件"
                          : "问题"}</Badge>

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
      <CardContent className="p-3 max-h-[300px] overflow-y-auto">{renderQuestionContent()}</CardContent>
    </Card>
  )
}
