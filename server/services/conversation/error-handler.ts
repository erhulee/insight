export interface ConversationError {
	type: 'RATE_LIMIT' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'AI_ERROR' | 'UNKNOWN'
	message: string
	retryAfter?: number
	details?: any
}

export class ConversationErrorHandler {
	static handleAIError(error: Error, context: any): ConversationError {
		if (error.message.includes('rate limit')) {
			return {
				type: 'RATE_LIMIT',
				message: 'AI 服务请求过于频繁，请稍后重试',
				retryAfter: 60,
				details: { error: error.message, context },
			}
		}

		if (error.message.includes('timeout')) {
			return {
				type: 'TIMEOUT',
				message: 'AI 服务响应超时，请重试',
				retryAfter: 30,
				details: { error: error.message, context },
			}
		}

		if (error.message.includes('invalid response')) {
			return {
				type: 'INVALID_RESPONSE',
				message: 'AI 响应格式错误，请重试',
				retryAfter: 0,
				details: { error: error.message, context },
			}
		}

		if (error.message.includes('AI') || error.message.includes('model')) {
			return {
				type: 'AI_ERROR',
				message: 'AI 服务暂时不可用，请稍后重试',
				retryAfter: 60,
				details: { error: error.message, context },
			}
		}

		return {
			type: 'UNKNOWN',
			message: '服务暂时不可用，请稍后重试',
			retryAfter: 60,
			details: { error: error.message, context },
		}
	}

	static async retryWithBackoff<T>(
		operation: () => Promise<T>,
		maxRetries: number = 3,
		baseDelay: number = 1000,
	): Promise<T> {
		let lastError: Error

		for (let i = 0; i < maxRetries; i++) {
			try {
				return await operation()
			} catch (error) {
				lastError = error as Error

				if (i === maxRetries - 1) {
					throw lastError
				}

				const delay = baseDelay * Math.pow(2, i)
				await new Promise((resolve) => setTimeout(resolve, delay))
			}
		}

		throw lastError!
	}

	static handleValidationError(error: any): ConversationError {
		return {
			type: 'INVALID_RESPONSE',
			message: '输入验证失败',
			retryAfter: 0,
			details: { error: error.message },
		}
	}

	static handleDatabaseError(error: any): ConversationError {
		return {
			type: 'UNKNOWN',
			message: '数据库操作失败，请重试',
			retryAfter: 30,
			details: { error: error.message },
		}
	}

	static handleCacheError(error: any): ConversationError {
		return {
			type: 'UNKNOWN',
			message: '缓存服务暂时不可用',
			retryAfter: 10,
			details: { error: error.message },
		}
	}
}

