// server/routers/survey-router.ts
import { router, protectedProcedure, procedure } from '../trpc'
import { z } from 'zod'
import { surveyService } from '../services'
import { TRPCError } from '@trpc/server'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { displayLogicService } from '../services/display-logic.service'
const prisma = new PrismaClient().$extends(withAccelerate())
export const surveyRouter = router({
	SaveSurvey: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				questions: z.any(),
				pageCnt: z.number(),
			}),
		)
		.mutation(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				return await surveyService.updateSurvey(userId, opt.input.id, {
					questions: opt.input.questions,
					pageCnt: opt.input.pageCnt,
				})
			} catch (e) {
				throw new TRPCError({
					message: '保存失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	UpdateSurvey: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().optional(),
			}),
		)
		.mutation(async (opt) => {
			const { id, title } = opt.input
			const userId = opt.ctx.userId!
			try {
				if (title) {
					return await surveyService.updateSurvey(userId, id, { title })
				}
				return null
			} catch {
				throw new TRPCError({
					message: '更新失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	GetSurvey: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.query(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				return await surveyService.getSurvey(userId, opt.input.id)
			} catch (e) {
				throw new TRPCError({
					message: '获取问卷失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),
	// 问卷相关路由
	SubmitSurvey: procedure
		.input(
			z.object({
				surveyId: z.string(),
				values: z.any(),
			}),
		)
		.mutation(async (opt) => {
			try {
				return await surveyService.submitSurveyResponse({
					surveyId: opt.input.surveyId,
					values: opt.input.values,
				})
			} catch (e) {
				console.log(e)
				throw new TRPCError({
					message: '提交失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	GetSurveyList: protectedProcedure
		.input(
			z.object({
				page: z.number().optional(),
				limit: z.number().optional(),
				type: z.enum(['all', 'published', 'drafts']).optional(),
			}),
		)
		.query(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				const page = opt.input.page || 1
				const limit = opt.input.limit || 10
				// const skip = (page - 1) * limit

				const { surveys, total } = await surveyService.getSurveyList(userId, {
					page,
					limit,
					type: opt.input.type || 'all',
				})

				return {
					surveys,
					total,
					page,
					limit,
					pages: Math.ceil(total / limit),
				}
			} catch (e) {
				throw new TRPCError({
					message: '获取问卷列表失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	CreateSurvey: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				questions: z.any().optional(),
			}),
		)
		.mutation(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				const survey = await prisma.survey.create({
					data: {
						ownerId: userId,
						name: opt.input.name,
						description: opt.input.description || '',
						questions: opt.input.questions || [],
						published: false,
						pageCount: 1,
					},
				})
				return survey
			} catch (e) {
				throw new TRPCError({
					message: '创建问卷失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	PublishSurvey: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				published: z.boolean(),
			}),
		)
		.mutation(async (opt) => {
			try {
				const userId = opt.ctx.userId!
				return await surveyService.publishSurvey(
					userId,
					opt.input.id,
					opt.input.published,
				)
			} catch (e) {
				throw new TRPCError({
					message: '发布问卷失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	DisplayLogicGet: protectedProcedure
		.input(z.object({ formId: z.string().min(1) }))
		.query(async (opt) => {
			return displayLogicService.getDisplayLogic(opt.input.formId)
		}),

	DisplayLogicUpdate: protectedProcedure
		.input(z.object({ formId: z.string().min(1), config: z.any() }))
		.mutation(async (opt) => {
			await displayLogicService.saveDisplayLogic(
				opt.input.formId,
				opt.input.config,
			)
			return { ok: true }
		}),

	// 数据洞察相关路由
	getUserSurveys: protectedProcedure.query(async ({ ctx }) => {
		try {
			const userId = ctx.userId!
			const surveys = await prisma.survey.findMany({
				where: {
					ownerId: userId,
					deletedAt: null,
				},
				select: {
					id: true,
					name: true,
					description: true,
					createdAt: true,
					published: true,
					_count: {
						select: {
							responses: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
			})

			return surveys.map((survey) => ({
				...survey,
				responseCount: survey._count.responses,
			}))
		} catch (error) {
			throw new TRPCError({
				message: '获取问卷列表失败',
				code: 'INTERNAL_SERVER_ERROR',
			})
		}
	}),

	getSurveyStats: protectedProcedure
		.input(
			z.object({
				surveyId: z.string(),
				dateRange: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const userId = ctx.userId!
				const { surveyId, dateRange = '7d' } = input

				// 验证问卷所有权
				const survey = await prisma.survey.findFirst({
					where: {
						id: surveyId,
						ownerId: userId,
						deletedAt: null,
					},
				})

				if (!survey) {
					throw new TRPCError({
						message: '问卷不存在',
						code: 'NOT_FOUND',
					})
				}

				// 计算日期范围
				const now = new Date()
				let startDate = new Date()

				switch (dateRange) {
					case '1d':
						startDate.setDate(now.getDate() - 1)
						break
					case '7d':
						startDate.setDate(now.getDate() - 7)
						break
					case '30d':
						startDate.setDate(now.getDate() - 30)
						break
					case '90d':
						startDate.setDate(now.getDate() - 90)
						break
					default:
						startDate = new Date(0) // 全部时间
				}

				// 获取统计数据
				const [totalResponses, completedResponses] = await Promise.all([
					prisma.dataCollection.count({
						where: {
							templateId: surveyId,
							createdAt: {
								gte: startDate,
							},
						},
					}),
					prisma.dataCollection.count({
						where: {
							templateId: surveyId,
							createdAt: {
								gte: startDate,
							},
						},
					}),
				])

				const completionRate =
					totalResponses > 0 ? completedResponses / totalResponses : 0
				const averageTime = 0 // 暂时设为0，因为DataCollection模型没有timeSpent字段

				// 计算增长趋势（简化版本）
				const previousPeriodStart = new Date(
					startDate.getTime() - (now.getTime() - startDate.getTime()),
				)
				const previousResponses = await prisma.dataCollection.count({
					where: {
						templateId: surveyId,
						createdAt: {
							gte: previousPeriodStart,
							lt: startDate,
						},
					},
				})

				const responseGrowth =
					previousResponses > 0
						? (totalResponses - previousResponses) / previousResponses
						: 0

				return {
					totalResponses,
					completionRate,
					averageTime,
					responseGrowth,
				}
			} catch (error) {
				if (error instanceof TRPCError) throw error
				throw new TRPCError({
					message: '获取统计数据失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	getResponseData: protectedProcedure
		.input(
			z.object({
				surveyId: z.string(),
				dateRange: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const userId = ctx.userId!
				const { surveyId, dateRange = '7d' } = input

				// 验证问卷所有权
				const survey = await prisma.survey.findFirst({
					where: {
						id: surveyId,
						ownerId: userId,
						deletedAt: null,
					},
				})

				if (!survey) {
					throw new TRPCError({
						message: '问卷不存在',
						code: 'NOT_FOUND',
					})
				}

				// 计算日期范围
				const now = new Date()
				let startDate = new Date()

				switch (dateRange) {
					case '1d':
						startDate.setDate(now.getDate() - 1)
						break
					case '7d':
						startDate.setDate(now.getDate() - 7)
						break
					case '30d':
						startDate.setDate(now.getDate() - 30)
						break
					case '90d':
						startDate.setDate(now.getDate() - 90)
						break
					default:
						startDate = new Date(0)
				}

				// 获取按日期分组的响应数据
				const responses = await prisma.dataCollection.findMany({
					where: {
						templateId: surveyId,
						createdAt: {
							gte: startDate,
						},
					},
					select: {
						createdAt: true,
						data: true,
					},
					orderBy: {
						createdAt: 'asc',
					},
				})

				// 按日期分组数据
				const groupedData = responses.reduce(
					(
						acc: Record<string, { responses: number; completions: number }>,
						response: any,
					) => {
						const date = response.createdAt.toISOString().split('T')[0]
						if (!acc[date]) {
							acc[date] = { responses: 0, completions: 0 }
						}
						acc[date].responses++
						// 假设所有数据都是完成的，因为DataCollection模型没有completed字段
						acc[date].completions++
						return acc
					},
					{} as Record<string, { responses: number; completions: number }>,
				)

				// 转换为数组格式
				return Object.entries(groupedData).map(
					([date, data]: [string, any]) => ({
						date,
						responses: data.responses,
						completions: data.completions,
					}),
				)
			} catch (error) {
				if (error instanceof TRPCError) throw error
				throw new TRPCError({
					message: '获取响应数据失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	getQuestionAnalysis: protectedProcedure
		.input(
			z.object({
				surveyId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const userId = ctx.userId!
				const { surveyId } = input

				// 验证问卷所有权
				const survey = await prisma.survey.findFirst({
					where: {
						id: surveyId,
						ownerId: userId,
						deletedAt: null,
					},
				})

				if (!survey) {
					throw new TRPCError({
						message: '问卷不存在',
						code: 'NOT_FOUND',
					})
				}

				// 解析问卷题目
				const questions = JSON.parse((survey.questions as string) || '[]')

				// 获取响应数据
				const responses = await prisma.dataCollection.findMany({
					where: {
						templateId: surveyId,
					},
					select: {
						data: true,
					},
				})

				// 分析每个题目
				const analysis = questions.map((question: any) => {
					const questionResponses = responses.filter(
						(r: any) => r.data && r.data[question.id],
					)
					const totalResponses = questionResponses.length
					const completedResponses = questionResponses.length // 假设所有数据都是完成的
					const completionRate =
						totalResponses > 0 ? completedResponses / totalResponses : 0

					let analysisData: any = null

					// 根据题目类型进行不同的分析
					switch (question.type) {
						case 'single':
						case 'multiple':
							analysisData = analyzeOptions(question, questionResponses)
							break
						case 'rating':
							analysisData = analyzeRating(question, questionResponses)
							break
						case 'input':
						case 'textarea':
							analysisData = analyzeText(question, questionResponses)
							break
					}

					return {
						questionId: question.id,
						questionTitle: question.title,
						questionType: question.type,
						totalResponses,
						completionRate,
						analysis: analysisData,
					}
				})

				return analysis
			} catch (error) {
				if (error instanceof TRPCError) throw error
				throw new TRPCError({
					message: '获取题目分析失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),

	getTrendData: protectedProcedure
		.input(
			z.object({
				surveyId: z.string(),
				dateRange: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const userId = ctx.userId!
				const { surveyId, dateRange = '7d' } = input

				// 验证问卷所有权
				const survey = await prisma.survey.findFirst({
					where: {
						id: surveyId,
						ownerId: userId,
						deletedAt: null,
					},
				})

				if (!survey) {
					throw new TRPCError({
						message: '问卷不存在',
						code: 'NOT_FOUND',
					})
				}

				// 计算日期范围
				const now = new Date()
				let startDate = new Date()

				switch (dateRange) {
					case '1d':
						startDate.setDate(now.getDate() - 1)
						break
					case '7d':
						startDate.setDate(now.getDate() - 7)
						break
					case '30d':
						startDate.setDate(now.getDate() - 30)
						break
					case '90d':
						startDate.setDate(now.getDate() - 90)
						break
					default:
						startDate = new Date(0)
				}

				// 获取趋势数据
				const responses = await prisma.dataCollection.findMany({
					where: {
						templateId: surveyId,
						createdAt: {
							gte: startDate,
						},
					},
					select: {
						createdAt: true,
						data: true,
					},
					orderBy: {
						createdAt: 'asc',
					},
				})

				// 按日期分组
				const groupedData = responses.reduce(
					(
						acc: Record<string, { responses: number; completions: number }>,
						response: any,
					) => {
						const date = response.createdAt.toISOString().split('T')[0]
						if (!acc[date]) {
							acc[date] = { responses: 0, completions: 0 }
						}
						acc[date].responses++
						// 假设所有数据都是完成的
						acc[date].completions++
						return acc
					},
					{} as Record<string, { responses: number; completions: number }>,
				)

				// 转换为趋势数据格式
				return Object.entries(groupedData).map(
					([date, data]: [string, any]) => ({
						date,
						responses: data.responses,
						completions: data.completions,
						completionRate:
							data.responses > 0
								? (data.completions / data.responses) * 100
								: 0,
					}),
				)
			} catch (error) {
				if (error instanceof TRPCError) throw error
				throw new TRPCError({
					message: '获取趋势数据失败',
					code: 'INTERNAL_SERVER_ERROR',
				})
			}
		}),
})

// 辅助函数
function analyzeOptions(question: any, responses: any[]) {
	const options = question.props?.options || []
	const optionCounts = options.map((option: any) => ({
		...option,
		count: 0,
		percentage: 0,
	}))

	responses.forEach((response: any) => {
		const answer = response.data?.[question.id]
		if (answer) {
			const values = Array.isArray(answer) ? answer : [answer]
			values.forEach((value: any) => {
				const option = optionCounts.find((opt: any) => opt.value === value)
				if (option) {
					option.count++
				}
			})
		}
	})

	const totalCount = optionCounts.reduce(
		(sum: number, opt: any) => sum + opt.count,
		0,
	)
	optionCounts.forEach((option: any) => {
		option.percentage = totalCount > 0 ? (option.count / totalCount) * 100 : 0
	})

	return { options: optionCounts }
}

function analyzeRating(question: any, responses: any[]) {
	const maxRating = question.props?.maxRating || 5
	const ratings = Array.from({ length: maxRating }, (_, i) => ({
		value: i + 1,
		count: 0,
	}))

	let totalRating = 0
	let ratingCount = 0

	responses.forEach((response: any) => {
		const answer = response.data?.[question.id]
		if (answer && typeof answer === 'number') {
			const rating = Math.min(Math.max(answer, 1), maxRating)
			ratings[rating - 1]!.count++
			totalRating += rating
			ratingCount++
		}
	})

	return {
		ratings,
		averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
	}
}

function analyzeText(question: any, responses: any[]) {
	const texts = responses
		.map((response: any) => response.data?.[question.id])
		.filter((text: any) => text && typeof text === 'string')

	const totalWords = texts.reduce(
		(sum, text) => sum + text.split(/\s+/).length,
		0,
	)
	const averageWords = texts.length > 0 ? totalWords / texts.length : 0

	// 简单的词频分析
	const wordCounts: Record<string, number> = {}
	texts.forEach((text: string) => {
		const words = text.toLowerCase().split(/\s+/)
		words.forEach((word: string) => {
			if (word.length > 2) {
				// 忽略太短的词
				wordCounts[word] = (wordCounts[word] || 0) + 1
			}
		})
	})

	const topWords = Object.entries(wordCounts)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10)
		.map(([text, count]) => ({ text, count }))

	return {
		totalWords,
		averageWords: Math.round(averageWords),
		uniqueWords: Object.keys(wordCounts).length,
		topWords,
	}
}
