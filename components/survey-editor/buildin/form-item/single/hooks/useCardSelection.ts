import { useCallback, useState } from 'react'
import { RuntimeDSLAction } from '@/app/dashboard/_valtio/runtime'

interface UseCardSelectionReturn {
  isDragging: boolean
  handleCardClick: (e: React.MouseEvent) => void
  handleDragStart: (event: any) => void
  handleDragEnd: (event: any) => void
}

export function useCardSelection(questionId: string): UseCardSelectionReturn {
  const [isDragging, setIsDragging] = useState(false)

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // 如果正在拖拽，不触发选择
    if (isDragging) {
      return
    }

    // 检查点击的元素是否需要阻止事件冒泡
    const target = e.target as HTMLElement
    
    // 如果点击的是交互元素，不触发 selectQuestion
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('[data-dnd-kit-sortable-handle]') ||
      target.closest('[data-dnd-kit-draggable]') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[role="radio"]') ||
      target.closest('[role="button"]') ||
      target.closest('[data-testid]') // 测试元素
    ) {
      return
    }
    
    // 触发选中当前问题
    RuntimeDSLAction.selectQuestion(questionId)
  }, [questionId, isDragging])

  const handleDragStart = useCallback((event: any) => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback((event: any) => {
    setIsDragging(false)
  }, [])

  return {
    isDragging,
    handleCardClick,
    handleDragStart,
    handleDragEnd,
  }
} 