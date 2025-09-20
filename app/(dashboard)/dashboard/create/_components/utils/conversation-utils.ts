import {
	Message,
	ConversationState,
	ConversationPhase,
} from '../types/conversation'

/**
 * 生成 AI 响应 (Mock 数据)
 */
export const generateAIResponse = (
	userInput: string,
	state: ConversationState,
): Message => {
	const responses = {
		initial: {
			content:
				'很好！我了解了问卷的目的。现在请告诉我，这份问卷的目标受众是谁？这将帮助我设计更合适的问题。',
			suggestions: [
				'18-25岁年轻人',
				'企业客户',
				'内部员工',
				'学生群体',
				'专业人士',
			],
		},
		details: {
			content:
				'明白了目标受众。接下来，你希望问卷包含哪些类型的问题？我可以为你推荐最适合的问题形式。',
			suggestions: ['单选题', '多选题', '评分题', '开放式问题', '排序题'],
		},
		structure: {
			content:
				'很好的选择！最后，你希望受访者大约花多长时间完成这份问卷？这将帮助我控制问题数量。',
			suggestions: [
				'3-5分钟',
				'5-10分钟',
				'10-15分钟',
				'15-20分钟',
				'20分钟以上',
			],
		},
		validation: {
			content:
				'完美！基于我们的对话，我已经收集了足够的信息。让我为你生成一份定制化的问卷。你还有什么特殊要求吗？',
			suggestions: ['开始生成问卷', '添加更多细节', '修改某些要求', '重新开始'],
		},
		complete: {
			content:
				'太棒了！我已经根据我们的对话生成了完整的问卷结构和问题。你可以查看生成的问卷，如果需要调整，我们可以继续优化。',
			suggestions: ['查看问卷', '继续优化', '导出问卷', '重新生成'],
		},
	}

	return {
		id: Date.now().toString(),
		type: 'ai',
		content: responses[state.phase].content,
		timestamp: new Date(),
		suggestions: responses[state.phase].suggestions,
	}
}

/**
 * 更新对话状态
 */
export const updateConversationState = (
	userInput: string,
	currentState: ConversationState,
): ConversationState => {
	const newState = { ...currentState }

	switch (currentState.phase) {
		case 'initial':
			newState.phase = 'details'
			newState.progress = 40
			newState.collectedInfo.purpose = userInput
			break
		case 'details':
			newState.phase = 'structure'
			newState.progress = 60
			newState.collectedInfo.targetAudience = userInput
			break
		case 'structure':
			newState.phase = 'validation'
			newState.progress = 80
			newState.collectedInfo.questionTypes = [userInput]
			break
		case 'validation':
			newState.phase = 'complete'
			newState.progress = 100
			newState.collectedInfo.estimatedTime = userInput
			break
	}

	return newState
}

/**
 * 获取阶段标签
 */
export const getPhaseLabel = (phase: ConversationPhase): string => {
	const labels = {
		initial: '确定目的',
		details: '分析受众',
		structure: '设计结构',
		validation: '验证需求',
		complete: '生成完成',
	}
	return labels[phase] || '进行中'
}

/**
 * 创建初始消息
 */
export const createInitialMessage = (): Message => ({
	id: '1',
	type: 'ai',
	content:
		'你好！我是AI问卷助手。让我们一起创建一份完美的问卷吧！首先，请告诉我这份问卷的主要目的是什么？',
	timestamp: new Date(),
	suggestions: [
		'客户满意度调查',
		'产品反馈收集',
		'市场研究',
		'员工满意度',
		'学术研究',
	],
})

/**
 * 创建初始对话状态
 */
export const createInitialConversationState = (): ConversationState => ({
	phase: 'initial',
	progress: 20,
	collectedInfo: {},
})
