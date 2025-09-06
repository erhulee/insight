import { Fullscreen } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { TextareaQuestionSchema } from './schema'

export const meta: IFormItemMeta = {
	icon: Fullscreen,
	title: '多行输入框',
	type: 'textarea',
	schema: TextareaQuestionSchema,
}
