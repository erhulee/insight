/**
 * ID 生成器工具函数
 * 提供各种生成唯一标识符的方法
 */

/**
 * 生成选项的唯一 ID
 * 使用时间戳和随机字符串组合，确保唯一性
 * 
 * @returns 格式为 "opt_时间戳_随机字符串" 的唯一 ID
 * @example
 * generateUniqueId() // "opt_1703123456789_a1b2c3"
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `opt_${timestamp}_${random}`
}

/**
 * 生成带指定前缀的唯一 ID
 * 适用于需要特定前缀标识的场景
 * 
 * @param prefix - ID 的前缀字符串
 * @returns 格式为 "前缀_时间戳_随机字符串" 的唯一 ID
 * @example
 * generateUniqueIdWithPrefix('question') // "question_1703123456789_a1b2c3"
 */
export const generateUniqueIdWithPrefix = (prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * 验证选项 ID 是否有效
 * 检查 ID 是否存在、非空且不是旧格式
 * 
 * @param id - 要验证的 ID 字符串
 * @returns 如果 ID 有效返回 true，否则返回 false
 * @example
 * isValidOptionId('opt_1703123456789_a1b2c3') // true
 * isValidOptionId('option-1-value') // false (旧格式)
 * isValidOptionId('') // false (空字符串)
 */
export const isValidOptionId = (id: string): boolean => {
  return Boolean(id && id.length > 0 && !id.startsWith('option-'))
}

/**
 * 生成向后兼容的备用 ID
 * 当现有选项没有唯一 ID 时，生成兼容的 ID
 * 
 * @param value - 选项的值
 * @param index - 选项在列表中的索引
 * @returns 格式为 "option-索引-值" 的备用 ID，如果值无效则生成新的唯一 ID
 * @example
 * generateFallbackId('选项A', 0) // "option-0-选项A"
 * generateFallbackId('', 1) // "opt_1703123456789_a1b2c3" (新生成的唯一 ID)
 */
export const generateFallbackId = (value: string, index: number): string => {
  // 如果值存在且不是默认值，使用旧格式
  if (value && value !== 'opt') {
    return `option-${index}-${value}`
  }
  // 否则生成新的唯一 ID
  return generateUniqueId()
} 