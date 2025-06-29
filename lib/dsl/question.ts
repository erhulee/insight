import { QuestionSchema } from './base'
import { z } from 'zod'

export const InputQuestionScehma = QuestionSchema.extend({
  type: z.enum(['input']),
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
export type InputQuestionScehmaType = z.infer<typeof InputQuestionScehma>

export const TextareaQuestionSchema = QuestionSchema.extend({
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
export type TextareaQuestionSchemaType = z.infer<typeof TextareaQuestionSchema>




export * from "./date-picker"