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
import { RuntimeDSLAction } from '@/app/dashboard/_valtio/runtime'
import { SingleQuestionSchemaType } from '@/lib/dsl'
import { cloneDeep } from "lodash-es"
import { SortableOption, Option } from '../types'
import { generateUniqueId, generateFallbackId } from '../utils/idGenerator'

interface UseSortableOptionsReturn {
  sortableItems: SortableOption[]
  activeId: string | null
  sensors: ReturnType<typeof useSensors>
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  addOption: () => void
  updateOption: (index: number, label: string) => void
  activeItem: SortableOption | null
}


export function useSortableOptions(dsl: SingleQuestionSchemaType): UseSortableOptionsReturn {
  const { props } = dsl
  const { options } = props!
  
  // State for drag overlay
  const [activeId, setActiveId] = useState<string | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generate unique IDs for sortable items
  const sortableItems: SortableOption[] = options

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  const addOption = useCallback(() => {
     // 还需要选中 selectedQuestionID
     RuntimeDSLAction.selectQuestion(dsl.id)
    const newOption = {
      label: '新选项',
      value: generateUniqueId(),
      id: generateUniqueId(),
    }
    
    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: [...options, newOption],
      },
    })
  }, [props, options])

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

  const reorderOptions = useCallback((oldIndex: number, newIndex: number) => {
    const items = arrayMove(options, oldIndex, newIndex)
    RuntimeDSLAction.updateQuestion('props', {
      props: {
        ...props,
        options: items,
      },
    })
  }, [props, options])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // 清除之前的动画定时器
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
    
    setActiveId(event.active.id as string)
    // 还需要选中 selectedQuestionID
    RuntimeDSLAction.selectQuestion(dsl.id)
  }, [dsl.id])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    if (active.id !== over.id) {
      const oldIndex = sortableItems.findIndex(item => item.id === active.id)
      const newIndex = sortableItems.findIndex(item => item.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderOptions(oldIndex, newIndex)
      }
    }

    // 使用更长的延迟，让 overlay 有时间移动到新位置
    animationTimeoutRef.current = setTimeout(() => {
      setActiveId(null)
      animationTimeoutRef.current = null
    }, 250)
  }, [sortableItems, reorderOptions])

  // Get the active item for overlay
  const activeItem = activeId ? sortableItems.find(item => item.id === activeId) || null : null

  return {
    sortableItems,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    addOption,
    updateOption,
    activeItem,
  }
} 