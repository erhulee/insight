import { Button } from '@/components/ui/button'
import { Circle } from 'lucide-react'
import { PlusCircle, XIcon } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortableOptions } from './hooks/useSortableOptions'
import { useCardSelection } from './hooks/useCardSelection'
import { SingleQuestionItemProps, SingleQuestionProps } from './types'

/**
 * 可排序的单选题选项组件
 * 支持拖拽排序、编辑标签和删除功能
 */
function SortableQuestionItem(props: SingleQuestionItemProps) {
	const { label, id, onDelete, onLabelChange } = props
	const inputRef = useRef<HTMLInputElement | null>(null)

	// 使用 @dnd-kit 的 useSortable hook 实现拖拽功能
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id })

	// 处理输入框内容变化
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onLabelChange(e.target.value)
		},
		[onLabelChange],
	)

	// 拖拽时的样式配置
	const style = {
		transform: CSS.Transform.toString(transform),
		transition: isDragging ? 'none' : transition, // 拖拽时禁用过渡动画，避免闪烁
		opacity: isDragging ? 0.3 : 1, // 拖拽时降低透明度，提供视觉反馈
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`
        bg-muted p-2 rounded-md flex items-center gap-2 cursor-move
        ${
					isDragging
						? 'shadow-lg scale-105 z-10' // 拖拽时的样式
						: 'hover:bg-accent transition-colors duration-150' // 悬停时的样式
				}
      `}
			{...attributes}
			{...listeners}
		>
			{/* 单选按钮占位（样式化替代） */}
			<Circle className="w-4 h-4 text-muted-foreground" />

			{/* 选项文本输入框 */}
			<input
				ref={inputRef}
				className="bg-transparent outline-none w-full text-sm text-foreground flex-1"
				defaultValue={label}
				onChange={handleInputChange}
				placeholder="输入选项内容"
				onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，避免触发卡片选择
				onFocus={(e) => e.target.select()} // 聚焦时选中所有文本
			/>

			{/* 删除按钮 */}
			<Button
				variant="secondary"
				size="sm"
				onClick={() => onDelete(id)}
				title="删除选项"
			>
				<XIcon width={18} height={18} />
			</Button>
		</div>
	)
}

/**
 * 拖拽覆盖层组件
 * 在拖拽过程中显示选项的预览
 */
function DragOverlayItem({ label }: { label: string }) {
	return (
		<div className="bg-accent p-2 rounded-md flex items-center gap-2 shadow-xl border-2 border-primary/40 transform">
			<Circle className="w-4 h-4 text-muted-foreground" />
			<span className="text-sm text-foreground font-medium">{label}</span>
		</div>
	)
}

/**
 * 添加选项按钮组件
 */
function AddOptionButton({ onClick }: { onClick: () => void }) {
	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={(e) => {
				e.stopPropagation() // 阻止事件冒泡
				onClick()
			}}
			className="mt-2"
			title="添加新选项"
		>
			<PlusCircle className="w-4 h-4 mr-1" />
			添加选项
		</Button>
	)
}

/**
 * 单选题主组件
 * 包含拖拽排序、选项管理、卡片选择等功能
 */
export function SingleQuestion({ dsl }: SingleQuestionProps) {
	// 使用自定义 Hook 管理拖拽排序和选项操作
	const {
		sortableItems,
		sensors,
		handleDragStart,
		handleDragEnd,
		addOption,
		updateOption,
		deleteOption,
		activeItem,
	} = useSortableOptions(dsl)

	// 使用自定义 Hook 管理卡片选择逻辑
	const {
		handleCardClick,
		handleDragStart: handleCardDragStart,
		handleDragEnd: handleCardDragEnd,
	} = useCardSelection(dsl.id)

	// 增强的拖拽处理器，结合卡片选择和排序逻辑
	const handleDragStartEnhanced = useCallback(
		(event: any) => {
			handleCardDragStart(event)
			handleDragStart(event)
		},
		[handleCardDragStart, handleDragStart],
	)

	const handleDragEndEnhanced = useCallback(
		(event: any) => {
			handleCardDragEnd(event)
			handleDragEnd(event)
		},
		[handleCardDragEnd, handleDragEnd],
	)

	return (
		<div
			className="p-4 border border-border rounded-lg bg-card cursor-pointer"
			onClick={handleCardClick}
		>
			{/* 拖拽上下文，管理拖拽状态和事件 */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStartEnhanced}
				onDragEnd={handleDragEndEnhanced}
			>
				<div className="space-y-2">
					{/* 可排序上下文，管理排序策略 */}
					<SortableContext
						items={sortableItems.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="flex flex-col gap-1">
							{/* 渲染所有可排序的选项 */}
							{sortableItems.map((opt, index) => (
								<SortableQuestionItem
									key={opt.id}
									id={opt.id}
									label={opt.label}
									index={index}
									onLabelChange={(label) => updateOption(index, label)}
									onDelete={(id) => deleteOption(id)}
								/>
							))}
						</div>
					</SortableContext>

					{/* 添加选项按钮 */}
					<AddOptionButton onClick={addOption} />
				</div>

				{/* 拖拽覆盖层，显示拖拽时的预览 */}
				<DragOverlay dropAnimation={null}>
					{activeItem ? <DragOverlayItem label={activeItem.label} /> : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}
