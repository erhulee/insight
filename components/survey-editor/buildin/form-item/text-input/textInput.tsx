import { TextCursorInput } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { TextInputQuestionSchema } from './schema'
export const meta: IFormItemMeta = {
	icon: TextCursorInput,
	title: '简单输入',
	type: 'input',
	schema: TextInputQuestionSchema,
}
