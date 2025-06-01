import { CircleDot } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { QuestionType } from '../core/QuestionType'
import { FormItemConfigSetterType } from '../core/IFormItemConfig'

export const meta: IFormItemMeta = {
  icon: CircleDot,
  title: '单选题',
  type: QuestionType.Radio,
  attrs: [
    {
      name: 'field',
      propType: 'String',
      description: '这是用于描述题目id',
      defaultValue: '',
    },
    {
      name: 'title',
      propType: 'String',
      description: '这是用于描述题目标题',
      defaultValue: '标题一',
    },
    {
      name: 'options',
      propType: 'Array',
      description: '',
      defaultValue: ['选项1', '选项2', '选项3'],
    },
  ],
  config: [
    {
      name: 'title',
      title: '问题名称',
      type: FormItemConfigSetterType.Input,
    },
    {
      name: 'field',
      title: '表单字段',
      type: FormItemConfigSetterType.Input,
      placeholder: '可以直接使用随机ID',
    },
    {
      name: 'options',
      title: '选项配置',
      type: FormItemConfigSetterType.Option,
    },
  ],
}
