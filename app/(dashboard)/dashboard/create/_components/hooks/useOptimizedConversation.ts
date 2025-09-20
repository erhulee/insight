'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Message, ConversationState } from '../types/conversation'
import { createInitialConversationState } from '../utils/conversation-utils'
import { trpc } from '@/app/_trpc/client'
import { toast } from 'sonner'

/**
 * 优化的对话Hook - 清晰分离conversation和ai-conversation的职责
 */
export function useOptimizedConversation() {
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [inputValue, setInputValue] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Conversation Router - 会话状态管理
	const createSessionMutation = trpc.conversation.createSession.useMutation()
	const getSessionQuery = trpc.conversation.getSession.useQuery(
		{ sessionId: sessionId! },
		{ enabled: !!sessionId },
	)
	const resetSessionMutation = trpc.conversation.resetConversation.useMutation()

	// 派生状态 - 从 useQuery 数据中获取
	const messages: Message[] =
		getSessionQuery.data?.messages?.map((msg: any) => ({
			...msg,
			timestamp: new Date(msg.timestamp),
		})) || []

	const conversationState: ConversationState =
		getSessionQuery.data?.state || createInitialConversationState()

	// AI Conversation Router - AI服务交互
	const aiChatMutation = trpc.aiConversation.chat.useMutation()
	const aiGenerateSurveyMutation =
		trpc.aiConversation.generateSurvey.useMutation()
	const aiServiceStatusQuery = trpc.aiConversation.getServiceStatus.useQuery(
		undefined,
		{
			enabled: false, // 暂时禁用，避免不必要的查询
		},
	)

	// 自动滚动到底部
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	// 初始化会话
	const initializeSession = async () => {
		if (sessionId) return
		try {
			const session = await createSessionMutation.mutateAsync({})
			setSessionId(session.id)
			// 数据会自动通过 useQuery 更新，无需手动设置本地状态
		} catch (error) {
			console.error('创建会话失败:', error)
			toast.error('创建会话失败')
		}
	}

	// 发送消息 - 使用AI Conversation Router
	const sendMessage = async (content: string) => {
		if (!content.trim()) return

		setIsLoading(true)
		try {
			// 如果没有会话ID，先创建会话
			let session_id = sessionId
			if (!sessionId) {
				const session = await createSessionMutation.mutateAsync({})
				setSessionId(session.id)
				session_id = session.id
			}
			console.log('sessionId:', session_id)
			// 清空输入框
			setInputValue('')

			// 调用AI对话API - 服务端会自动处理状态更新和历史消息
			await aiChatMutation.mutateAsync({
				sessionId: session_id!,
				message: content,
			})

			// 数据会自动通过 useQuery 更新，无需手动设置本地状态
		} catch (error) {
			console.error('发送消息失败:', error)
			toast.error('发送消息失败')
		} finally {
			setIsLoading(false)
		}
	}

	// 处理建议点击
	const handleSuggestionClick = useCallback((suggestion: string) => {
		sendMessage(suggestion)
	}, [])

	// 稳定的输入变化处理函数
	const handleInputChange = useCallback((value: string) => {
		setInputValue(value)
	}, [])

	// 重置对话
	const resetConversation = async () => {
		if (!sessionId) return
		try {
			await resetSessionMutation.mutateAsync({
				sessionId,
			})
			setInputValue('')
			// 数据会自动通过 useQuery 更新，无需手动设置本地状态
		} catch (error) {
			console.error('重置会话失败:', error)
			toast.error('重置会话失败')
		}
	}

	// 基于AI对话生成问卷
	const generateAISurvey = async (prompt?: string) => {
		if (!sessionId) {
			toast.error('会话不存在')
			return null
		}
		try {
			const response = await aiGenerateSurveyMutation.mutateAsync({
				sessionId,
				prompt: prompt || '基于当前对话生成问卷',
			})
			return response
		} catch (error) {
			console.error('AI生成问卷失败:', error)
			toast.error('AI生成问卷失败')
			return null
		}
	}

	// 加载指定会话
	const loadSession = (targetSessionId: string) => {
		// 更新会话ID，这会自动触发查询
		setSessionId(targetSessionId)
		// 数据会自动通过 useQuery 更新，无需等待
		toast.info('正在加载会话...')
	}

	// 不再在组件挂载时自动创建会话，只在用户发送消息时创建

	// 不再需要监听查询结果，因为数据直接从 useQuery 派生

	return {
		// 基础状态
		sessionId,
		messages,
		conversationState,
		inputValue,
		onInputChange: handleInputChange,
		messagesEndRef,

		// 加载状态
		isLoading:
			isLoading || createSessionMutation.isPending || aiChatMutation.isPending,
		isGeneratingSurvey: aiGenerateSurveyMutation.isPending,
		isAIServiceLoading: aiServiceStatusQuery.isLoading,

		// 功能方法
		sendMessage,
		handleSuggestionClick,
		resetConversation,
		generateAISurvey,
		loadSession,

		// AI服务状态
		aiServiceStatus: aiServiceStatusQuery.data,

		// 错误状态
		hasError: createSessionMutation.isError || aiChatMutation.isError,
		error: createSessionMutation.error || aiChatMutation.error,
	}
}
