import { TRPCError } from '@trpc/server'
import { PrismaClient } from '@prisma/client'
import { createAIService } from '@/lib/ai-service-interface'
import type { AIServiceConfig } from '@/lib/ai-service-config'

const prisma = new PrismaClient()

export interface CreateAIConfigInput {
	name: string
	type: 'openai' | 'ollama' | 'anthropic' | 'volcano' | 'custom'
	baseUrl: string
	apiKey?: string | undefined
	model: string
	repeatPenalty?: number | undefined
	isActive: boolean
}

export interface UpdateAIConfigInput {
	name?: string | undefined
	type?: 'openai' | 'ollama' | 'anthropic' | 'volcano' | 'custom' | undefined
	baseUrl?: string | undefined
	apiKey?: string | undefined
	model?: string | undefined
	repeatPenalty?: number | undefined
	isActive?: boolean | undefined
}

export interface TestConnectionInput {
	type: 'openai' | 'ollama' | 'anthropic' | 'volcano' | 'custom'
	baseUrl: string
	apiKey?: string | undefined
	model: string
	repeatPenalty?: number | undefined
}

export class AIConfigService {
	// 获取用户的所有AI配置
	async getUserConfigs(userId: string) {
		try {
			const configs = await prisma.aIConfig.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
			})

			// 解密API密钥（如果需要显示）
			return configs.map((config: any) => ({
				...config,
				apiKey: config.apiKey ? '***' : undefined, // 不返回真实API密钥
			}))
		} catch (error) {
			console.error('获取AI配置列表失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '获取AI配置列表失败',
			})
		}
	}

	// 获取用户的活跃AI配置
	async getActiveConfig(userId: string) {
		try {
			const config = await prisma.aIConfig.findFirst({
				where: { userId, isActive: true },
			})

			if (!config) {
				return null
			}

			return {
				...config,
				apiKey: config.apiKey ? '***' : undefined, // 不返回真实API密钥
			}
		} catch (error) {
			console.error('获取活跃AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '获取活跃AI配置失败',
			})
		}
	}

	// 创建AI配置
	async createConfig(userId: string, input: CreateAIConfigInput) {
		try {
			// 如果设置为活跃配置，先取消其他配置的活跃状态
			if (input.isActive) {
				await prisma.aIConfig.updateMany({
					where: { userId, isActive: true },
					data: { isActive: false },
				})
			}

			const config = await prisma.aIConfig.create({
				data: {
					...input,
					userId,
					// 加密API密钥（这里简化处理，实际应该使用加密库）
					apiKey: input.apiKey ? this.encryptApiKey(input.apiKey) : null,
					repeatPenalty: input.repeatPenalty || null,
					// maxTokens已移除，由后端固定配置
				},
			})

			return {
				...config,
				apiKey: config.apiKey ? '***' : undefined,
			}
		} catch (error) {
			console.error('创建AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '创建AI配置失败',
			})
		}
	}

	// 更新AI配置
	async updateConfig(
		userId: string,
		configId: string,
		input: UpdateAIConfigInput,
	) {
		try {
			// 检查配置是否存在且属于当前用户
			const existingConfig = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!existingConfig) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			// 如果设置为活跃配置，先取消其他配置的活跃状态
			if (input.isActive) {
				await prisma.aIConfig.updateMany({
					where: { userId, isActive: true },
					data: { isActive: false },
				})
			}

			const updateData: any = { ...input }
			if (input.apiKey !== undefined) {
				updateData.apiKey = input.apiKey
					? this.encryptApiKey(input.apiKey)
					: null
			}

			const config = await prisma.aIConfig.update({
				where: { id: configId },
				data: updateData,
			})

			return {
				...config,
				apiKey: config.apiKey ? '***' : undefined,
			}
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('更新AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '更新AI配置失败',
			})
		}
	}

	// 删除AI配置
	async deleteConfig(userId: string, configId: string) {
		try {
			const config = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!config) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			await prisma.aIConfig.delete({
				where: { id: configId },
			})

			return { success: true }
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('删除AI配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '删除AI配置失败',
			})
		}
	}

	// 设置活跃配置
	async setActiveConfig(userId: string, configId: string) {
		try {
			// 检查配置是否存在且属于当前用户
			const config = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!config) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			// 先取消所有配置的活跃状态
			await prisma.aIConfig.updateMany({
				where: { userId, isActive: true },
				data: { isActive: false },
			})

			// 设置指定配置为活跃状态
			const updatedConfig = await prisma.aIConfig.update({
				where: { id: configId },
				data: { isActive: true },
			})

			return {
				...updatedConfig,
				apiKey: updatedConfig.apiKey ? '***' : undefined,
			}
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('设置活跃配置失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '设置活跃配置失败',
			})
		}
	}

	// 测试配置连接
	async testConfigConnection(userId: string, configId: string) {
		try {
			const config = await prisma.aIConfig.findFirst({
				where: { id: configId, userId },
			})

			if (!config) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'AI配置不存在',
				})
			}

			// 解密API密钥
			const decryptedApiKey = config.apiKey
				? this.decryptApiKey(config.apiKey)
				: undefined

			const testConfig: AIServiceConfig = {
				id: config.id,
				name: config.name,
				type: config.type as any,
				baseUrl: config.baseUrl,
				apiKey: decryptedApiKey || '',
				model: config.model,
				// temperature和topP由AI服务内部处理
				...(config.repeatPenalty && { repeatPenalty: config.repeatPenalty }),
				// maxTokens: 4000, // 内置值 - 由AI服务内部处理
				isActive: config.isActive,
				createdAt: config.createdAt,
				updatedAt: config.updatedAt,
			}

			return await this.testConnection(testConfig)
		} catch (error) {
			if (error instanceof TRPCError) throw error

			console.error('测试配置连接失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: '测试配置连接失败',
			})
		}
	}

	// 测试连接
	async testConnection(config: TestConnectionInput | AIServiceConfig) {
		try {
			const service = createAIService(config.type)
			const result = await service.testConnection(config as AIServiceConfig)
			return result
		} catch (error) {
			console.error('测试AI服务连接失败:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : '连接测试失败',
			}
		}
	}

	// 获取服务状态
	async getServiceStatus(config: TestConnectionInput) {
		try {
			const service = createAIService(config.type)
			const status = await service.getStatus(config as AIServiceConfig)
			return status
		} catch (error) {
			console.error('获取AI服务状态失败:', error)
			return {
				available: false,
				models: [],
				currentModel: '',
				error: error instanceof Error ? error.message : '获取状态失败',
			}
		}
	}

	// 简单的API密钥加密（实际项目中应该使用更安全的加密方法）
	private encryptApiKey(apiKey: string): string {
		// 这里使用简单的Base64编码，实际应该使用AES等加密算法
		return Buffer.from(apiKey).toString('base64')
	}

	// 简单的API密钥解密
	private decryptApiKey(encryptedApiKey: string): string {
		// 这里使用简单的Base64解码，实际应该使用AES等解密算法
		return Buffer.from(encryptedApiKey, 'base64').toString('utf-8')
	}

	// 生成问卷
	async generateSurvey(input: { prompt: string; config: AIServiceConfig }) {
		try {
			const service = createAIService(input.config.type)
			const configWithFixedParams = {
				...input.config,
				temperature: 0.7, // 固定值
				topP: 0.9, // 固定值
				maxTokens: 4000, // 固定值
			}

			const result = await service.generate({
				prompt: this.buildSurveyPrompt(input.prompt),
				config: configWithFixedParams,
			})

			// 解析AI响应
			return this.parseAIResponse(result.content, input.prompt)
		} catch (error) {
			console.error('AI生成问卷失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'AI生成问卷失败',
			})
		}
	}

	// 流式生成问卷
	async generateSurveyStream(
		input: { prompt: string; config: AIServiceConfig },
		onChunk: (chunk: any) => void,
	) {
		try {
			const service = createAIService(input.config.type)
			let fullContent = ''

			const configWithFixedParams = {
				...input.config,
				temperature: 0.7, // 固定值
				topP: 0.9, // 固定值
				maxTokens: 4000, // 固定值
			}

			await service.generateStream(
				{
					prompt: this.buildSurveyPrompt(input.prompt),
					config: configWithFixedParams,
				},
				(chunk) => {
					if (!chunk.isComplete) {
						fullContent += chunk.content
						onChunk({ content: chunk.content, isComplete: false })
					} else {
						// 生成完成，解析最终结果
						const result = this.parseAIResponse(fullContent, input.prompt)
						onChunk({ content: '', isComplete: true, result })
					}
				},
			)
		} catch (error) {
			console.error('AI流式生成问卷失败:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'AI流式生成问卷失败',
			})
		}
	}

	// 构建问卷生成提示词
	private buildSurveyPrompt(userPrompt: string): string {
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
	private parseAIResponse(aiResponse: string, originalPrompt: string) {
		try {
			if (!aiResponse) {
				throw new Error('AI响应为空')
			}

			// 处理可能的markdown代码块格式
			let jsonStr = aiResponse

			// 移除 ```json 和 ``` 标记
			jsonStr = jsonStr.replace(/```json\s*\n?/g, '')
			jsonStr = jsonStr.replace(/```\s*$/g, '')

			// 移除开头和结尾的空白字符
			jsonStr = jsonStr.trim()

			const parsed = JSON.parse(jsonStr)

			// 验证和清理数据
			const survey = {
				title: parsed.title || '问卷调查',
				description: parsed.description || `基于"${originalPrompt}"生成的问卷`,
				questions: [],
			}

			// 处理问题数组
			if (Array.isArray(parsed.questions)) {
				survey.questions = parsed.questions.map((q: any, index: number) => ({
					id: q.id || `q${index + 1}`,
					type: q.type || 'single',
					title: q.title || `问题${index + 1}`,
					description: q.description || '',
					required: q.required !== undefined ? q.required : true,
					pageSize: q.pageSize || 1,
					props: q.props || {},
				}))
			}

			return survey
		} catch (error) {
			console.error('Failed to parse AI response:', error)
			// 如果解析失败，返回一个基础模板
			return {
				title: '问卷调查',
				description: `基于"${originalPrompt}"生成的问卷`,
				questions: [
					{
						id: 'q1',
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
						id: 'q2',
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
	}
}

export const aiConfigService = new AIConfigService()
