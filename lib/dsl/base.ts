import { z } from 'zod'

const QuestionType = z.enum([
  // 文本输入框
  'input',
  // 多行文本输入框
  'textarea',
  // 单选题
  'single',
  'multiple',
  'rating',
  // 时间选择器
  'date',
  'number',
])

const LogicRule = z.array(
  z.object({
    condition: z.object({
      questionId: z.string(),
      answer: z
        .object({
          equal: z.string().or(z.array(z.string())).optional(),
          notEqual: z.string().or(z.array(z.string())).optional(),
          contains: z.string().optional(),
          empty: z.boolean().optional(),
        })
        .optional(),
    }),
    action: z.object({
      type: z.enum(['hide', 'show', 'jumpTo']),
      targetQuestionId: z.string().optional(),
    }),
  }),
)

// const validation = z.object({
//   type: z.enum(['min', 'max', 'range', 'pattern']),
//   value: z.number().or(z.string()).or(z.array(z.string())).or(z.array(z.number())),
//   message: z.string(),
// })

export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionType,
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  props: z.record(z.any()),
  logic: LogicRule.optional(),
  pageSize: z.number().optional().default(1),
})

export type QuestionSchemaType = z.infer<typeof QuestionSchema>
