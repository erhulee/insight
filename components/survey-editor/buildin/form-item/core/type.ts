import { QuestionSchema } from '@/lib/dsl/index'

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

export interface IFormItemMeta<T = typeof QuestionSchema> {
  icon: React.PropsWithChildren<React.FC<{ className: string }>>

  /**
   * 题型名称
   */
  title: string
  /**
   * 题型key
   */
  type: string
  schema: T
}

export const DEFAULT_ID = 'servery_default-id'
