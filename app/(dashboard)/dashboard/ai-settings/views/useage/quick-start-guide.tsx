import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GuideStep {
	step: number
	title: string
	description: string
}

const guideSteps: GuideStep[] = [
	{
		step: 1,
		title: '选择AI服务提供商',
		description:
			'根据您的需求和预算选择合适的AI服务提供商。如果是首次使用，建议从Ollama开始。',
	},
	{
		step: 2,
		title: '配置连接参数',
		description:
			'填写服务地址、API密钥（如需要）、选择模型等必要信息。可以调整高级参数来优化生成效果。',
	},
	{
		step: 3,
		title: '测试连接',
		description:
			'使用"测试连接"功能验证配置是否正确。确保能够正常连接到AI服务。',
	},
	{
		step: 4,
		title: '设为活跃配置',
		description:
			'将测试通过的配置设为活跃状态。系统将使用此配置进行AI问卷生成。',
	},
]

export function QuickStartGuide() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>快速开始指南</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{guideSteps.map((step) => (
						<div key={step.step} className="flex items-start gap-3">
							<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
								{step.step}
							</div>
							<div>
								<h4 className="font-medium">{step.title}</h4>
								<p className="text-sm text-muted-foreground">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
