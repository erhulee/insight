import React from 'react'
import { Button } from '@/components/ui/button'
import {
	ArrowRight,
	FileText,
	Clock,
	Users,
	Shield,
	MessageSquare,
} from 'lucide-react'
import type { Question } from '@/lib/api-types'

interface SurveyCoverProps {
	survey: {
		id: string
		name: string
		description?: string
		questions: Question[]
		// 新增封面配置字段
		estimatedTime?: string
		coverDescription?: string
		privacyNotice?: string
		bottomNotice?: string
		coverIcon?: string
		coverColor?: string
		showProgressInfo?: boolean
		showPrivacyNotice?: boolean
	}
	onStart: () => void
}

// 图标映射
const ICON_MAP = {
	'file-text': FileText,
	clock: Clock,
	shield: Shield,
	'message-square': MessageSquare,
}

// 颜色映射
const COLOR_MAP = {
	blue: 'bg-blue-500',
	green: 'bg-green-500',
	purple: 'bg-purple-500',
	orange: 'bg-orange-500',
	red: 'bg-red-500',
}

export function SurveyCover({ survey, onStart }: SurveyCoverProps) {
	// 获取图标组件
	const IconComponent =
		ICON_MAP[survey.coverIcon as keyof typeof ICON_MAP] || FileText

	// 获取颜色类名
	const colorClass =
		COLOR_MAP[survey.coverColor as keyof typeof COLOR_MAP] || 'bg-blue-500'

	// 默认值
	const estimatedTime = survey.estimatedTime || '3-5分钟'
	const coverDescription =
		survey.coverDescription ||
		'感谢您参与我们的用户体验调研，您的反馈对我们非常重要。通过填写这份问卷，您将帮助我们更好地理解用户需求，优化产品功能，提供更优质的服务体验。'
	const privacyNotice =
		survey.privacyNotice || '您的信息将被严格保密，仅用于产品改进'
	const bottomNotice =
		survey.bottomNotice || '本问卷由专业团队设计，感谢您的宝贵时间'
	const showProgressInfo = survey.showProgressInfo !== false
	const showPrivacyNotice = survey.showPrivacyNotice !== false

	return (
		<div className="min-h-screen bg-background">
			{/* 主要内容区域 */}
			<div className="px-6 pt-20 pb-8">
				{/* 问卷图标 */}
				<div className="text-center mb-8">
					<div
						className={`w-20 h-20 ${colorClass} rounded-2xl flex items-center justify-center mx-auto mb-6`}
					>
						<IconComponent className="h-10 w-10 text-white" />
					</div>
				</div>

				{/* 问卷标题 */}
				<div className="text-center mb-6">
					<h1 className="text-2xl font-semibold text-foreground mb-3">
						{survey.name}
					</h1>
					{survey.description && (
						<p className="text-base text-muted-foreground leading-relaxed">
							{survey.description}
						</p>
					)}
				</div>

				{/* 问卷描述 */}
				<div className="bg-muted rounded-lg p-4 mb-8">
					<p className="text-muted-foreground text-center leading-relaxed text-sm">
						{coverDescription}
					</p>
				</div>

				{/* 问卷信息卡片 - 根据配置显示 */}
				{showProgressInfo && (
					<div className="grid grid-cols-2 gap-3 mb-8">
						<div className="bg-muted rounded-lg p-4 text-center">
							<Clock className="h-5 w-5 text-blue-500 mx-auto mb-2" />
							<p className="text-xs text-muted-foreground">预计用时</p>
							<p className="text-base font-medium text-foreground">
								{estimatedTime}
							</p>
						</div>
						<div className="bg-muted rounded-lg p-4 text-center">
							<Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
							<p className="text-xs text-muted-foreground">问题数量</p>
							<p className="text-base font-medium text-foreground">
								{survey.questions.length}个问题
							</p>
						</div>
					</div>
				)}

				{/* 开始答题按钮 */}
				<div className="mb-8">
					<Button
						size="lg"
						onClick={onStart}
						className={`w-full h-12 text-base font-medium ${colorClass} hover:opacity-90 border-0`}
					>
						开始填写问卷
						<ArrowRight className="h-4 w-4 ml-2" />
					</Button>
				</div>

				{/* 隐私保护说明 - 根据配置显示 */}
				{showPrivacyNotice && (
					<div className="bg-muted rounded-lg p-4 mb-6">
						<div className="flex items-center justify-center space-x-2 text-muted-foreground">
							<Shield className="h-4 w-4 text-green-500" />
							<span className="text-sm">{privacyNotice}</span>
						</div>
					</div>
				)}

				{/* 底部信息 */}
				<div className="text-center">
					<div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mb-3">
						<span>匿名填写</span>
						<span>•</span>
						<span>随时可退出</span>
						<span>•</span>
						<span>数据安全</span>
					</div>
					<p className="text-xs text-gray-400">{bottomNotice}</p>
				</div>
			</div>
		</div>
	)
}
