'use client'

import { Button } from '@/components/ui/button'
import { SuggestionButtonsProps } from '../types/conversation'

export function SuggestionButtons({
	suggestions,
	onSuggestionClick,
}: SuggestionButtonsProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{suggestions.map((suggestion, index) => (
				<Button
					key={index}
					variant="outline"
					size="sm"
					onClick={() => onSuggestionClick(suggestion)}
					className="text-xs"
				>
					{suggestion}
				</Button>
			))}
		</div>
	)
}
