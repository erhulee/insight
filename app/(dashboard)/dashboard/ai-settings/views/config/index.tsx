'use client'

import { useAIConfigManager } from '@/hooks/ai-config'
import { AIConfigDialog, AIConfigList } from '../../components/ai-config'

interface AIServiceConfigManagerProps {
	onConfigChange?: () => void
}

export function AIServiceConfigManager({
	onConfigChange,
}: AIServiceConfigManagerProps) {
	const {
		// State
		isDialogOpen,
		editingConfig,
		isTesting,
		testResult,
		formData,
		configs,
		serviceProviders,
		isLoading,
		isCreating,
		isUpdating,

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
	} = useAIConfigManager(onConfigChange)

	return (
		<div className="space-y-6">
			<AIConfigList
				configs={configs}
				serviceProviders={serviceProviders}
				isLoading={isLoading}
				isTesting={isTesting}
				onCreateConfig={handleCreateConfig}
				onEditConfig={handleEditConfig}
				onDeleteConfig={handleDeleteConfig}
				onSetActive={handleSetActive}
				onTestConnection={handleTestConnection}
				getProviderInfo={getProviderInfo}
			/>

			<AIConfigDialog
				isOpen={isDialogOpen}
				editingConfig={editingConfig}
				formData={formData}
				serviceProviders={serviceProviders}
				testResult={testResult}
				isCreating={isCreating}
				isUpdating={isUpdating}
				onFormDataChange={updateFormData}
				onSaveConfig={handleSaveConfig}
				onCloseDialog={closeDialog}
				getProviderInfo={getProviderInfo}
			/>
		</div>
	)
}
