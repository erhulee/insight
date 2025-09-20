'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	History,
	MoreVertical,
	Edit,
	Copy,
	Trash2,
	Calendar,
	MessageCircle,
} from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ConversationHistoryProps {
	onSelectSession: (sessionId: string) => void
}

export function ConversationHistory({
	onSelectSession,
}: ConversationHistoryProps) {
	const [page, setPage] = useState(1)

	// 获取历史会话列表
	const {
		data: historyData,
		isLoading,
		refetch,
	} = trpc.conversationHistory.getUserHistory.useQuery({
		page,
		pageSize: 10,
		filters: {},
	})

	const deleteMutation =
		trpc.conversationHistory.deleteConversation.useMutation({
			onSuccess: () => {
				toast.success('会话已删除')
				refetch()
			},
			onError: (error) => {
				toast.error('删除失败: ' + error.message)
			},
		})

	// 复制会话
	const duplicateMutation =
		trpc.conversationHistory.duplicateConversation.useMutation({
			onSuccess: (newSession) => {
				toast.success('会话已复制')
				// onEditSession(newSession.sessionId)
				refetch()
			},
			onError: (error) => {
				toast.error('复制失败: ' + error.message)
			},
		})

	const handleDelete = (sessionId: string) => {
		if (confirm('确定要删除这个会话吗？此操作不可撤销。')) {
			deleteMutation.mutate({ sessionId })
		}
	}

	const handleDuplicate = (sessionId: string) => {
		duplicateMutation.mutate({ sessionId })
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

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>
						<span className=" text-xl">历史会话</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-sm text-gray-500">加载中...</div>
						</div>
					) : historyData?.sessions.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<History className="h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								暂无历史会话
							</h3>
							<p className="text-sm text-gray-500">
								开始创建您的第一个AI对话会话吧！
							</p>
						</div>
					) : (
						<ScrollArea className="h-96">
							<div className="space-y-4">
								{historyData?.sessions.map((session) => (
									<Card
										key={session.id}
										className="hover:shadow-md transition-shadow"
									>
										<CardContent className="p-4">
											<div className="flex items-start justify-between">
												<div className="flex-1 min-w-0">
													<p className="text-sm text-gray-600 mb-2">
														{session.description}
													</p>
													<div className="flex items-center space-x-4 text-xs text-gray-500">
														<span className="flex items-center space-x-1">
															<MessageCircle className="h-3 w-3" />
															<span>{session.messageCount} 条消息</span>
														</span>
														<span className="flex items-center space-x-1">
															<Calendar className="h-3 w-3" />
															<span>
																{formatDistanceToNow(session.updatedAt, {
																	addSuffix: true,
																	locale: zhCN,
																})}
															</span>
														</span>
													</div>
													<div className="mt-3">
														<div className="flex items-center justify-between text-sm mb-1">
															<span>{getPhaseLabel(session.phase)}</span>
															<span>{session.progress}%</span>
														</div>
														<Progress
															value={session.progress}
															className="h-2"
														/>
													</div>
												</div>
												<div className="flex items-center space-x-2 ml-4">
													<Button
														variant="outline"
														onClick={() => onSelectSession(session.sessionId)}
													>
														查看
													</Button>
													<Button size="icon" onClick={() => {}}>
														<Edit />
													</Button>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() =>
																	handleDuplicate(session.sessionId)
																}
															>
																<Copy className="h-4 w-4 mr-2" />
																复制会话
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleDelete(session.sessionId)}
																className="text-red-600"
															>
																<Trash2 className="h-4 w-4 mr-2" />
																删除会话
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</ScrollArea>
					)}
				</CardContent>
			</Card>

			{/* 分页 */}
			{historyData && historyData.hasMore && (
				<div className="flex justify-center">
					<Button
						variant="outline"
						onClick={() => setPage(page + 1)}
						disabled={isLoading}
					>
						加载更多
					</Button>
				</div>
			)}
		</div>
	)
}
