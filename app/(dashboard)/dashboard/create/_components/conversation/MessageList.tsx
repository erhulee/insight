'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bot, User } from 'lucide-react'
import { MessageListProps } from '../types/conversation'
import { SuggestionButtons } from './SuggestionButtons'

export function MessageList({
	messages,
	isLoading,
	onSuggestionClick,
	className = '',
}: MessageListProps & { className?: string }) {
	return (
		<div className={className}>
			{messages.map((message) => (
				<div
					key={message.id}
					className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
				>
					{message.type === 'ai' && (
						<Avatar className="h-8 w-8">
							<AvatarImage src="" />
							<AvatarFallback>
								<Bot className="h-4 w-4" />
							</AvatarFallback>
						</Avatar>
					)}
					<div
						className={`max-w-[80%] space-y-2 ${message.type === 'user' ? 'order-first' : ''}`}
					>
						<div
							className={`p-3 rounded-lg ${
								message.type === 'user'
									? 'bg-primary text-primary-foreground ml-auto'
									: 'bg-muted'
							}`}
						>
							<p className="text-sm">{message.content}</p>
						</div>
						{message.suggestions && message.type === 'ai' && (
							<SuggestionButtons
								suggestions={message.suggestions}
								onSuggestionClick={onSuggestionClick}
							/>
						)}
					</div>
					{message.type === 'user' && (
						<Avatar className="h-8 w-8">
							<AvatarImage src="" />
							<AvatarFallback>
								<User className="h-4 w-4" />
							</AvatarFallback>
						</Avatar>
					)}
				</div>
			))}
			{isLoading && (
				<div className="flex gap-3">
					<Avatar className="h-8 w-8">
						<AvatarFallback>
							<Bot className="h-4 w-4" />
						</AvatarFallback>
					</Avatar>
					<div className="bg-muted p-3 rounded-lg">
						<div className="flex items-center gap-2">
							<div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
							<span className="text-sm text-muted-foreground">
								AI正在思考...
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
