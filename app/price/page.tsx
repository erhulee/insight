import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Shield, Users, BarChart3, Heart } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { LayoutHeader } from '@/components/layout-header'

export default function Pricing() {
	const GITHUB_URL = process.env.GITHUB_URL!
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			<div className="mx-auto max-w-7xl px-6 pt-12 pb-16">
				<div className="max-w-[1328px] w-full  py-1 z-10">
					<LayoutHeader hideBorder activeTab="price" />
				</div>
				<div className="mx-auto text-left my-16 ">
					<h1 className="text-6xl tracking-tight mb-6 font-douyin">
						为您的业务
						<span className="text-primary"> 量身定制 </span>
						的价格方案
					</h1>
					<p className="text-xl text-muted-foreground mb-8 leading-relaxed">
						选择最适合您需求的方案，开启高效工作流程，让数据驱动决策
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid lg:grid-cols-3 gap-8 mb-16">
					{/* Free SaaS Plan */}
					<Card className="relative border shadow-lg hover:shadow-xl transition-shadow">
						<CardContent className="p-8">
							<div className="text-center">
								<Badge variant="outline" className="mb-4">
									SaaS
								</Badge>
								<h3 className="text-2xl font-bold mb-2">免费版</h3>
								<p className="text-muted-foreground mb-6">
									适合个人用户和小团队入门使用
								</p>

								{/* Pricing */}
								<div className="mb-8">
									<div className="flex items-baseline justify-center">
										<span className="text-4xl font-bold">¥0</span>
									</div>
									<p className="text-sm text-muted-foreground mt-2">
										永久免费使用
									</p>
								</div>

								{/* Features */}
								<ul className="space-y-3 mb-8 text-left">
									{[
										'最多 3 个问卷',
										'每月 100 次回复',
										'基础模板库',
										'邮件支持',
										'基础数据分析',
									].map((feature, index) => (
										<li key={index} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-primary" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>

								<Button disabled className="w-full">
									<Link href="">敬请期待</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Docker Open Source Plan */}
					<Card className="relative border-2 border-primary shadow-2xl scale-105">
						<CardContent className="p-8">
							<div className="text-center">
								<Badge variant="secondary" className="mb-4">
									<Heart className="h-3 w-3 mr-1" />
									开源
								</Badge>
								<h3 className="text-2xl font-bold mb-2">Docker 版</h3>
								<p className="text-muted-foreground mb-6">
									完全开源，可私有化部署
								</p>

								{/* Pricing */}
								<div className="mb-8">
									<div className="flex items-baseline justify-center">
										<span className="text-4xl font-bold">¥0</span>
									</div>
									<p className="text-sm text-muted-foreground mt-2">
										开源免费，自主部署
									</p>
								</div>

								{/* Features */}
								<ul className="space-y-3 mb-8 text-left">
									{[
										'完整源代码',
										'Docker 一键部署',
										'无功能限制',
										'社区支持',
										'可自定义开发',
										'数据完全自主',
										'无网络依赖',
										'企业级安全',
									].map((feature, index) => (
										<li key={index} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-primary" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>

								<Button asChild variant="outline" className="w-full">
									<Link href={GITHUB_URL} target="_blank">
										查看源码
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
					{/* Enterprise SaaS Plan */}
					<Card className="relative border shadow-lg hover:shadow-xl transition-shadow ">
						<CardContent className="p-8">
							<div className="text-center">
								<Badge variant="outline" className="mb-4">
									SaaS
								</Badge>
								<h3 className="text-2xl font-bold mb-2">企业版</h3>
								<p className="text-muted-foreground mb-6">
									适合任何规模的公司，提供完整的调查解决方案
								</p>

								{/* Pricing */}
								<div className="mb-8">
									<div className="flex items-baseline justify-center">
										<span className="text-4xl font-bold text-primary">
											¥299
										</span>
										<span className="text-lg text-muted-foreground ml-1">
											/月
										</span>
									</div>
									<p className="text-sm text-muted-foreground mt-2">
										按年付费享受 20% 折扣
									</p>
								</div>

								{/* Features */}
								<ul className="space-y-3 mb-8 text-left">
									{[
										'无限问卷创建',
										'无限制回复',
										'高级安全保护',
										'实时数据分析',
										'团队协作功能',
										'自定义品牌',
										'API 访问',
										'优先支持',
									].map((feature, index) => (
										<li key={index} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-primary" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>

								<Button className="w-full" size="lg" disabled={true}>
									<Link href="">敬请期待</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						需要定制方案？
						<Link href="/contact" className="text-primary hover:underline">
							联系我们
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
