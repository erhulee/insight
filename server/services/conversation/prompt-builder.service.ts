import {
	ConversationPromptInput,
	SurveyPromptInput,
	ConversationPhase,
} from '../../schemas/conversation'

export class PromptBuilderService {
	buildConversationPrompt(input: ConversationPromptInput): string {
		const { message, context, phase } = input
		const { collectedInfo, previousMessages } = context

		const basePrompt = this.getBaseConversationPrompt(
			phase as ConversationPhase,
		)
		const contextInfo = this.buildContextInfo(collectedInfo)
		const conversationHistory = this.buildConversationHistory(previousMessages)

		return `
${basePrompt}

当前对话阶段: ${phase}
已收集信息: ${contextInfo}
对话历史: ${conversationHistory}

用户最新消息: ${message}

请根据以上信息生成合适的回复，包括：
1. 针对性的问题或建议
2. 相关的快捷选项
3. 下一步的引导

回复格式要求：
- 内容简洁明了
- 提供3-5个相关建议
- 根据对话进度调整语气
    `.trim()
	}

	buildSurveyPrompt(input: SurveyPromptInput): string {
		const { prompt, context, collectedInfo } = input

		return `
你是一个专业的问卷设计专家。请根据以下信息生成一份完整的问卷：

用户需求描述: ${prompt}

已收集的详细信息:
- 问卷目的: ${collectedInfo.purpose || '未指定'}
- 目标受众: ${collectedInfo.targetAudience || '未指定'}
- 问题类型: ${collectedInfo.questionTypes?.join(', ') || '未指定'}
- 预计时长: ${collectedInfo.estimatedTime || '未指定'}
- 相关主题: ${collectedInfo.topics?.join(', ') || '未指定'}

请生成包含以下结构的问卷：
1. 问卷标题
2. 问卷描述
3. 问题列表（每个问题包含：标题、类型、选项、是否必填、描述）

输出格式为 JSON：
{
  "title": "问卷标题",
  "description": "问卷描述",
  "questions": [
    {
      "id": "q1",
      "title": "问题标题",
      "type": "single_choice",
      "options": ["选项1", "选项2", "选项3"],
      "required": true,
      "description": "问题描述"
    }
  ]
}
    `.trim()
	}

	private getBaseConversationPrompt(phase: ConversationPhase): string {
		const prompts = {
			initial: `你是AI问卷助手。你的任务是帮助用户创建问卷。当前阶段是了解基本需求。
请询问用户问卷的主要目的，并提供一些常见选项。`,

			details: `当前阶段是了解详细信息。用户已经说明了问卷目的，现在需要了解目标受众。
请询问目标受众的具体特征，如年龄、职业、地区等。`,

			structure: `当前阶段是确定问卷结构。用户已经提供了目的和受众信息，现在需要确定问题类型。
请询问用户希望包含哪些类型的问题，如单选题、多选题、评分题等。`,

			validation: `当前阶段是验证需求。用户已经提供了大部分信息，现在需要确认和完善。
请总结已收集的信息，询问是否还有特殊要求或需要修改的地方。`,

			complete: `当前阶段是完成对话。用户已经提供了所有必要信息，可以生成问卷了。
请确认用户是否满意当前的需求描述，然后准备生成问卷。`,
		}

		return prompts[phase] || prompts.initial
	}

	private buildContextInfo(collectedInfo: Record<string, any>): string {
		if (Object.keys(collectedInfo).length === 0) {
			return '暂无收集信息'
		}

		const infoItems = Object.entries(collectedInfo)
			.map(([key, value]) => {
				if (Array.isArray(value)) {
					return `${key}: ${value.join(', ')}`
				}
				return `${key}: ${value}`
			})
			.join('\n')

		return infoItems
	}

	private buildConversationHistory(previousMessages: any[]): string {
		if (!previousMessages || previousMessages.length === 0) {
			return '暂无对话历史'
		}

		// 只显示最近5条消息
		const recentMessages = previousMessages.slice(-5)

		return recentMessages
			.map((msg) => {
				const type = msg.type === 'user' ? '用户' : 'AI'
				return `${type}: ${msg.content}`
			})
			.join('\n')
	}

	// 构建特定阶段的建议
	buildSuggestionsForPhase(phase: ConversationPhase): string[] {
		const suggestions = {
			initial: [
				'市场调研',
				'用户满意度调查',
				'产品反馈收集',
				'员工满意度调查',
				'活动效果评估',
			],
			details: [
				'18-25岁学生群体',
				'25-35岁职场人士',
				'35-50岁中年群体',
				'50岁以上老年群体',
				'特定行业从业者',
			],
			structure: ['单选题', '多选题', '评分题', '文本输入题', '排序题'],
			validation: [
				'确认信息无误',
				'添加特殊要求',
				'修改部分内容',
				'立即生成问卷',
				'重新开始',
			],
			complete: ['生成问卷', '预览问卷', '修改需求', '保存草稿', '重新开始'],
		}

		return suggestions[phase] || []
	}

	// 构建错误处理提示
	buildErrorPrompt(error: string, context: any): string {
		return `
抱歉，处理您的请求时遇到了问题：${error}

请尝试：
1. 重新描述您的需求
2. 使用更简洁的语言
3. 或者选择以下选项继续：

${this.buildSuggestionsForPhase(context.phase).join('\n')}
    `.trim()
	}
}
