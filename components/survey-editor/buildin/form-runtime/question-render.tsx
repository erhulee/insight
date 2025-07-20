import {
  DatePickerQuestionSchemaType,
  QuestionSchemaType,
  RatingQuestionSchemaType,
} from '@/lib/dsl'
import { Input } from 'antd'
import { SingleQuestion } from '../form-item/single/render'
import { DatePicker } from '../form-item/date-picker'
import { MultipleQuestion, MultipleQuestionSchemaType } from '../form-item/multiple'
import { DescriptionRender, DescriptionSchemaType } from '../form-item/description'
import { SingleQuestionSchemaType } from '../form-item/single/schema'
import { RatingQuestion } from '../form-item/rating/render'

export function QuestionRender(props: { question: QuestionSchemaType }) {
  const { question } = props
  switch (question.type) {
    case 'input':
      return <Input
        placeholder={question.props['placeholder'] || ''}
        maxLength={question.props.maxlength}
        showCount={question.props.showCount}
      ></Input>
    case 'textarea':
      return (
        <Input.TextArea
          showCount
          maxLength={question.props['maxlength']}
          placeholder={question.props['placeholder'] || ''}
        ></Input.TextArea>
      )
    case 'multiple':
      return <MultipleQuestion dsl={question as MultipleQuestionSchemaType}></MultipleQuestion>
    case 'single':
      return <SingleQuestion dsl={question as SingleQuestionSchemaType} ></SingleQuestion>
    case "date":
      return <DatePicker dsl={question as DatePickerQuestionSchemaType}></DatePicker>
    case "rating":
      return <RatingQuestion dsl={question as RatingQuestionSchemaType}></RatingQuestion>
    case "description":
      return <DescriptionRender dsl={question as DescriptionSchemaType}></DescriptionRender>
  }
}
