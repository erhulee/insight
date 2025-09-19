import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FAQItem {
	question: string
	answer: string
}

const faqItems: FAQItem[] = [
	{
		question: 'Q: 如何获取OpenAI API密钥？',
		answer: 'A: 访问 OpenAI平台，注册账号并创建API密钥。',
		link: 'https://platform.openai.com/api-keys',
		linkText: 'OpenAI平台',
	},
	{
		question: 'Q: Ollama服务如何安装和启动？',
		answer: 'A: 访问 ollama.ai 下载安装包，安装后运行 ollama serve 启动服务。',
		link: 'https://ollama.ai',
		linkText: 'ollama.ai',
		code: 'ollama serve',
	},
	{
		question: 'Q: 可以同时使用多个AI服务吗？',
		answer:
			'A: 可以配置多个AI服务，但同一时间只能使用一个活跃配置。您可以根据需要随时切换活跃配置。',
	},
	{
		question: 'Q: 如何优化AI生成效果？',
		answer:
			'A: 调整Temperature（控制随机性）、Top P（控制多样性）等参数。对于问卷生成，建议Temperature设置为0.7-0.8。',
	},
]

export function FAQCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>常见问题</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					{faqItems.map((item, index) => (
						<div key={index}>
							<h4 className="font-medium">{item.question}</h4>
							<p className="text-sm text-muted-foreground">
								{item.answer
									.split(item.linkText || '')
									.map((part, partIndex) => (
										<span key={partIndex}>
											{part}
											{item.link && partIndex === 0 && (
												<a
													href={item.link}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline"
												>
													{item.linkText}
												</a>
											)}
										</span>
									))}
								{item.code && (
									<code className="bg-muted px-1 rounded ml-1">
										{item.code}
									</code>
								)}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
