import { CircleDot } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { SingleQuestionSchema } from '@/lib/dsl'

export const meta: IFormItemMeta = {
  icon: CircleDot,
  title: '单选题',
  type: 'single',
  //@ts-ignore
  schema: SingleQuestionSchema,
}
