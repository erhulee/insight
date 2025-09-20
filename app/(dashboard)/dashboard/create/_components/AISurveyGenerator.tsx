'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
	FileText,
	MessageCircle,
	Sparkles,
	ArrowRight,
	History,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/app/_trpc/client'

// 组件导入
import { ConversationPanel, ConversationState } from './conversation'
import { TraditionalMode, SurveyPreview } from './traditional'

// 类型和 Hook 导入
import { GeneratedSurvey } from './types/conversation'
import { useOptimizedConversation } from './hooks/useOptimizedConversation'
import { ConversationHistory } from './history/ConversationHistory'

export function AISurveyGenerator() {
	// 模式状态
	const [mode, setMode] = useState<'traditional' | 'conversation' | 'history'>(
		'conversation',
	)

	// 传统模式状态
	const [prompt, setPrompt] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [generatedSurvey, setGeneratedSurvey] =
		useState<GeneratedSurvey | null>(null)

	// 对话模式状态
	const {
		sessionId,
		messages,
		conversationState,
		isLoading,
		inputValue,
		onInputChange,
		messagesEndRef,
		sendMessage,
		handleSuggestionClick,
		resetConversation,
		generateAISurvey,
		loadSession,
		aiServiceStatus,
		isAIServiceLoading,
		isGeneratingSurvey,
	} = useOptimizedConversation()

	// tRPC mutations
	const createMutation = trpc.surver.CreateSurvey.useMutation()
	const generateAISurveyMutation = trpc.GenerateAISurvey.useMutation()
	const generateConversationSurveyMutation =
		trpc.aiConversation.generateSurvey.useMutation()

	// 传统模式 - 生成问卷
	const handleGenerateSurvey = async () => {
		if (!prompt.trim()) {
			toast.error('请输入问卷描述')
			return
		}

		setIsGenerating(true)
		try {
			const result = await generateAISurveyMutation.mutateAsync({
				prompt: prompt.trim(),
			})

			if (result && result.title && result.questions) {
				setGeneratedSurvey(result as GeneratedSurvey)
				toast.success('问卷生成成功！')
			}
		} catch (error) {
			toast.error('生成失败，请重试')
			console.error('AI生成问卷失败:', error)
		} finally {
			setIsGenerating(false)
		}
	}

	// 传统模式 - 创建问卷
	const handleCreateSurvey = async () => {
		if (!generatedSurvey) return
		try {
			const survey = await createMutation.mutateAsync({
				name: generatedSurvey.title,
				description: generatedSurvey.description,
				questions: generatedSurvey.questions,
			})

			if (survey) {
				toast.success('问卷创建成功！')
				window.location.href = `/dashboard/edit/${survey.id}`
			}
		} catch (error) {
			toast.error('创建失败')
			console.error('创建问卷失败:', error)
		}
	}

	// 对话模式 - 生成问卷
	const handleGenerateConversationSurvey = async () => {
		if (!sessionId) {
			toast.error('会话不存在')
			return
		}
		setIsGenerating(true)
		try {
			const result = await generateAISurvey()

			if (result && result.survey) {
				setGeneratedSurvey({
					title: result.survey.title,
					description: result.survey.description || '',
					questions: result.survey.questions || [],
				})
				toast.success('基于AI对话生成问卷成功！')
			}
		} catch (error) {
			toast.error('生成失败，请重试')
			console.error('基于AI对话生成问卷失败:', error)
		} finally {
			setIsGenerating(false)
		}
	}

	// 编辑历史会话
	const handleEditSession = (targetSessionId: string) => {
		// 切换到对话模式
		setMode('conversation')

		// 加载指定会话的数据
		loadSession(targetSessionId)
	}

	return (
		<div className="w-full space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-6 w-6 text-primary" />
						AI 问卷生成器
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs
						value={mode}
						onValueChange={(value) =>
							setMode(value as 'traditional' | 'conversation' | 'history')
						}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger
								value="traditional"
								className="flex items-center gap-2"
							>
								<FileText className="h-4 w-4" />
								传统模式
							</TabsTrigger>
							<TabsTrigger
								value="conversation"
								className="flex items-center gap-2"
							>
								<MessageCircle className="h-4 w-4" />
								对话模式
							</TabsTrigger>
						</TabsList>

						<TabsContent value="traditional" className="space-y-4">
							<TraditionalMode
								prompt={prompt}
								onPromptChange={setPrompt}
								onGenerate={handleGenerateSurvey}
								isGenerating={isGenerating}
							/>
						</TabsContent>

						<TabsContent value="conversation" className="space-y-4">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* 对话区域 */}
								<div className="lg:col-span-2 space-y-4">
									<ConversationPanel
										sessionId={sessionId}
										messages={messages}
										isLoading={isLoading}
										onSendMessage={sendMessage}
										onSuggestionClick={handleSuggestionClick}
										onReset={resetConversation}
										inputValue={inputValue}
										onInputChange={onInputChange}
									/>
								</div>

								{/* 状态面板 */}
								<div className="space-y-4">
									<ConversationHistory
										onSelectSession={handleEditSession}
									></ConversationHistory>
									<ConversationState
										state={conversationState}
										collectedInfo={conversationState.collectedInfo}
									/>
									{conversationState.phase === 'complete' && (
										<Card>
											<CardContent className="pt-6">
												<Button
													className="w-full"
													size="lg"
													onClick={handleGenerateConversationSurvey}
													disabled={
														isGenerating ||
														generateConversationSurveyMutation.isPending
													}
												>
													<ArrowRight className="h-4 w-4 mr-2" />
													{isGenerating ||
													generateConversationSurveyMutation.isPending
														? '生成中...'
														: '生成问卷'}
												</Button>
											</CardContent>
										</Card>
									)}
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* 生成结果预览 */}
			{generatedSurvey && (
				<SurveyPreview
					survey={generatedSurvey}
					onRegenerate={() => setGeneratedSurvey(null)}
					onCreate={handleCreateSurvey}
					isCreating={createMutation.isPending}
				/>
			)}
		</div>
	)
}
