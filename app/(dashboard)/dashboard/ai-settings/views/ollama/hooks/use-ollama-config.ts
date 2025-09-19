import { useCallback } from 'react'
import { trpc } from '@/app/_trpc/client'
import type { OllamaConfig, UseOllamaConfigReturn } from '../types/ollama.types'

export function useOllamaConfig(): UseOllamaConfigReturn {
	const autoConfigMutation = trpc.aiConfig.AutoConfigureOllama.useMutation()

	const autoConfigure = useCallback(async (): Promise<OllamaConfig> => {
		try {
			const config = await autoConfigMutation.mutateAsync()
			return config
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : '自动配置失败')
		}
	}, [autoConfigMutation])

	return {
		autoConfigure,
	}
}
