import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { AIConfigFormData, ServiceProvider } from '@/hooks/ai-config'

interface AIConfigFormProps {
	formData: AIConfigFormData
	serviceProviders: ServiceProvider[]
	onFormDataChange: (updates: Partial<AIConfigFormData>) => void
	getProviderInfo: (type: string) => ServiceProvider | undefined
}

export function AIConfigForm({
	formData,
	serviceProviders,
	onFormDataChange,
	getProviderInfo,
}: AIConfigFormProps) {
	const handleTypeChange = (value: string) => {
		const provider = getProviderInfo(value)
		onFormDataChange({
			type: value,
			baseUrl: provider?.baseUrl || '',
			model: provider?.models[0] || '',
		})
	}

	return (
		<div className="space-y-4">
			{/* 基本信息 */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="name">配置名称 *</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) => onFormDataChange({ name: e.target.value })}
						placeholder="例如: 我的OpenAI配置"
						required
					/>
				</div>
				<div>
					<Label htmlFor="type">服务类型 *</Label>
					<Select
						value={formData.type}
						onValueChange={handleTypeChange}
						required
					>
						<SelectTrigger>
							<SelectValue placeholder="选择服务类型" />
						</SelectTrigger>
						<SelectContent>
							{serviceProviders.map((provider) => (
								<SelectItem key={provider.type} value={provider.type}>
									{provider.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* 连接参数 */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="baseUrl">服务地址 *</Label>
					<Input
						id="baseUrl"
						value={formData.baseUrl}
						onChange={(e) => onFormDataChange({ baseUrl: e.target.value })}
						placeholder="https://api.openai.com/v1"
						required
					/>
				</div>
				<div>
					<Label htmlFor="apiKey">API密钥 *</Label>
					<Input
						id="apiKey"
						type="password"
						value={formData.apiKey}
						onChange={(e) => onFormDataChange({ apiKey: e.target.value })}
						placeholder="输入API密钥"
						required
					/>
				</div>
			</div>

			{/* 模型设置 */}
			<div>
				<Label htmlFor="model">模型名称 *</Label>
				<Select
					value={formData.model}
					onValueChange={(value) => onFormDataChange({ model: value })}
					required
				>
					<SelectTrigger>
						<SelectValue placeholder="选择模型" />
					</SelectTrigger>
					<SelectContent>
						{getProviderInfo(formData.type)?.models.map((model) => (
							<SelectItem key={model} value={model}>
								{model}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* 活跃配置开关 */}
			<div className="flex items-center space-x-2">
				<Switch
					id="isActive"
					checked={formData.isActive}
					onCheckedChange={(checked) => onFormDataChange({ isActive: checked })}
				/>
				<Label htmlFor="isActive">设为活跃配置</Label>
			</div>
		</div>
	)
}
