import { Share2, Sparkles, Gamepad2, Video, Code } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const openForms = [
	{ icon: Share2, title: 'REST API', description: '标准化资源模型，易于集成' },
	{ icon: Sparkles, title: 'tRPC', description: '端到端类型安全，前后端同构' },
	{
		icon: Gamepad2,
		title: 'Webhooks',
		description: '提交、发布等事件实时回调',
	},
	{
		icon: Video,
		title: 'OpenAPI 自渲染',
		description: '根据规范自动生成问卷 UI',
	},
	{
		icon: Code,
		title: '多语言 SDK',
		description: 'JS/TS/Python/PHP 示例与封装',
	},
]

export function PromotionalOpenForms() {
	return (
		<section className="py-20 bg-background">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
						多种开放形态 助力快速接入问卷能力
					</h2>
				</div>

				<div className="grid md:grid-cols-5 gap-8">
					{openForms.map((form, index) => (
						<Card
							key={index}
							className="text-center hover:shadow-lg transition-shadow cursor-pointer group"
						>
							<CardContent className="p-8">
								<div className="mb-6">
									<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
										<form.icon className="h-8 w-8 text-blue-600" />
									</div>
								</div>
								<h3 className="font-semibold text-foreground mb-2">
									{form.title}
								</h3>
								<p className="text-sm text-muted-foreground">
									{form.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				<div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
					<div className="relative">
						<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
							<div className="bg-card rounded-xl shadow-lg p-4 max-w-sm mx-auto">
								<div className="space-y-4">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										9:41
										<div className="ml-auto flex gap-1">
											<div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
											<div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
										</div>
									</div>
									<div className="bg-gray-100 rounded-lg p-3">
										<div className="text-xs text-gray-500 mb-2">
											搜索你感兴趣的内容和用户
										</div>
										<div className="flex gap-2 text-xs">
											<span className="bg-card px-2 py-1 rounded">关注</span>
											<span className="bg-card px-2 py-1 rounded">推荐</span>
											<span className="bg-blue-600 text-white px-2 py-1 rounded">
												直播
											</span>
										</div>
									</div>
									<div className="flex gap-2">
										{[1, 2, 3, 4, 5].map((i) => (
											<div
												key={i}
												className="w-10 h-10 bg-gray-200 rounded-full"
											></div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-12 text-white">
						<div className="space-y-6">
							<h3 className="text-2xl font-bold">开发者工具包</h3>
							<p className="text-blue-100 leading-relaxed">
								提供完整的 SDK 和 API 接口，覆盖问卷创建、发布、收集、导出
								全链路。支持移动端渲染和服务端能力调用。
							</p>
							<div className="flex gap-4">
								<div className="bg-primary/5 rounded-lg p-4 flex-1">
									<div className="text-sm text-blue-100">API 调用</div>
									<div className="text-xl font-bold">1M+</div>
								</div>
								<div className="bg-primary/5 rounded-lg p-4 flex-1">
									<div className="text-sm text-blue-100">开发者</div>
									<div className="text-xl font-bold">50K+</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
