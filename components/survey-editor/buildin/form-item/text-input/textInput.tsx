import { TextCursorInput } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { InputQuestionScehma } from '@/lib/dsl'
export const meta: IFormItemMeta = {
  icon: TextCursorInput,
  title: '简单输入',
  type: 'input',
  //@ts-ignore
  schema: InputQuestionScehma,
}
