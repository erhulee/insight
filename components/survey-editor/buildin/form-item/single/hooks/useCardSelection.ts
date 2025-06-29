import { useCallback, useState } from 'react'
import { RuntimeDSLAction } from '@/app/dashboard/_valtio/runtime'

/**
 * useCardSelection Hook 的返回值接口
 */
interface UseCardSelectionReturn {
  /** 是否正在拖拽状态 */
  isDragging: boolean
  /** 卡片点击事件处理器 */
  handleCardClick: (e: React.MouseEvent) => void
  /** 拖拽开始事件处理器 */
  handleDragStart: (event: any) => void
  /** 拖拽结束事件处理器 */
  handleDragEnd: (event: any) => void
}

/**
 * 卡片选择管理 Hook
 * 处理单选题卡片的点击选择和拖拽状态管理
 * 
 * @param questionId - 问题 ID
 * @returns 包含卡片选择相关方法的对象
 */
export function useCardSelection(questionId: string): UseCardSelectionReturn {
  // 拖拽状态管理
  const [isDragging, setIsDragging] = useState(false)

  /**
   * 处理卡片点击事件
   * 智能判断是否应该触发问题选择
   * 
   * @param e - 鼠标点击事件
   */
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // 如果正在拖拽，不触发选择
    if (isDragging) {
      return
    }

    // 检查点击的元素是否需要阻止事件冒泡
    const target = e.target as HTMLElement

    // 如果点击的是交互元素，不触发 selectQuestion
    // 这些元素有自己的交互逻辑，不应该触发卡片选择
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('[data-dnd-kit-sortable-handle]') || // 拖拽手柄
      target.closest('[data-dnd-kit-draggable]') || // 可拖拽元素
      target.closest('button') ||
      target.closest('input') ||
      target.closest('[role="radio"]') || // 单选按钮
      target.closest('[role="button"]') || // 按钮角色元素
      target.closest('[data-testid]') // 测试元素
    ) {
      return
    }

    // 触发选中当前问题
    RuntimeDSLAction.selectQuestion(questionId)
  }, [questionId, isDragging])

  /**
   * 处理拖拽开始事件
   * 设置拖拽状态为 true
   * 
   * @param event - 拖拽事件对象
   */
  const handleDragStart = useCallback((event: any) => {
    setIsDragging(true)
  }, [])

  /**
   * 处理拖拽结束事件
   * 设置拖拽状态为 false
   * 
   * @param event - 拖拽事件对象
   */
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