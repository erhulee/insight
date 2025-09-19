'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectionStatusCard } from './index'
import { useConnectStatus } from './hooks/use-connect-status'
import type { TestResult } from '@/hooks/ai-config'

export function ConnectStatusPage() {
	const router = useRouter()
	const connectStatus = useConnectStatus()
	const [isTesting, setIsTesting] = useState(false)
	const [testResult, setTestResult] = useState<TestResult | null>(null)

	const handleTestConnection = async () => {
		setIsTesting(true)
		setTestResult(null)

		try {
			// 这里应该调用实际的测试连接API
			// 暂时使用模拟数据
			await new Promise((resolve) => setTimeout(resolve, 2000))

			// setTestResult({
			// 	success: true,
			// 	responseTime: 150,
			// })
		} catch (error) {
			setTestResult({
				success: false,
				error: error instanceof Error ? error.message : '连接失败',
			})
		} finally {
			setIsTesting(false)
		}
	}

	const handleManageModels = () => {
		// 跳转到Ollama管理页面
		router.push('/dashboard/ai-settings?tab=ollama')
	}

	const handleSetActiveModel = async (
		modelName: string,
		modelSize?: number,
	) => {
		try {
			await connectStatus.setActiveModelMutation.mutateAsync({
				modelName,
				modelSize,
			})
		} catch (error) {
			console.error('设置活跃模型失败:', error)
		}
	}

	const handleClearActiveModel = async () => {
		try {
			await connectStatus.clearActiveModelMutation.mutateAsync()
		} catch (error) {
			console.error('清除活跃模型失败:', error)
		}
	}

	return (
		<div className="space-y-6">
			<div className="text-left space-y-2">
				<h2 className="text-2xl font-bold">连接状态</h2>
				<p className="text-muted-foreground">
					查看当前AI服务配置状态和活跃模型信息
				</p>
			</div>

			<ConnectionStatusCard
				activeConfig={connectStatus.activeAIConfig}
				activeModel={connectStatus.activeModel}
				mergedConfig={connectStatus.mergedConfig}
				ollamaStatus={connectStatus.ollamaStatus}
				isTesting={isTesting}
				testResult={testResult}
				isLoading={connectStatus.isLoading}
				error={connectStatus.error || null}
				onTestConnection={handleTestConnection}
				onManageModels={handleManageModels}
				onSetActiveModel={handleSetActiveModel}
				onClearActiveModel={handleClearActiveModel}
			/>
		</div>
	)
}
