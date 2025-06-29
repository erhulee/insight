/**
 * 日期处理工具函数
 * 提供日期格式化、验证、转换等功能
 */

/**
 * 默认日期格式
 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD'

/**
 * 默认日期时间格式
 */
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * 格式化日期为指定格式的字符串
 * 
 * @param date - 日期对象或日期字符串
 * @param format - 目标格式，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // "2024-01-15"
 * formatDate('2024-01-15T10:30:00', 'YYYY年MM月DD日') // "2024年01月15日"
 */
export const formatDate = (date: Date | string | undefined, format: string = DEFAULT_DATE_FORMAT): string => {
    if (!date) return ''

    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
        return ''
    }

    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

/**
 * 解析日期字符串为 Date 对象
 * 
 * @param dateString - 日期字符串
 * @param format - 日期格式，用于解析
 * @returns Date 对象，解析失败返回 null
 * @example
 * parseDate('2024-01-15', 'YYYY-MM-DD') // Date object
 * parseDate('2024/01/15', 'YYYY/MM/DD') // Date object
 */
export const parseDate = (dateString: string, format: string = DEFAULT_DATE_FORMAT): Date | null => {
    if (!dateString) return null

    try {
        // 简单的日期解析，支持常见格式
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
            return date
        }

        // 如果标准解析失败，尝试根据格式解析
        const formatRegex = format
            .replace('YYYY', '(\\d{4})')
            .replace('MM', '(\\d{1,2})')
            .replace('DD', '(\\d{1,2})')
            .replace('HH', '(\\d{1,2})')
            .replace('mm', '(\\d{1,2})')
            .replace('ss', '(\\d{1,2})')

        const match = dateString.match(new RegExp(formatRegex))
        if (match) {
            const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = match
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            )
        }

        return null
    } catch (error) {
        console.warn('日期解析失败:', dateString, error)
        return null
    }
}

/**
 * 验证日期是否在指定范围内
 * 
 * @param date - 要验证的日期
 * @param minDate - 最小日期（可选）
 * @param maxDate - 最大日期（可选）
 * @returns 如果日期在范围内返回 true，否则返回 false
 * @example
 * isValidDateRange('2024-01-15', '2024-01-01', '2024-12-31') // true
 * isValidDateRange('2023-12-31', '2024-01-01', '2024-12-31') // false
 */
export const isValidDateRange = (
    date: string | Date,
    minDate?: string | Date,
    maxDate?: string | Date
): boolean => {
    const dateObj = typeof date === 'string' ? parseDate(date) : date
    if (!dateObj) return false

    const minDateObj = minDate ? (typeof minDate === 'string' ? parseDate(minDate) : minDate) : null
    const maxDateObj = maxDate ? (typeof maxDate === 'string' ? parseDate(maxDate) : maxDate) : null

    if (minDateObj && dateObj < minDateObj) return false
    if (maxDateObj && dateObj > maxDateObj) return false

    return true
}

/**
 * 获取当前日期字符串
 * 
 * @param format - 日期格式，默认为 'YYYY-MM-DD'
 * @returns 当前日期的格式化字符串
 * @example
 * getCurrentDate() // "2024-01-15"
 * getCurrentDate('YYYY年MM月DD日') // "2024年01月15日"
 */
export const getCurrentDate = (format: string = DEFAULT_DATE_FORMAT): string => {
    return formatDate(new Date(), format)
}

/**
 * 获取日期选择器的占位符文本
 * 
 * @param showTime - 是否显示时间选择
 * @param format - 自定义格式
 * @returns 占位符文本
 * @example
 * getPlaceholderText(false) // "请选择日期"
 * getPlaceholderText(true) // "请选择日期和时间"
 */
export const getPlaceholderText = (showTime: boolean = false, format?: string): string => {
    if (format) {
        return `请按照 ${format} 格式选择日期`
    }
    return showTime ? '请选择日期和时间' : '请选择日期'
}

/**
 * 验证日期字符串是否有效
 * 
 * @param dateString - 日期字符串
 * @returns 如果日期有效返回 true，否则返回 false
 * @example
 * isValidDate('2024-01-15') // true
 * isValidDate('2024-13-45') // false
 */
export const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false

    const date = new Date(dateString)
    return !isNaN(date.getTime())
} 