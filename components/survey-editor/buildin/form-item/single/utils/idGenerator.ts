/**
 * Generate a unique ID for question options
 * @returns A unique string ID
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `opt_${timestamp}_${random}`
}

/**
 * Generate a unique ID with a specific prefix
 * @param prefix - The prefix for the ID
 * @returns A unique string ID with the specified prefix
 */
export const generateUniqueIdWithPrefix = (prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Check if a string is a valid option ID
 * @param id - The ID to check
 * @returns True if the ID is valid
 */
export const isValidOptionId = (id: string): boolean => {
  return Boolean(id && id.length > 0 && !id.startsWith('option-'))
}

/**
 * Generate a fallback ID for backward compatibility
 * @param value - The option value
 * @param index - The option index
 * @returns A fallback ID
 */
export const generateFallbackId = (value: string, index: number): string => {
  if (value && value !== 'opt') {
    return `option-${index}-${value}`
  }
  return generateUniqueId()
} 