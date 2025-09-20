'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	MessageCircle,
	User,
	Bot,
	Calendar,
	Clock,
	CheckCircle,
	XCircle,
	ArrowLeft,
	Edit,
	Copy,
} from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ConversationDetailsProps {
	sessionId: string | null
	onClose: () => void
	onEdit: (sessionId: string) => void
}

export function ConversationDetails({
	sessionId,
	onClose,
	onEdit,
}: ConversationDetailsProps) {
	const [isOpen, setIsOpen] = useState(false)

	// 获取会话详情
	const {
		data: sessionDetails,
		isLoading,
		error,
	} = trpc.conversationHistory.getConversationDetails.useQuery(
		{ sessionId: sessionId! },
		{ enabled: !!sessionId },
	)

	// 获取会话消息
	const { data: messages } = trpc.conversation.getMessages.useQuery(
		{ sessionId: sessionId!, limit: 1000 },
		{ enabled: !!sessionId },
	)

	useEffect(() => {
		setIsOpen(!!sessionId)
	}, [sessionId])

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active':
				return <Clock className="h-4 w-4 text-blue-500" />
			case 'completed':
				return <CheckCircle className="h-4 w-4 text-green-500" />
			case 'abandoned':
				return <XCircle className="h-4 w-4 text-gray-500" />
			default:
				return <Clock className="h-4 w-4 text-gray-500" />
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'active':
				return '进行中'
			case 'completed':
				return '已完成'
			case 'abandoned':
				return '已放弃'
			default:
				return '未知'
		}
	}

	const getPhaseLabel = (phase: string) => {
		const phaseMap: Record<string, string> = {
			initial: '确定目的',
			details: '分析受众',
			structure: '设计结构',
			validation: '验证需求',
			complete: '生成完成',
		}
		return phaseMap[phase] || phase
	}

	const formatCollectedInfo = (collectedInfo: any) => {
		const items = []
		if (collectedInfo.purpose) items.push(`目的：${collectedInfo.purpose}`)
		if (collectedInfo.targetAudience)
			items.push(`受众：${collectedInfo.targetAudience}`)
		if (collectedInfo.questionTypes?.length) {
			items.push(`题型：${collectedInfo.questionTypes.join('、')}`)
		}
		if (collectedInfo.estimatedTime)
			items.push(`预计用时：${collectedInfo.estimatedTime}`)
		if (collectedInfo.topics?.length) {
			items.push(`主题：${collectedInfo.topics.join('、')}`)
		}
		if (collectedInfo.requirements?.length) {
			items.push(`要求：${collectedInfo.requirements.join('、')}`)
		}
		return items
	}

	if (!sessionId) return null

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[80vh]">
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-2">
						<MessageCircle className="h-5 w-5" />
						<span>会话详情</span>
					</DialogTitle>
					<DialogDescription>查看会话的详细信息和对话历史</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-gray-500">加载中...</div>
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-red-500">
							加载失败: {error.message}
						</div>
					</div>
				) : !sessionDetails ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-sm text-gray-500">会话不存在</div>
					</div>
				) : (
					<div className="space-y-6">
						{/* 会话基本信息 */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										{getStatusIcon(sessionDetails.status)}
										<CardTitle className="text-lg">
											{sessionDetails.title}
										</CardTitle>
										<Badge variant="outline">
											{getStatusLabel(sessionDetails.status)}
										</Badge>
									</div>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(sessionDetails.sessionId)}
										>
											<Edit className="h-4 w-4 mr-1" />
											编辑
										</Button>
										<Button variant="outline" size="sm" onClick={onClose}>
											<ArrowLeft className="h-4 w-4 mr-1" />
											返回
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-gray-600">
									{sessionDetails.description}
								</p>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="font-medium">创建时间：</span>
										<span className="text-gray-600">
											{formatDistanceToNow(sessionDetails.createdAt, {
												addSuffix: true,
												locale: zhCN,
											})}
										</span>
									</div>
									<div>
										<span className="font-medium">更新时间：</span>
										<span className="text-gray-600">
											{formatDistanceToNow(sessionDetails.updatedAt, {
												addSuffix: true,
												locale: zhCN,
											})}
										</span>
									</div>
									<div>
										<span className="font-medium">消息数量：</span>
										<span className="text-gray-600">
											{sessionDetails.messageCount} 条
										</span>
									</div>
									<div>
										<span className="font-medium">当前阶段：</span>
										<span className="text-gray-600">
											{getPhaseLabel(sessionDetails.phase)}
										</span>
									</div>
								</div>

								<div>
									<div className="flex items-center justify-between text-sm mb-1">
										<span>进度</span>
										<span>{sessionDetails.progress}%</span>
									</div>
									<Progress value={sessionDetails.progress} className="h-2" />
								</div>
							</CardContent>
						</Card>

						{/* 收集到的信息 */}
						{Object.keys(sessionDetails.collectedInfo || {}).length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">收集到的信息</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{formatCollectedInfo(sessionDetails.collectedInfo).map(
											(item, index) => (
												<div key={index} className="text-sm text-gray-600">
													{item}
												</div>
											),
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* 对话历史 */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">对话历史</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className="h-64">
									<div className="space-y-4">
										{messages?.map((message) => (
											<div
												key={message.id}
												className={`flex ${
													message.type === 'user'
														? 'justify-end'
														: 'justify-start'
												}`}
											>
												<div
													className={`max-w-[80%] rounded-lg p-3 ${
														message.type === 'user'
															? 'bg-blue-500 text-white'
															: 'bg-gray-100 text-gray-900'
													}`}
												>
													<div className="flex items-start space-x-2">
														{message.type === 'user' ? (
															<User className="h-4 w-4 mt-0.5 flex-shrink-0" />
														) : (
															<Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
														)}
														<div className="flex-1">
															<p className="text-sm">{message.content}</p>
															{message.suggestions &&
																message.suggestions.length > 0 && (
																	<div className="mt-2 flex flex-wrap gap-1">
																		{message.suggestions.map(
																			(suggestion, index) => (
																				<Badge
																					key={index}
																					variant="secondary"
																					className="text-xs"
																				>
																					{suggestion}
																				</Badge>
																			),
																		)}
																	</div>
																)}
														</div>
													</div>
													<div className="text-xs opacity-70 mt-1">
														{formatDistanceToNow(message.timestamp, {
															addSuffix: true,
															locale: zhCN,
														})}
													</div>
												</div>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
