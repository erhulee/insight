import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Input as NumberInput } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import React, { useMemo } from 'react'

interface RatingLabel {
	score: number
	label: string
}

interface RatingLabelInputProps {
	value?: RatingLabel[]
	onChange?: (value: RatingLabel[]) => void
	maxRating?: number
}

function RatingLabelInput({
	value = [],
	onChange,
	maxRating = 5,
}: RatingLabelInputProps) {
	console.log('re-render:', maxRating)
	const scores = useMemo(() => {
		return Array.from({ length: maxRating }, (_, i) => i * 2 + 1)
	}, [maxRating])

	// 确保value数组长度与scores一致
	const normalizedValue = useMemo(() => {
		const result: RatingLabel[] = []
		scores.forEach((score, index) => {
			result[index] = value[index] || { score, label: '' }
		})
		return result
	}, [value, scores])

	const handleLabelChange = (index: number, label: string) => {
		const newValue = [...normalizedValue]
		newValue[index] = { ...newValue[index], label }
		onChange?.(newValue)
	}

	return (
		<div className="space-y-3">
			{scores.map((score, index) => (
				<div key={score} className="flex items-center gap-3">
					<Input
						type="number"
						value={score}
						disabled
						style={{ width: 60 }}
						className="bg-gray-50"
					/>
					<div className="text-sm flex-shrink-0 text-gray-600">分文案</div>
					<Input
						value={normalizedValue[index]?.label || ''}
						onChange={(e) => handleLabelChange(index, e.target.value)}
						placeholder={`分数${score}的文案`}
						style={{ width: 200 }}
					/>
				</div>
			))}
		</div>
	)
}

export function RatingConfig() {
	const maxRating = 5
	return (
		<div>
			<div className="text-foreground mb-2 text-base">评分设置</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">评分类型</div>
				<Select />
			</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">最高分值</div>
				<NumberInput placeholder="5" />
			</div>
			<div className="flex items-center justify-between py-1">
				<div className="text-sm text-muted-foreground">显示标签</div>
				<Switch />
			</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">分数文案</div>
				<RatingLabelInput maxRating={maxRating} />
			</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">评分说明</div>
				<textarea
					className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
					placeholder="例如：5分表示非常满意，1分表示非常不满意，分值越低表示满意度越低"
				/>
			</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">关联选项</div>
			</div>
		</div>
	)
}
