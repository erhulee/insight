import { useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'

export interface AIConfigFormData {
	name: string
	type: string
	baseUrl: string
	apiKey: string
	model: string
	repeatPenalty: number
	isActive: boolean
}

export interface TestResult {
	success: boolean
	error?: string
}

export interface AIConfig {
	id: string
	name: string
	type: string
	baseUrl: string
	model: string
	repeatPenalty: number
	isActive: boolean
}

export interface ServiceProvider {
	type: string
	name: string
	baseUrl: string
	models: string[]
}

export function useAIConfigManager(onConfigChange?: () => void) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null)
	const [isTesting, setIsTesting] = useState(false)
	const [testResult, setTestResult] = useState<TestResult | null>(null)
	const [formData, setFormData] = useState<AIConfigFormData>({
		name: '',
		type: '',
		baseUrl: '',
		apiKey: '',
		model: '',
		repeatPenalty: 1.1,
		isActive: false,
	})

	// TRPC queries
	const {
		data: configs = [],
		isLoading,
		refetch: refetchConfigs,
	} = trpc.aiConfig.getConfigs.useQuery()

	const { data: serviceProviders = [], isLoading: isLoadingServiceProviders } =
		trpc.aiConfig.getAIServiceProviders.useQuery()

	// TRPC mutations
	const createConfigMutation = trpc.aiConfig.createConfig.useMutation()
	const updateConfigMutation = trpc.aiConfig.updateConfig.useMutation()
	const deleteConfigMutation = trpc.aiConfig.deleteConfig.useMutation()
	const setActiveConfigMutation = trpc.aiConfig.setActiveConfig.useMutation()
	const testConnectionMutation = trpc.aiConfig.testConnection.useMutation()

	// Form validation
	const validateForm = (): { isValid: boolean; errors: string[] } => {
		const errors: string[] = []

		if (!formData.name.trim()) {
			errors.push('配置名称不能为空')
		}

		if (!formData.type) {
			errors.push('请选择服务类型')
		}

		if (!formData.baseUrl.trim()) {
			errors.push('服务地址不能为空')
		}

		if (!formData.apiKey.trim()) {
			errors.push('API密钥不能为空')
		}

		if (!formData.model) {
			errors.push('请选择模型')
		}

		// URL validation
		if (formData.baseUrl.trim()) {
			try {
				new URL(formData.baseUrl)
			} catch {
				errors.push('请输入有效的服务地址')
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		}
	}

	// Actions
	const handleCreateConfig = () => {
		setEditingConfig(null)
		setFormData({
			name: '',
			type: '',
			baseUrl: '',
			apiKey: '',
			model: '',
			repeatPenalty: 1.1,
			isActive: false,
		})
		setIsDialogOpen(true)
	}

	const handleEditConfig = (config: AIConfig) => {
		setEditingConfig(config)
		setFormData({
			name: config.name,
			type: config.type,
			baseUrl: config.baseUrl,
			apiKey: '', // 不显示真实API密钥
			model: config.model,
			repeatPenalty: config.repeatPenalty || 1.1,
			isActive: config.isActive,
		})
		setIsDialogOpen(true)
	}

	const handleDeleteConfig = async (configId: string) => {
		if (configs.length <= 1) {
			toast.error('至少需要保留一个配置')
			return
		}

		try {
			await deleteConfigMutation.mutateAsync({ id: configId })
			refetchConfigs()
			onConfigChange?.()
			toast.success('配置删除成功')
		} catch (error) {
			toast.error('删除配置失败')
		}
	}

	const handleSetActive = async (configId: string) => {
		try {
			await setActiveConfigMutation.mutateAsync({ id: configId })
			refetchConfigs()
			onConfigChange?.()
			toast.success('活跃配置已更新')
		} catch (error) {
			toast.error('设置活跃配置失败')
		}
	}

	const handleTestConnection = async (config: AIConfig) => {
		setIsTesting(true)
		setTestResult(null)

		try {
			const result = await testConnectionMutation.mutateAsync({ id: config.id })
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

	const handleSaveConfig = async () => {
		const validation = validateForm()

		if (!validation.isValid) {
			validation.errors.forEach((error) => {
				toast.error(error)
			})
			return
		}

		try {
			if (editingConfig) {
				// 更新配置
				await updateConfigMutation.mutateAsync({
					id: editingConfig.id,
					...formData,
				})
				toast.success('配置更新成功')
			} else {
				// 创建新配置
				await createConfigMutation.mutateAsync(formData)
				toast.success('配置创建成功')
			}

			setIsDialogOpen(false)
			refetchConfigs()
			onConfigChange?.()
		} catch (error) {
			toast.error(editingConfig ? '更新配置失败' : '创建配置失败')
		}
	}

	const getProviderInfo = (type: string): ServiceProvider | undefined => {
		return serviceProviders.find((p) => p.type === type)
	}

	const updateFormData = (updates: Partial<AIConfigFormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }))
	}

	const closeDialog = () => {
		setIsDialogOpen(false)
		setTestResult(null)
	}

	return {
		// State
		isDialogOpen,
		editingConfig,
		isTesting,
		testResult,
		formData,
		configs,
		serviceProviders,
		isLoading,
		isLoadingServiceProviders,

		// Mutations state
		isCreating: createConfigMutation.isPending,
		isUpdating: updateConfigMutation.isPending,

		// Actions
		handleCreateConfig,
		handleEditConfig,
		handleDeleteConfig,
		handleSetActive,
		handleTestConnection,
		handleSaveConfig,
		getProviderInfo,
		updateFormData,
		closeDialog,
		validateForm,
	}
}
