import { z } from 'zod'

const QuestionType = z.enum([
  // 单选题
  'single',
  'multiple',
  'text',
  'rating',
  'date',
  'number',
])
const QuestionSchema = z.object({
  id: z.string(),
})
