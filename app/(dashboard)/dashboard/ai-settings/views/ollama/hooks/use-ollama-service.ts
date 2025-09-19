import { useState, useCallback } from 'react'
import { trpc } from '@/app/_trpc/client'
import type { UseOllamaServiceReturn } from '../types/ollama.types'

export function useOllamaService(): UseOllamaServiceReturn {
	const [error, setError] = useState<string | null>(null)

	const {
		data: serviceInfo,
		isLoading,
		refetch,
		error: queryError,
	} = trpc.aiConfig.GetOllamaModels.useQuery()

	const handleRefetch = useCallback(async () => {
		setError(null)
		try {
			await refetch()
		} catch (err) {
			setError(err instanceof Error ? err.message : '获取服务信息失败')
		}
	}, [refetch])

	return {
		serviceInfo: serviceInfo || null,
		isLoading,
		error: error || queryError?.message || null,
		refetch: handleRefetch,
	}
}
