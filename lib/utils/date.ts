/**
 * 日期工具函数
 */

/**
 * 格式化日期为中文格式
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string | Date): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

/**
 * 格式化日期为简短格式
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatShortDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
    })
}

/**
 * 格式化相对时间
 * @param dateString 日期字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
        return '今天'
    } else if (diffInDays === 1) {
        return '昨天'
    } else if (diffInDays < 7) {
        return `${diffInDays}天前`
    } else {
        return formatDate(dateString)
    }
} 