import { v4 as uuidv4 } from 'uuid'
import { ollamaClient } from './services/ai/ollama/client'

interface GeneratedSurvey {
	title: string
	description: string
	questions: any[]
}

// 使用Ollama生成问卷的函数
export async function generateSurveyFromPrompt(
	prompt: string,
): Promise<GeneratedSurvey> {
	try {
		// 检查Ollama是否可用
		const isAvailable = await ollamaClient.isAvailable()
		if (!isAvailable) {
			console.warn('Ollama not available, falling back to template generation')
			return generateSurveyByPrompt(prompt)
		}

		// 构建AI提示词
		const aiPrompt = buildSurveyPrompt(prompt)

		// 调用Ollama生成内容
		const aiResponse = await ollamaClient.generate(aiPrompt, 'qwen2.5:1.5b')

		// 解析AI响应
		const surveyData = parseAIResponse(aiResponse, prompt)

		return surveyData
	} catch (error) {
		console.error('AI generation failed, falling back to template:', error)
		// 如果AI生成失败，回退到模板生成
		return generateSurveyByPrompt(prompt)
	}
}

// 构建AI提示词
export function buildSurveyPrompt(userPrompt: string): string {
	return `你是一个专业的问卷设计专家。请根据用户的需求生成一个完整的问卷。

用户需求：${userPrompt}

请按照以下JSON格式生成问卷，确保格式完全正确：

{
  "title": "问卷标题",
  "description": "问卷描述",
  "questions": [
    {
      "id": "unique_id_1",
      "type": "single",
      "title": "问题标题",
      "description": "问题描述（可选）",
      "required": true,
      "pageSize": 1,
      "props": {
        "options": [
          {
            "label": "选项1",
            "value": "value1",
            "id": "option1"
          },
          {
            "label": "选项2",
            "value": "value2",
            "id": "option2"
          }
        ]
      }
    }
  ]
}

问题类型说明：
- "single": 单选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "multiple": 多选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "rating": 评价打分 - 包含props.maxRating（最高分值，默认5）、props.ratingType（评分类型：star/number/heart）、props.minLabel（最低分标签）、props.maxLabel（最高分标签）
- "textarea": 文本域 - 不需要options
- "input": 文本输入 - 不需要options

选项格式要求：
- label: 选项显示文本
- value: 选项值（英文或数字）
- id: 唯一标识符（英文或数字）

请确保：
1. 生成4-6个问题，避免问卷过长
2. 问题类型多样化，包含选择类、文本类和评分类问题
3. 问题逻辑合理，符合问卷目的
4. 每个问题都有唯一的id
5. 所有问题都设置pageSize为1
6. 单选题和多选题必须包含完整的options数组
7. 每个选项都有label、value、id三个字段
8. 评分题包含合适的props配置（maxRating、ratingType、minLabel、maxLabel）
9. 只返回纯JSON格式，不要markdown代码块标记（如\`\`\`json），不要其他文字

现在请生成问卷：`
}

// 解析AI响应
function parseAIResponse(
	aiResponse: string,
	originalPrompt: string,
): GeneratedSurvey {
	try {
		// 尝试从AI响应中提取JSON
		if (aiResponse) {
			console.log('aiResponse:', aiResponse)

			// 处理可能的markdown代码块格式
			let jsonStr = aiResponse

			// 移除 ```json 和 ``` 标记
			jsonStr = jsonStr.replace(/```json\s*\n?/g, '')
			jsonStr = jsonStr.replace(/```\s*$/g, '')

			// 移除开头和结尾的空白字符
			jsonStr = jsonStr.trim()

			console.log('Cleaned JSON string:', jsonStr)

			const parsed = JSON.parse(jsonStr)

			// 验证和清理数据
			const survey: GeneratedSurvey = {
				title: parsed.title || '问卷调查',
				description: parsed.description || `基于"${originalPrompt}"生成的问卷`,
				questions: [],
			}

			// 处理问题数组
			if (Array.isArray(parsed.questions)) {
				survey.questions = parsed.questions.map((q: any, index: number) => ({
					id: q.id || uuidv4(),
					type: q.type || 'single',
					title: q.title || `问题${index + 1}`,
					description: q.description || '',
					required: q.required !== undefined ? q.required : true,
					pageSize: q.pageSize || 1,
					props: q.props || {},
				}))
			}

			return survey
		}
	} catch (error) {
		console.error('Failed to parse AI response:', error)
	}

	// 如果解析失败，回退到模板生成
	console.warn('AI response parsing failed, using template generation')
	return generateSurveyByPrompt(originalPrompt)
}

function generateSurveyByPrompt(prompt: string): GeneratedSurvey {
	const lowerPrompt = prompt.toLowerCase()

	// 根据关键词生成不同类型的问卷
	if (lowerPrompt.includes('客户满意度') || lowerPrompt.includes('满意度')) {
		return generateCustomerSatisfactionSurvey()
	} else if (lowerPrompt.includes('员工') || lowerPrompt.includes('工作环境')) {
		return generateEmployeeSurvey()
	} else if (
		lowerPrompt.includes('市场调研') ||
		lowerPrompt.includes('产品需求')
	) {
		return generateMarketResearchSurvey()
	} else if (
		lowerPrompt.includes('活动反馈') ||
		lowerPrompt.includes('活动评价')
	) {
		return generateEventFeedbackSurvey()
	} else {
		// 默认生成通用问卷
		return generateGenericSurvey(prompt)
	}
}

function generateCustomerSatisfactionSurvey(): GeneratedSurvey {
	return {
		title: '客户满意度调查',
		description: '了解客户对我们产品和服务的满意度，帮助我们持续改进',
		questions: [
			{
				id: uuidv4(),
				type: 'single',
				title: '您对我们的产品总体满意度如何？',
				description: '请选择最符合您感受的选项',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{
							label: '非常满意',
							value: 'very_satisfied',
							id: 'opt_very_satisfied',
						},
						{ label: '满意', value: 'satisfied', id: 'opt_satisfied' },
						{ label: '一般', value: 'neutral', id: 'opt_neutral' },
						{ label: '不满意', value: 'dissatisfied', id: 'opt_dissatisfied' },
						{
							label: '非常不满意',
							value: 'very_dissatisfied',
							id: 'opt_very_dissatisfied',
						},
					],
				},
			},
			{
				id: uuidv4(),
				type: 'multiple',
				title: '您最喜欢我们产品的哪些方面？（可多选）',
				required: false,
				pageSize: 1,
				props: {
					options: [
						{ label: '用户界面设计', value: 'ui_design', id: 'opt_ui_design' },
						{ label: '功能丰富性', value: 'features', id: 'opt_features' },
						{ label: '易用性', value: 'usability', id: 'opt_usability' },
						{ label: '性能表现', value: 'performance', id: 'opt_performance' },
						{ label: '客户支持', value: 'support', id: 'opt_support' },
						{ label: '价格合理性', value: 'price', id: 'opt_price' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'textarea',
				title: '您有什么建议可以帮助我们改进产品？',
				description: '请详细描述您的想法和建议',
				required: false,
				pageSize: 1,
				props: {
					placeholder: '请输入您的建议...',
					maxLength: 500,
				},
			},
			{
				id: uuidv4(),
				type: 'single',
				title: '您是否会向朋友推荐我们的产品？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{ label: '一定会', value: 'definitely', id: 'opt_definitely' },
						{ label: '可能会', value: 'probably', id: 'opt_probably' },
						{ label: '不确定', value: 'unsure', id: 'opt_unsure' },
						{
							label: '可能不会',
							value: 'probably_not',
							id: 'opt_probably_not',
						},
						{
							label: '一定不会',
							value: 'definitely_not',
							id: 'opt_definitely_not',
						},
					],
				},
			},
			{
				id: uuidv4(),
				type: 'rating',
				title: '请对我们的服务质量进行评分',
				description:
					'5分表示非常满意，1分表示非常不满意，分值越低表示满意度越低',
				required: true,
				pageSize: 1,
				props: {
					maxRating: 5,
					ratingType: 'star',
					minLabel: '非常不满意',
					maxLabel: '非常满意',
					showLabels: true,
					description:
						'5分表示非常满意，1分表示非常不满意，分值越低表示满意度越低',
				},
			},
		],
	}
}

function generateEmployeeSurvey(): GeneratedSurvey {
	return {
		title: '员工工作环境调查',
		description: '了解员工对工作环境、团队协作和职业发展的满意度',
		questions: [
			{
				id: uuidv4(),
				type: 'single',
				title: '您对当前的工作环境满意度如何？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{
							label: '非常满意',
							value: 'very_satisfied',
							id: 'opt_very_satisfied',
						},
						{ label: '满意', value: 'satisfied', id: 'opt_satisfied' },
						{ label: '一般', value: 'neutral', id: 'opt_neutral' },
						{ label: '不满意', value: 'dissatisfied', id: 'opt_dissatisfied' },
						{
							label: '非常不满意',
							value: 'very_dissatisfied',
							id: 'opt_very_dissatisfied',
						},
					],
				},
			},
			{
				id: uuidv4(),
				type: 'multiple',
				title: '您认为公司需要在哪些方面进行改进？（可多选）',
				required: false,
				pageSize: 1,
				props: {
					options: [
						{
							label: '薪资福利',
							value: 'compensation',
							id: 'opt_compensation',
						},
						{
							label: '工作环境',
							value: 'work_environment',
							id: 'opt_work_environment',
						},
						{ label: '团队协作', value: 'teamwork', id: 'opt_teamwork' },
						{
							label: '职业发展',
							value: 'career_development',
							id: 'opt_career_development',
						},
						{
							label: '工作生活平衡',
							value: 'work_life_balance',
							id: 'opt_work_life_balance',
						},
						{ label: '管理方式', value: 'management', id: 'opt_management' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'textarea',
				title: '请描述您对团队协作的感受和建议',
				required: false,
				pageSize: 1,
				props: {
					placeholder: '请分享您的想法...',
					maxLength: 300,
				},
			},
			{
				id: uuidv4(),
				type: 'single',
				title: '您对公司的职业发展机会满意吗？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{
							label: '非常满意',
							value: 'very_satisfied',
							id: 'opt_very_satisfied',
						},
						{ label: '满意', value: 'satisfied', id: 'opt_satisfied' },
						{ label: '一般', value: 'neutral', id: 'opt_neutral' },
						{ label: '不满意', value: 'dissatisfied', id: 'opt_dissatisfied' },
						{
							label: '非常不满意',
							value: 'very_dissatisfied',
							id: 'opt_very_dissatisfied',
						},
					],
				},
			},
		],
	}
}

function generateMarketResearchSurvey(): GeneratedSurvey {
	return {
		title: '市场调研问卷',
		description: '了解用户对新产品的需求和购买意愿',
		questions: [
			{
				id: uuidv4(),
				type: 'single',
				title: '您的年龄段是？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{ label: '18-25岁', value: '18-25', id: 'opt_age_18_25' },
						{ label: '26-35岁', value: '26-35', id: 'opt_age_26_35' },
						{ label: '36-45岁', value: '36-45', id: 'opt_age_36_45' },
						{ label: '46-55岁', value: '46-55', id: 'opt_age_46_55' },
						{ label: '55岁以上', value: '55+', id: 'opt_age_55_plus' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'single',
				title: '您对新产品的购买意愿如何？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{
							label: '非常愿意',
							value: 'very_willing',
							id: 'opt_very_willing',
						},
						{ label: '愿意', value: 'willing', id: 'opt_willing' },
						{ label: '不确定', value: 'unsure', id: 'opt_unsure' },
						{ label: '不太愿意', value: 'not_willing', id: 'opt_not_willing' },
						{ label: '完全不愿意', value: 'not_at_all', id: 'opt_not_at_all' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'multiple',
				title: '您最关注产品的哪些特性？（可多选）',
				required: false,
				pageSize: 1,
				props: {
					options: [
						{ label: '价格', value: 'price', id: 'opt_price' },
						{ label: '质量', value: 'quality', id: 'opt_quality' },
						{ label: '功能', value: 'features', id: 'opt_features' },
						{ label: '外观设计', value: 'design', id: 'opt_design' },
						{ label: '品牌', value: 'brand', id: 'opt_brand' },
						{ label: '售后服务', value: 'service', id: 'opt_service' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'textarea',
				title: '请描述您理想中的产品应该具备什么特点？',
				required: false,
				pageSize: 1,
				props: {
					placeholder: '请详细描述您的想法...',
					maxLength: 400,
				},
			},
		],
	}
}

function generateEventFeedbackSurvey(): GeneratedSurvey {
	return {
		title: '活动反馈问卷',
		description: '收集参与者对活动组织和内容的评价',
		questions: [
			{
				id: uuidv4(),
				type: 'single',
				title: '您对本次活动的整体满意度如何？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{
							label: '非常满意',
							value: 'very_satisfied',
							id: 'opt_very_satisfied',
						},
						{ label: '满意', value: 'satisfied', id: 'opt_satisfied' },
						{ label: '一般', value: 'neutral', id: 'opt_neutral' },
						{ label: '不满意', value: 'dissatisfied', id: 'opt_dissatisfied' },
						{
							label: '非常不满意',
							value: 'very_dissatisfied',
							id: 'opt_very_dissatisfied',
						},
					],
				},
			},
			{
				id: uuidv4(),
				type: 'multiple',
				title: '您认为活动的哪些方面做得很好？（可多选）',
				required: false,
				pageSize: 1,
				props: {
					options: [
						{
							label: '活动组织',
							value: 'organization',
							id: 'opt_organization',
						},
						{ label: '内容质量', value: 'content', id: 'opt_content' },
						{ label: '场地环境', value: 'venue', id: 'opt_venue' },
						{ label: '时间安排', value: 'timing', id: 'opt_timing' },
						{ label: '互动环节', value: 'interaction', id: 'opt_interaction' },
						{ label: '工作人员服务', value: 'service', id: 'opt_service' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'textarea',
				title: '您对活动有什么建议或意见？',
				required: false,
				pageSize: 1,
				props: {
					placeholder: '请分享您的想法...',
					maxLength: 300,
				},
			},
			{
				id: uuidv4(),
				type: 'single',
				title: '您是否会参加我们下次举办的活动？',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{ label: '一定会', value: 'definitely', id: 'opt_definitely' },
						{ label: '可能会', value: 'probably', id: 'opt_probably' },
						{ label: '不确定', value: 'unsure', id: 'opt_unsure' },
						{
							label: '可能不会',
							value: 'probably_not',
							id: 'opt_probably_not',
						},
						{
							label: '一定不会',
							value: 'definitely_not',
							id: 'opt_definitely_not',
						},
					],
				},
			},
		],
	}
}

function generateGenericSurvey(prompt: string): GeneratedSurvey {
	return {
		title: '问卷调查',
		description: `基于您的描述"${prompt}"生成的问卷`,
		questions: [
			{
				id: uuidv4(),
				type: 'single',
				title: '请选择您最满意的选项',
				required: true,
				pageSize: 1,
				props: {
					options: [
						{ label: '选项A', value: 'option_a', id: 'opt_a' },
						{ label: '选项B', value: 'option_b', id: 'opt_b' },
						{ label: '选项C', value: 'option_c', id: 'opt_c' },
						{ label: '选项D', value: 'option_d', id: 'opt_d' },
					],
				},
			},
			{
				id: uuidv4(),
				type: 'textarea',
				title: '请分享您的想法和建议',
				required: false,
				pageSize: 1,
				props: {
					placeholder: '请输入您的想法...',
					maxLength: 500,
				},
			},
		],
	}
}
