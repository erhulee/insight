import { CircleCheckBig } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { MultipleQuestionSchema } from '@/lib/dsl'

export const meta: IFormItemMeta = {
  icon: CircleCheckBig,
  title: '多选题',
  type: 'multiple',
  //@ts-ignore
  schema: MultipleQuestionSchema,
}
