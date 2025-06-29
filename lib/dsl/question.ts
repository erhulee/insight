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

export const MultipleQuestionSchema = QuestionSchema.extend({
  type: z.enum(['multiple']),
  props: z
    .object({
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional()
        .default([
          {
            label: '选项1',
            value: 'value1',
          },
        ]),
    })
    .optional(),
})
export type MultipleQuestionSchemaType = z.infer<typeof MultipleQuestionSchema>

export const SingleQuestionSchema = QuestionSchema.extend({
  type: z.enum(['single']),
  props: z
    .object({
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
            id: z.string(),
          }),
        )
        .optional()
        .default([
          {
            label: '选项1',
            value: 'value1',
            id: 'option1',
          },
        ]),
    })
    .optional(),
})
export type SingleQuestionSchemaType = z.infer<typeof SingleQuestionSchema>
