import { meta as TextInputMeta } from './text-input/textInput'
import { meta as TextareaMeta } from './text-area/textArea'
import { meta as SingleMeta } from './single/schema'
import { meta as DatePickerMeta } from './date-picker/schema'
import { DescriptionMeta } from './description'
import { MultipleMeta } from './multiple'
import { meta as RatingMeta } from './rating'
export { QuestionType } from './core/QuestionType'

export const preset = [
    TextInputMeta,
    TextareaMeta,
    MultipleMeta,
    SingleMeta,
    DatePickerMeta,
    DescriptionMeta,
    RatingMeta,
]
