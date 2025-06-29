import { Calendar } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { DatePickerQuestionSchema } from '@/lib/dsl'

/**
 * 日期选择器组件的元数据配置
 * 定义组件的图标、标题、类型和数据结构
 */
export const meta: IFormItemMeta = {
    /** 组件图标 */
    icon: Calendar,
    /** 组件显示标题 */
    title: '日期选择',
    /** 组件类型标识 */
    type: 'date',
    /** 组件数据结构定义 */
    // @ts-ignore - 暂时忽略类型检查，后续需要完善类型定义
    schema: DatePickerQuestionSchema, // TODO: 需要定义 DatePickerSchema 类型
} 