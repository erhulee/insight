'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
	MessageCircle,
	RotateCcw,
	Sparkles,
	FileText,
	Users,
	Settings,
} from 'lucide-react'
import { ConversationPanelProps } from '../types/conversation'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ConversationPanelWithInputProps extends ConversationPanelProps {
	inputValue: string
	sessionId: string | null
	onInputChange: (value: string) => void
}

export function ConversationPanel({
	messages,
	isLoading,
	onSendMessage,
	onSuggestionClick,
	onReset,
	inputValue,
	onInputChange,
	sessionId,
}: ConversationPanelWithInputProps) {
	const isEmpty = !Boolean(sessionId)
	return (
		<Card className="h-[800px] flex flex-col">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MessageCircle className="h-5 w-5 text-primary" />
						<span className="font-medium">智能对话</span>
					</div>
					<Button variant="outline" size="sm" onClick={onReset}>
						<RotateCcw className="h-4 w-4 mr-1" />
						重新开始
					</Button>
				</div>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col">
				{isEmpty ? (
					// 空态界面 - 居中布局
					<div className="flex-1 flex flex-col items-center justify-center space-y-12 px-4">
						{/* 欢迎信息 */}
						<div className="text-center space-y-3">
							<div className="text-3xl font-semibold text-foreground">
								下午好，开始创建您的问卷吧！
							</div>
							<div className="text-lg text-gray-500 max-w-md">
								告诉我您想要创建什么样的问卷，我会帮您一步步完善
							</div>
						</div>

						{/* 输入框区域 */}
						<div className="w-full max-w-3xl">
							<MessageInput
								value={inputValue}
								onChange={onInputChange}
								onSend={onSendMessage}
								disabled={isLoading}
								placeholder="发消息或输入 / 选择技能"
								className="text-center"
							/>
						</div>
					</div>
				) : (
					// 有消息时的正常布局
					<>
						<ScrollArea className="flex-1 pr-4">
							<MessageList
								messages={messages}
								isLoading={isLoading}
								onSuggestionClick={onSuggestionClick}
							/>
						</ScrollArea>
						<Separator className="my-4" />
						<MessageInput
							value={inputValue}
							onChange={onInputChange}
							onSend={onSendMessage}
							disabled={isLoading}
						/>
					</>
				)}
			</CardContent>
		</Card>
	)
}
