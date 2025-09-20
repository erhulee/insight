'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { MessageInputProps } from '../types/conversation'

interface ExtendedMessageInputProps extends MessageInputProps {
	placeholder?: string
	className?: string
}

export function MessageInput({
	value,
	onChange,
	onSend,
	disabled,
	placeholder = '输入你的回答或问题...',
	className = '',
}: ExtendedMessageInputProps) {
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !disabled) {
			onSend(value)
		}
	}

	const handleSend = () => {
		if (!disabled && value.trim()) {
			onSend(value)
		}
	}

	return (
		<div className={`flex gap-2 ${className}`}>
			<Input
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyUp={handleKeyPress}
				disabled={disabled}
				className="flex-1"
			/>
			<Button onClick={handleSend} disabled={disabled || !value.trim()}>
				<Send className="h-4 w-4" />
			</Button>
		</div>
	)
}
