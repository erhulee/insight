export interface GeneratedSurvey {
	title: string
	description: string
	questions: any[]
}

export interface Message {
	id: string
	type: 'user' | 'ai'
	content: string
	timestamp: Date
	suggestions?: string[]
}

export interface ConversationState {
	phase: 'initial' | 'details' | 'structure' | 'validation' | 'complete'
	progress: number
	collectedInfo: {
		purpose?: string
		targetAudience?: string
		questionTypes?: string[]
		estimatedTime?: string
		topics?: string[]
		requirements?: string[]
	}
}

export type ConversationPhase =
	| 'initial' // 初始阶段 - 了解基本需求
	| 'details' // 详细阶段 - 深入询问细节
	| 'structure' // 结构阶段 - 确定问卷结构
	| 'validation' // 验证阶段 - 确认需求
	| 'complete' // 完成阶段 - 生成问卷

export interface ConversationPanelProps {
	messages: Message[]
	isLoading: boolean
	onSendMessage: (content: string) => void
	onSuggestionClick: (suggestion: string) => void
	onReset: () => void
}

export interface ConversationStateProps {
	state: ConversationState
	collectedInfo: ConversationState['collectedInfo']
}

export interface MessageListProps {
	messages: Message[]
	isLoading: boolean
	onSuggestionClick: (suggestion: string) => void
}

export interface MessageInputProps {
	value: string
	onChange: (value: string) => void
	onSend: (content: string) => void
	disabled: boolean
}

export interface ProgressIndicatorProps {
	phase: ConversationPhase
	progress: number
}

export interface SuggestionButtonsProps {
	suggestions: string[]
	onSuggestionClick: (suggestion: string) => void
}
