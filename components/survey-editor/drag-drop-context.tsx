"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { Question } from "@/lib/types"

interface DragDropContextProps {
  isDragging: boolean
  draggedItem: Question | null
  dragOverItemId: string | null
  handleDragStart: (e: React.DragEvent, item: Question) => void
  handleDragEnd: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent, itemId: string) => void
  handleDrop: (
    e: React.DragEvent,
    questions: Question[],
    setQuestions: (questions: Question[]) => void,
  ) => void
}

const DragDropContext = createContext<DragDropContextProps | undefined>(undefined)
export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<Question | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, item: Question) => {
    setIsDragging(true)
    setDraggedItem(item)

    // 设置拖拽数据
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/plain", item.id)
    }

    // 添加拖拽时的视觉反馈
    try {
      if (e.currentTarget instanceof HTMLElement) {
        // 使用requestAnimationFrame代替setTimeout，确保DOM已更新
        requestAnimationFrame(() => {
          try {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.classList.add("dragging")
            }
          } catch (error) {
            console.error("Error adding dragging class:", error)
          }
        })
      }
    } catch (error) {
      console.error("Error in handleDragStart:", error)
    }
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false)
    setDraggedItem(null)
    setDragOverItemId(null)

    // 移除拖拽时的视觉反馈
    try {
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("dragging")
      }

      // 移除所有拖拽相关的类
      document.querySelectorAll(".drag-over").forEach((el) => {
        try {
          el.classList.remove("drag-over")
        } catch (error) {
          console.error("Error removing drag-over class:", error)
        }
      })
    } catch (error) {
      console.error("Error in handleDragEnd:", error)
    }
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, itemId: string) => {
      e.preventDefault()

      if (draggedItem && draggedItem.id !== itemId) {
        setDragOverItemId(itemId)

        // 添加拖拽目标的视觉反馈
        try {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.add("drag-over")
          }
        } catch (error) {
          console.error("Error in handleDragOver:", error)
        }
      }
    },
    [draggedItem],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, questions: Question[], setQuestions: React.Dispatch<React.SetStateAction<Question[]>>) => {
      e.preventDefault()

      console.log("draggedItem:", draggedItem)
      console.log("dragOverItemId:", dragOverItemId)
      if (draggedItem && dragOverItemId) {
        try {
          // 获取拖动项和目标项的索引
          const draggedItemIndex = questions.findIndex((q) => q.id === draggedItem.id)
          const dropTargetIndex = questions.findIndex((q) => q.id === dragOverItemId)

          if (draggedItemIndex !== -1 && dropTargetIndex !== -1) {
            // 创建新的问题数组
            const newQuestions = [...questions]

            // 移除拖动的项
            const [removed] = newQuestions.splice(draggedItemIndex, 1)

            // 在目标位置插入
            newQuestions.splice(dropTargetIndex, 0, removed)

            // 更新问题顺序
            setQuestions(newQuestions)

            // 添加动画效果 - 使用安全的方式
            requestAnimationFrame(() => {
              try {
                const element = document.getElementById(removed.id)
                if (element) {
                  element.classList.add("drop-highlight")
                  setTimeout(() => {
                    try {
                      if (element && document.body.contains(element)) {
                        element.classList.remove("drop-highlight")
                      }
                    } catch (error) {
                      console.error("Error removing drop-highlight class:", error)
                    }
                  }, 1000)
                }
              } catch (error) {
                console.error("Error adding drop-highlight class:", error)
              }
            })
          }
        } catch (error) {
          console.error("Error in handleDrop:", error)
        }
      }

      // 清理状态
      setIsDragging(false)
      setDraggedItem(null)
      setDragOverItemId(null)

      // 移除所有拖拽相关的类 - 使用安全的方式
      try {
        document.querySelectorAll(".dragging").forEach((el) => {
          try {
            el.classList.remove("dragging")
          } catch (error) {
            console.error("Error removing dragging class:", error)
          }
        })
        document.querySelectorAll(".drag-over").forEach((el) => {
          try {
            el.classList.remove("drag-over")
          } catch (error) {
            console.error("Error removing drag-over class:", error)
          }
        })
      } catch (error) {
        console.error("Error cleaning up drag classes:", error)
      }
    },
    [draggedItem, dragOverItemId],
  )

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        draggedItem,
        dragOverItemId,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (context === undefined) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }
  return context
}
