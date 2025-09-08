import { useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'

export interface TestResult {
	success: boolean
	error?: string
}

export function useAISettings() {
	const [isTesting, setIsTesting] = useState(false)
	const [testResult, setTestResult] = useState<TestResult | null>(null)

	// 使用 TRPC 查询获取活跃配置
	const {
		data: activeConfig,
		refetch: refetchActiveConfig,
		isLoading: isLoadingConfig,
	} = trpc.aiConfig.getActiveConfig.useQuery()

	// 使用 TRPC 查询获取所有配置
	const {
		data: configs,
		refetch: refetchConfigs,
		isLoading: isLoadingConfigs,
	} = trpc.aiConfig.getConfigs.useQuery()

	// 测试连接 mutation
	const testConnectionMutation = trpc.aiConfig.testConnection.useMutation()

	const handleTestConnection = async () => {
		if (!activeConfig) {
			toast.error('没有可用的AI服务配置')
			return
		}

		setIsTesting(true)
		setTestResult(null)

		try {
			const result = await testConnectionMutation.mutateAsync({
				id: activeConfig.id,
			})

			setTestResult(result)

			if (result.success) {
				toast.success('连接测试成功！')
			} else {
				toast.error(`连接测试失败: ${result.error}`)
			}
		} catch (error) {
			setTestResult({ success: false, error: '测试失败' })
			toast.error('连接测试失败')
		} finally {
			setIsTesting(false)
		}
	}

	const handleConfigChange = () => {
		refetchActiveConfig()
		refetchConfigs()
	}

	return {
		activeConfig,
		configs: configs || [],
		isTesting,
		testResult,
		isLoadingConfig,
		isLoadingConfigs,
		handleTestConnection,
		handleConfigChange,
		refetchActiveConfig,
		refetchConfigs,
	}
}
