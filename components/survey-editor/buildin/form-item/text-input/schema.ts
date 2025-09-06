import { CircleCheckBig } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { QuestionSchema } from '@/lib/dsl'
import { z } from 'zod'

export const TextInputQuestionSchema = QuestionSchema.extend({
	type: z.enum(['textarea']),
	props: z
		.object({
			placeholder: z.string().optional(),
		})
		.optional(),
	validate: z
		.object({
			required: z.boolean().optional(),
			min: z.number().optional(),
			max: z.number().optional(),
			pattern: z.string().optional(),
			// 添加最高字数限制
			maxLength: z.number().optional(),
			// 添加文本格式验证，使用枚举类型
			format: z.enum(['phone', 'idCard']).optional(),
		})
		.optional(),
})
export type TextareaQuestionSchemaType = z.infer<typeof TextInputQuestionSchema>

export const TextInputMeta: IFormItemMeta<typeof TextInputQuestionSchema> = {
	icon: CircleCheckBig,
	title: '简单输入',
	type: 'input',
	schema: TextInputQuestionSchema,
}
