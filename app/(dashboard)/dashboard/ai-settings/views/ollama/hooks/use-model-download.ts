import { useState, useCallback } from 'react'
import { trpc } from '@/app/_trpc/client'
import type {
	PullProgress,
	UseModelDownloadReturn,
} from '../types/ollama.types'

export function useModelDownload(): UseModelDownloadReturn {
	const [isDownloading, setIsDownloading] = useState(false)
	const [progress, setProgress] = useState<PullProgress | null>(null)

	const pullModelMutation = trpc.aiConfig.PullOllamaModel.useMutation()

	const downloadModel = useCallback(
		async (modelName: string) => {
			setIsDownloading(true)
			setProgress({
				status: 'downloading',
				progress: 0,
				message: '开始下载...',
			})

			try {
				// 使用带进度的下载方法
				await pullModelMutation.mutateAsync({ modelName })

				setProgress({
					status: 'completed',
					progress: 100,
					message: '下载完成',
				})
			} catch (error) {
				setProgress({
					status: 'error',
					progress: 0,
					message: error instanceof Error ? error.message : '下载失败',
				})
			} finally {
				setIsDownloading(false)
			}
		},
		[pullModelMutation],
	)

	const cancelDownload = useCallback(() => {
		setIsDownloading(false)
		setProgress(null)
	}, [])

	return {
		isDownloading,
		progress,
		downloadModel,
		cancelDownload,
	}
}
