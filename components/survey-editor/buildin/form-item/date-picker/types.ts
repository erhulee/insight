/**
 * 日期选择器组件的类型定义
 */

import { DatePickerQuestionSchemaType } from "@/lib/dsl"

/**
 * 日期选择器的基础配置接口
 */
export interface DatePickerConfig {
    /** 是否必填 */
    required?: boolean
    /** 日期格式 */
    format?: string
    /** 最小日期 */
    minDate?: string
    /** 最大日期 */
    maxDate?: string
    /** 占位符文本 */
    placeholder?: string
    /** 是否显示时间选择 */
    showTime?: boolean
    /** 是否禁用 */
    disabled?: boolean
}

/**
 * 日期选择器主组件的属性接口
 */
export interface DatePickerProps {
    /** DSL 数据结构，包含日期选择器的完整配置 */
    dsl: DatePickerQuestionSchemaType // TODO: 应该使用 DatePickerSchemaType 类型
} 