import { QuestionSchemaType, RatingQuestionSchemaType } from '@/lib/dsl'
import { Input } from '@/components/ui/input'
import { SingleQuestion } from '../form-item/single/render'
import { DatePicker } from '../form-item/date-picker'
import {
	MultipleQuestion,
	MultipleQuestionSchemaType,
} from '../form-item/multiple'
import {
	DescriptionRender,
	DescriptionSchemaType,
} from '../form-item/description'
import { SingleQuestionSchemaType } from '../form-item/single/schema'
import { RatingQuestion } from '../form-item/rating/render'
import { DatePickerQuestionSchemaType } from '../form-item/date-picker/schema'

export function QuestionRender(props: { question: QuestionSchemaType }) {
	const { question } = props
	switch (question.type) {
		case 'input':
			return (
				<Input
					placeholder={question.props['placeholder'] || ''}
					maxLength={question.props.maxlength}
				/>
			)
		case 'textarea':
			return (
				<textarea
					className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					maxLength={question.props['maxlength']}
					placeholder={question.props['placeholder'] || ''}
				/>
			)
		case 'multiple':
			return (
				<MultipleQuestion
					dsl={question as MultipleQuestionSchemaType}
				></MultipleQuestion>
			)
		case 'single':
			return (
				<SingleQuestion
					dsl={question as SingleQuestionSchemaType}
				></SingleQuestion>
			)
		case 'date':
			return (
				<DatePicker dsl={question as DatePickerQuestionSchemaType}></DatePicker>
			)
		case 'rating':
			return (
				<RatingQuestion
					dsl={question as RatingQuestionSchemaType}
				></RatingQuestion>
			)
		case 'description':
			return (
				<DescriptionRender
					dsl={question as DescriptionSchemaType}
				></DescriptionRender>
			)
	}
}
