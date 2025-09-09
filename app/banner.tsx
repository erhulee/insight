'use client'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutHeader } from '@/components/layout-header'
import { GlowEffect } from '@/components/ui/glow-effect'
import { AnimatedText } from '@/components/ui/animated-text'
export function Banner() {
	return (
		<AuroraBackground className=" h-[700px] px-8">
			<motion.div
				initial={{ opacity: 0.0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{
					delay: 0.1,
					duration: 0.8,
					ease: 'easeInOut',
				}}
				viewport={{ once: true }}
				className=" max-w-[1328px] relative flex flex-col gap-4 items-start justify-center 2xl:px-4 h-full w-full"
			>
				<div className=" max-w-[1328px] absolute top-0 w-full 2xl:py-8 py-1 ">
					<LayoutHeader hideBorder activeTab="dashboard"></LayoutHeader>
				</div>
				<AnimatedText
					text="创建专业问卷，收集有价值的数据"
					textClassName="text-3xl md:text-5xl dark:text-white text-left font-douyin"
					underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
					underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10"
					underlineClassName="text-foreground"
					underlineDuration={1.5}
				/>
				<p className="font-extralight text-base md:text-3xl dark:text-neutral-200 py-4">
					简单易用的问卷设计工具，强大的数据分析功能，帮助您获取洞察，做出更好的决策。
				</p>
				<div className=" flex flex-row gap-3">
					<Link href="/dashboard/create">
						<div className=" relative">
							<GlowEffect
								colors={['#008080', '#00A8E8', '#3EB489', '#8EE4AF']}
								mode="pulse"
								blur="soft"
								duration={3}
								scale={1.2}
								className=" z-0"
							/>
							<Button
								size="lg"
								className="relative inline-flex items-center gap-1"
							>
								创建问卷
							</Button>
						</div>
					</Link>

					<Link href="/dashboard">
						<Button
							size="lg"
							variant="outline"
							className="gap-1 text-foreground"
						>
							我的问卷
						</Button>
					</Link>
					<Link href="/templates">
						<Button size="lg" variant="outline" className="text-foreground">
							浏览模板
						</Button>
					</Link>
				</div>
			</motion.div>
		</AuroraBackground>
	)
}
