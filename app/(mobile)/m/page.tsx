'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'

export default function MobileHomePage() {
	return (
		<div className="min-h-screen bg-background">
			{/* 主要内容区域 */}
			<div className="px-6 pt-20 pb-8">
				{/* 图标 */}
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
						<FileText className="h-10 w-10 text-white" />
					</div>
				</div>

				{/* 标题 */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-semibold text-foreground mb-3">
						问卷系统
					</h1>
					<p className="text-base text-muted-foreground">
						点击下方按钮开始填写问卷
					</p>
				</div>

				{/* 开始按钮 */}
				<div className="mb-8">
					<Link href="/m/survey/1" className="block">
						<Button
							size="lg"
							className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600 border-0"
						>
							开始填写问卷
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</Link>
				</div>

				{/* 底部信息 */}
				<div className="text-center">
					<p className="text-xs text-gray-400">感谢您的参与</p>
				</div>
			</div>
		</div>
	)
}
