import { CircleDot } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { QuestionSchema } from '@/lib/dsl'
import { z } from 'zod'

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


/**
 * 单选题组件的元数据配置
 * 定义组件的图标、标题、类型和数据结构
 */
export const meta: IFormItemMeta<typeof SingleQuestionSchema> = {
  /** 组件图标 */
  icon: CircleDot,
  /** 组件显示标题 */
  title: '单选题',
  /** 组件类型标识 */
  type: 'single',
  /** 组件数据结构定义 */
  schema: SingleQuestionSchema,
}
