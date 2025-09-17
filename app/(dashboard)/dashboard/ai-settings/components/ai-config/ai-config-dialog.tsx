import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import {
	AIConfigFormData,
	ServiceProvider,
	TestResult,
} from '@/hooks/ai-config'
import { AIConfigForm } from './ai-config-form'

interface AIConfigDialogProps {
	isOpen: boolean
	editingConfig: any
	formData: AIConfigFormData
	serviceProviders: ServiceProvider[]
	testResult: TestResult | null
	isCreating: boolean
	isUpdating: boolean
	onFormDataChange: (updates: Partial<AIConfigFormData>) => void
	onSaveConfig: () => void
	onCloseDialog: () => void
	getProviderInfo: (type: string) => ServiceProvider | undefined
}

export function AIConfigDialog({
	isOpen,
	editingConfig,
	formData,
	serviceProviders,
	testResult,
	isCreating,
	isUpdating,
	onFormDataChange,
	onSaveConfig,
	onCloseDialog,
	getProviderInfo,
}: AIConfigDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onCloseDialog}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{editingConfig ? '编辑配置' : '创建新配置'}</DialogTitle>
					<DialogDescription>
						配置AI服务提供商的连接参数和模型设置
					</DialogDescription>
				</DialogHeader>

				<AIConfigForm
					formData={formData}
					serviceProviders={serviceProviders}
					onFormDataChange={onFormDataChange}
					getProviderInfo={getProviderInfo}
				/>

				{/* 测试结果 */}
				{testResult && (
					<Alert variant={testResult.success ? 'default' : 'destructive'}>
						{testResult.success ? (
							<CheckCircle className="h-4 w-4" />
						) : (
							<XCircle className="h-4 w-4" />
						)}
						<AlertDescription>
							{testResult.success
								? '连接测试成功'
								: `连接测试失败: ${testResult.error}`}
						</AlertDescription>
					</Alert>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onCloseDialog}>
						取消
					</Button>
					<Button onClick={onSaveConfig} disabled={isCreating || isUpdating}>
						{(isCreating || isUpdating) && (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						)}
						{editingConfig ? '更新配置' : '创建配置'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
