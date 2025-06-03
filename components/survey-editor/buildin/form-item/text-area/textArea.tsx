import { Fullscreen } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { TextareaQuestionSchema } from '@/lib/dsl'

export const meta: IFormItemMeta = {
  icon: Fullscreen,
  title: '多行输入框',
  type: 'textarea',
  //@ts-ignore
  schema: TextareaQuestionSchema,
}
