import { useCallback, useState, useRef, useEffect } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { RuntimeDSLAction } from '@/app/(dashboard)/dashboard/_valtio/runtime'
import { cloneDeep } from "lodash-es"
import { SortableOption, Option } from '../types'
import { generateUniqueId, generateFallbackId } from '../utils/idGenerator'
import { SingleQuestionSchemaType } from '../schema'

/**
 * useSortableOptions Hook 的返回值接口
 */
interface UseSortableOptionsReturn {
  /** 可排序的选项列表 */
  sortableItems: SortableOption[]
  /** 当前激活的拖拽项 ID */
  activeId: string | null
  /** 拖拽传感器配置 */
  sensors: ReturnType<typeof useSensors>
  /** 拖拽开始事件处理器 */
  handleDragStart: (event: DragStartEvent) => void
  /** 拖拽结束事件处理器 */
  handleDragEnd: (event: DragEndEvent) => void
  /** 添加新选项 */
  addOption: () => void
  /** 更新选项标签 */
  updateOption: (index: number, label: string) => void
  /** 删除选项 */
  deleteOption: (id: string) => void
  /** 当前激活的选项项 */
  activeItem: SortableOption | null
}

/**
 * 可排序选项管理 Hook
 * 提供单选题选项的拖拽排序、增删改查等功能
 * 
 * @param dsl - 单选题的 DSL 数据结构
 * @returns 包含所有选项操作方法的对象
 */
export function useSortableOptions(dsl: SingleQuestionSchemaType): UseSortableOptionsReturn {
  const { props } = dsl
  const { options } = props!

  // 拖拽覆盖层的状态管理
  const [activeId, setActiveId] = useState<string | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 配置拖拽传感器
  const sensors = useSensors(
    // 指针传感器，用于鼠标和触摸拖拽
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 减少激活距离，提高拖拽响应性
      },
    }),
    // 键盘传感器，用于键盘导航和拖拽
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 生成可排序选项列表（确保每个选项都有唯一 ID）
  const sortableItems: SortableOption[] = options

  // 清理定时器的副作用
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  /**
   * 添加新选项
   * 自动选中当前问题并添加默认选项
   */
  const addOption = useCallback(() => {
    // 选中当前问题
    RuntimeDSLAction.selectQuestion(dsl.id)

    // 创建新选项
    const newOption = {
      label: '新选项',
      value: generateUniqueId(),
      id: generateUniqueId(),
    }

    // 更新 DSL 数据
    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: [...options, newOption],
      },
    })
  }, [props, options, dsl.id])

  /**
   * 更新选项标签
   * @param index - 选项索引
   * @param label - 新的标签文本
   */
  const updateOption = useCallback((index: number, label: string) => {
    const newOptions = cloneDeep(options)
    newOptions[index].label = label

    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: newOptions
      },
    })
  }, [props, options])

  /**
   * 删除指定选项
   * @param id - 要删除的选项 ID
   */
  const deleteOption = useCallback((id: string) => {
    const newOptions = options.filter(item => item.id !== id)

    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: newOptions
      },
    })
  }, [props, options])

  /**
   * 重新排序选项
   * @param oldIndex - 原位置索引
   * @param newIndex - 新位置索引
   */
  const reorderOptions = useCallback((oldIndex: number, newIndex: number) => {
    const items = arrayMove(options, oldIndex, newIndex)

    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: items,
      },
    })
  }, [props, options])

  /**
   * 处理拖拽开始事件
   * @param event - 拖拽开始事件对象
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    // 清除之前的动画定时器
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }

    // 设置激活项 ID
    setActiveId(event.active.id as string)

    // 选中当前问题
    RuntimeDSLAction.selectQuestion(dsl.id)
  }, [dsl.id])

  /**
   * 处理拖拽结束事件
   * @param event - 拖拽结束事件对象
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    // 如果没有目标位置，直接清除状态
    if (!over) {
      setActiveId(null)
      return
    }

    // 如果拖拽到了不同的位置，执行重新排序
    if (active.id !== over.id) {
      const oldIndex = sortableItems.findIndex(item => item.id === active.id)
      const newIndex = sortableItems.findIndex(item => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderOptions(oldIndex, newIndex)
      }
    }

    // 立即清除激活状态，避免闪烁动画
    setActiveId(null)
  }, [sortableItems, reorderOptions])

  // 获取当前激活的选项项，用于拖拽覆盖层显示
  const activeItem = activeId ? sortableItems.find(item => item.id === activeId) || null : null

  return {
    sortableItems,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    addOption,
    updateOption,
    deleteOption,
    activeItem,
  }
} 