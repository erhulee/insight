import { z } from 'zod'

// 对话阶段枚举
export const ConversationPhase = z.enum([
	'initial',
	'details',
	'structure',
	'validation',
	'complete',
])

// 消息类型
export const MessageType = z.enum(['user', 'ai'])

// 消息 Schema
export const MessageSchema = z.object({
	id: z.string(),
	type: MessageType,
	content: z.string(),
	timestamp: z.date(),
	suggestions: z.array(z.string()).optional(),
})

// 收集信息 Schema
export const CollectedInfoSchema = z.object({
	purpose: z.string().optional(),
	targetAudience: z.string().optional(),
	questionTypes: z.array(z.string()).optional(),
	estimatedTime: z.string().optional(),
	topics: z.array(z.string()).optional(),
	requirements: z.array(z.string()).optional(),
})

// 对话状态 Schema
export const ConversationStateSchema = z.object({
	phase: ConversationPhase,
	progress: z.number().min(0).max(100),
	collectedInfo: CollectedInfoSchema,
})

// 对话会话 Schema
export const ConversationSessionSchema = z.object({
	id: z.string(),
	sessionId: z.string(),
	userId: z.string(),
	state: ConversationStateSchema,
	messages: z.array(MessageSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
})

// 创建会话请求
export const CreateSessionRequestSchema = z.object({
	userId: z.string().optional(),
})

// 发送消息请求
export const SendMessageRequestSchema = z.object({
	sessionId: z.string(),
	content: z.string(),
})

// 更新状态请求
export const UpdateStateRequestSchema = z.object({
	sessionId: z.string(),
	state: ConversationStateSchema,
})

// 获取会话请求
export const GetSessionRequestSchema = z.object({
	sessionId: z.string(),
})

// 重置会话请求
export const ResetSessionRequestSchema = z.object({
	sessionId: z.string(),
})

// 生成问卷请求
export const GenerateSurveyRequestSchema = z.object({
	sessionId: z.string(),
})

// API 输入 Schema
export const CreateSessionInput = CreateSessionRequestSchema
export const SendMessageInput = SendMessageRequestSchema
export const GetMessagesInput = z.object({
	sessionId: z.string(),
	limit: z.number().optional(),
	offset: z.number().optional(),
})
export const UpdateStateInput = z.object({
	sessionId: z.string(),
	phase: ConversationPhase,
	progress: z.number().min(0).max(100),
	collectedInfo: CollectedInfoSchema.partial().optional(),
})
export const CompleteConversationInput = z.object({
	sessionId: z.string(),
	finalPrompt: z.string().optional(),
})
export const ResetConversationInput = ResetSessionRequestSchema

// 类型导出
export type ConversationPhase = z.infer<typeof ConversationPhase>
export type MessageType = z.infer<typeof MessageType>
export type Message = z.infer<typeof MessageSchema>
export type CollectedInfo = z.infer<typeof CollectedInfoSchema>
export type ConversationState = z.infer<typeof ConversationStateSchema>
export type ConversationSession = z.infer<typeof ConversationSessionSchema>

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>
export type UpdateStateRequest = z.infer<typeof UpdateStateRequestSchema>
export type GetSessionRequest = z.infer<typeof GetSessionRequestSchema>
export type ResetSessionRequest = z.infer<typeof ResetSessionRequestSchema>
export type GenerateSurveyRequest = z.infer<typeof GenerateSurveyRequestSchema>

// API 输入类型
export type CreateSessionInput = z.infer<typeof CreateSessionInput>
export type SendMessageInput = z.infer<typeof SendMessageInput>
export type GetMessagesInput = z.infer<typeof GetMessagesInput>
export type UpdateStateInput = z.infer<typeof UpdateStateInput>
export type CompleteConversationInput = z.infer<
	typeof CompleteConversationInput
>
export type ResetConversationInput = z.infer<typeof ResetConversationInput>
