import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { aiServiceManager } from '@/lib/ai-service-manager'
import { getActiveAIConfig } from '@/lib/ai-service-config'
import type { AIServiceConfig } from '@/lib/ai-service-config'

export interface TestResult {
	success: boolean
	error?: string
}

export function useAISettings() {
	const [activeConfig, setActiveConfig] = useState<AIServiceConfig | null>(null)
	const [isTesting, setIsTesting] = useState(false)
	const [testResult, setTestResult] = useState<TestResult | null>(null)

	useEffect(() => {
		loadActiveConfig()
	}, [])

	const loadActiveConfig = () => {
		const config = getActiveAIConfig()
		setActiveConfig(config)
	}

	const handleTestConnection = async () => {
		if (!activeConfig) {
			toast.error('没有可用的AI服务配置')
			return
		}

		setIsTesting(true)
		setTestResult(null)

		try {
			const result = await aiServiceManager.testConnection(activeConfig)
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
		loadActiveConfig()
	}

	return {
		activeConfig,
		isTesting,
		testResult,
		handleTestConnection,
		handleConfigChange,
	}
}
