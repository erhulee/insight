/**
 * 日期选择器组件模块
 * 提供日期选择、时间选择、日期验证等功能
 */

// 主组件导出
export { DatePicker } from './render'


// 类型定义导出
export type {
    DatePickerConfig,
    DatePickerProps,
} from './types'

// 工具函数导出
export {
    formatDate,
    parseDate,
    isValidDateRange,
    getCurrentDate,
    getPlaceholderText,
    isValidDate,
    DEFAULT_DATE_FORMAT,
    DEFAULT_DATETIME_FORMAT,
} from './utils/dateUtils' 