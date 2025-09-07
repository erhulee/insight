import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'

interface ServiceInfo {
	name: string
	description: string
	recommendedModels: string
	requirements?: string
}

const services: ServiceInfo[] = [
	{
		name: 'OpenAI',
		description:
			'官方API服务，支持GPT-4、GPT-3.5等模型。需要API密钥，按使用量计费。',
		recommendedModels: 'gpt-4, gpt-3.5-turbo',
	},
	{
		name: 'Ollama',
		description: '本地大模型服务，支持多种开源模型。免费使用，需要本地部署。',
		recommendedModels: 'qwen2.5:7b, llama3.1:8b',
	},
	{
		name: 'Anthropic',
		description:
			'Claude API服务，支持Claude-3等模型。需要API密钥，按使用量计费。',
		recommendedModels: 'claude-3-sonnet, claude-3-haiku',
	},
	{
		name: '自定义服务',
		description: '支持自定义AI服务配置。适用于私有部署的AI服务。',
		recommendedModels: '',
		requirements: '兼容OpenAI API格式',
	},
]

export function SupportedServicesCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Info className="h-5 w-5" />
					支持的AI服务
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{services.map((service) => (
						<div key={service.name} className="space-y-2">
							<h4 className="font-medium">{service.name}</h4>
							<p className="text-sm text-muted-foreground">
								{service.description}
							</p>
							{service.recommendedModels && (
								<div className="text-xs text-muted-foreground">
									<strong>推荐模型:</strong> {service.recommendedModels}
								</div>
							)}
							{service.requirements && (
								<div className="text-xs text-muted-foreground">
									<strong>要求:</strong> {service.requirements}
								</div>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
