import { FormItemConfigSetter } from './IFormItemConfig'
import { QuestionType } from './QuestionType'

export interface IFormItemAttr {
  /**
   * 题型属性名称
   */
  name: string
  /**
   * 题型属性值类型
   */
  propType: 'String' | 'Number' | 'Boolean' | 'Object' | 'Array' | 'Enum'
  defaultValue: any
  description: string
}

export interface IFormItemMeta {
  icon: React.PropsWithChildren<React.FC<{ className: string }>>
  /**
   * 题型名称
   */
  title: string
  /**
   * 题型key
   */
  type: QuestionType
  /**
   * 	题型属性信息
   */
  attrs: Array<IFormItemAttr>
  /**
   * 对应题型属性的配置表单渲染配置
   */
  config: Array<FormItemConfigSetter>
}

export interface IFormToolKit {
  icon: React.PropsWithChildren<React.FC<{ className: string }>>
  meta: IFormItemMeta
}
