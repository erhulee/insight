import { Button } from '@/components/ui/button'
import { Radio } from 'antd'
import { PlusCircle } from 'lucide-react'
import { useRef, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortableOptions } from './hooks/useSortableOptions'
import { useCardSelection } from './hooks/useCardSelection'
import { SingleQuestionItemProps, SingleQuestionProps } from './types'

// Sortable item component
function SortableQuestionItem({ label, index, onLabelChange, id }: SingleQuestionItemProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onLabelChange(e.target.value)
  }, [onLabelChange])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-100 p-2 rounded-md flex items-center gap-2 cursor-move transition-all duration-200 ${isDragging ? 'shadow-lg scale-105' : 'hover:bg-slate-200'
        }`}
      {...attributes}
      {...listeners}
    >
      <Radio />
      <input
        ref={inputRef}
        className="bg-transparent outline-none w-full text-sm text-gray-700 flex-1"
        defaultValue={label}
        onChange={handleInputChange}
        placeholder="输入选项内容"
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.target.select()}
      />
    </div>
  )
}

// Drag overlay component
function DragOverlayItem({ label }: { label: string }) {
  return (
    <div className="bg-slate-200 p-2 rounded-md flex items-center gap-2 shadow-xl border-2 border-blue-300 transform">
      <Radio />
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </div>
  )
}

// Add option button component
function AddOptionButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="mt-2"
    >
      <PlusCircle className="w-4 h-4 mr-1" />
      添加选项
    </Button>
  )
}

// Main component
export function SingleQuestion({ dsl }: SingleQuestionProps) {
  const {
    sortableItems,
    sensors,
    handleDragStart,
    handleDragEnd,
    addOption,
    updateOption,
    activeItem,
  } = useSortableOptions(dsl)

  // Card selection logic
  const {
    handleCardClick,
    handleDragStart: handleCardDragStart,
    handleDragEnd: handleCardDragEnd,
  } = useCardSelection(dsl.id)

  // Enhanced drag handlers that combine card selection and sortable logic
  const handleDragStartEnhanced = useCallback((event: any) => {
    handleCardDragStart(event)
    handleDragStart(event)
  }, [handleCardDragStart, handleDragStart])

  const handleDragEndEnhanced = useCallback((event: any) => {
    handleCardDragEnd(event)
    handleDragEnd(event)
  }, [handleCardDragEnd, handleDragEnd])

  return (
    <div
      className="p-4 border border-gray-200 rounded-lg bg-white cursor-pointer"
      onClick={handleCardClick}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStartEnhanced}
        onDragEnd={handleDragEndEnhanced}
      >
        <div className="space-y-2">
          <SortableContext
            items={sortableItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1">
              {sortableItems.map((opt, index) => (
                <SortableQuestionItem
                  key={opt.id}
                  id={opt.id}
                  label={opt.label}
                  index={index}
                  onLabelChange={(label) => updateOption(index, label)}
                />
              ))}
            </div>
          </SortableContext>
          <AddOptionButton onClick={addOption} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <DragOverlayItem label={activeItem.label} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
