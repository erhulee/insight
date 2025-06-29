import { CircleDot } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { SingleQuestionSchema } from '@/lib/dsl'

/**
 * 单选题组件的元数据配置
 * 定义组件的图标、标题、类型和数据结构
 */
export const meta: IFormItemMeta = {
  /** 组件图标 */
  icon: CircleDot,
  /** 组件显示标题 */
  title: '单选题',
  /** 组件类型标识 */
  type: 'single',
  /** 组件数据结构定义 */
  // @ts-ignore - 暂时忽略类型检查，后续需要完善类型定义
  schema: SingleQuestionSchema,
}
