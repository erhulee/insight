import { DatePickerProps } from './types'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAction } from '@/app/edit/core'

/**
 * 日期选择器主组件
 * 简单的输入框样式，不包含实际的数据存储功能
 */
export function DatePicker({ dsl }: DatePickerProps) {
	const { selectedQuestionId } = useAction()
	// 从 DSL 中提取配置和值
	const { props } = dsl
	const { min, max, format, range } = props
	return (
		<div className="space-y-2">
			{/* 日期选择器输入框样式 */}
			<div className="relative">
				<Input
					placeholder="请选择日期"
					readOnly
					className="pl-10 pr-4 cursor-pointer bg-background"
					onClick={() => {
						// 这里可以添加点击事件，但目前只是展示样式
						console.log('日期选择器被点击')
					}}
				/>

				{/* 日历图标 */}
				<CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
			</div>

			{selectedQuestionId == dsl.id && (
				<Calendar
					mode="single"
					disabled={true}
					defaultMonth={new Date()}
					numberOfMonths={range ? 2 : 1}
					selected={new Date()}
					onSelect={() => {}}
					className="rounded-lg border shadow-sm"
				/>
			)}
		</div>
	)
}
