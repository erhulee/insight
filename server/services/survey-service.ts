import { PrismaClient } from '@prisma/client/edge'
import { TRPCError } from '@trpc/server'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export interface CreateSurveyInput {
    name: string
    description?: string
    questions?: any[]
}

export interface UpdateSurveyInput {
    title?: string
    questions?: any
    pageCnt?: number
}

export interface SurveyListInput {
    page?: number
    limit?: number
    type?: 'all' | 'published' | 'drafts'
}

export interface SurveyListResult {
    surveys: any[]
    total: number
    page: number
    limit: number
    pages: number
}

export interface SurveyResponseInput {
    surveyId: string
    values: any
}

export interface SurveyResponsesInput {
    surveyId: string
    page?: number
    limit?: number
}

export interface SurveyResponsesResult {
    responses: any[]
    total: number
    page: number
    limit: number
    pages: number
}

export class SurveyService {
    /**
     * 创建问卷
     */
    async createSurvey(userId: string, input: CreateSurveyInput): Promise<any> {
        try {
            const survey = await prisma.survey.create({
                data: {
                    ownerId: userId,
                    name: input.name,
                    description: input.description || '',
                    questions: input.questions || [],
                    published: false,
                    pageCount: 1,
                },
            })
            return survey
        } catch (error) {
            console.error('创建问卷失败:', error)
            throw new TRPCError({
                message: '创建问卷失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取问卷详情
     */
    async getSurvey(userId: string, surveyId: string): Promise<any | null> {
        try {
            const survey = await prisma.survey.findUnique({
                where: {
                    ownerId: userId,
                    id: surveyId,
                },
            })

            if (survey) {
                // 处理问题数据格式
                survey.questions = Array.isArray(survey.questions)
                    ? survey.questions
                    : JSON.parse(survey.questions ?? '[]') as any[]
            }

            return survey
        } catch (error) {
            console.error('获取问卷失败:', error)
            throw new TRPCError({
                message: '获取问卷失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取问卷列表
     */
    async getSurveyList(userId: string, input: SurveyListInput): Promise<SurveyListResult> {
        try {
            const page = input.page || 1
            const limit = input.limit || 10
            const skip = (page - 1) * limit

            const whereClause: any = {
                ownerId: userId,
                deletedAt: null,
            }

            // 根据类型筛选
            if (input.type === 'published') {
                whereClause.published = true
            } else if (input.type === 'drafts') {
                whereClause.published = false
            }

            const [surveys, total] = await Promise.all([
                prisma.survey.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        updatedAt: true,
                        published: true,
                        questions: true,
                        pageCount: true,
                        createdAt: true,
                        deletedAt: true,
                        ownerId: true,
                    }
                }),
                prisma.survey.count({
                    where: {
                        ownerId: userId,
                        deletedAt: null,
                    },
                }),
            ])

            return {
                surveys,
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        } catch (error) {
            console.error('获取问卷列表失败:', error)
            throw new TRPCError({
                message: '获取问卷列表失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 更新问卷
     */
    async updateSurvey(userId: string, surveyId: string, input: UpdateSurveyInput): Promise<any> {
        try {
            const updateData: any = {}

            if (input.title) {
                updateData.name = input.title
            }

            if (input.questions !== undefined) {
                updateData.questions = input.questions
            }

            if (input.pageCnt !== undefined) {
                updateData.pageCount = input.pageCnt
            }

            if (Object.keys(updateData).length === 0) {
                return null
            }

            const survey = await prisma.survey.update({
                where: {
                    id: surveyId,
                    ownerId: userId,
                },
                data: updateData
            })

            return survey
        } catch (error) {
            console.error('更新问卷失败:', error)
            throw new TRPCError({
                message: '更新失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 删除问卷（软删除）
     */
    async deleteSurvey(userId: string, surveyId: string): Promise<any> {
        try {
            const survey = await prisma.survey.update({
                where: {
                    id: surveyId,
                    ownerId: userId,
                },
                data: {
                    deletedAt: new Date(),
                }
            })
            return survey
        } catch (error) {
            console.error('删除问卷失败:', error)
            throw new TRPCError({
                message: '删除问卷失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 发布/取消发布问卷
     */
    async publishSurvey(userId: string, surveyId: string, published: boolean): Promise<any> {
        try {
            const survey = await prisma.survey.update({
                where: {
                    id: surveyId,
                    ownerId: userId,
                },
                data: {
                    published,
                }
            })
            return survey
        } catch (error) {
            console.error('发布问卷失败:', error)
            throw new TRPCError({
                message: '发布问卷失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 提交问卷回复
     */
    async submitSurveyResponse(input: SurveyResponseInput): Promise<any> {
        try {
            const survey = await prisma.questionnaires.create({
                data: {
                    surveyId: input.surveyId,
                    Question: input.values,
                    createdAt: new Date(),
                },
            })
            return survey
        } catch (error) {
            console.error('提交问卷回复失败:', error)
            throw new TRPCError({
                message: '提交失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取问卷回复列表
     */
    async getSurveyResponses(userId: string, input: SurveyResponsesInput): Promise<SurveyResponsesResult> {
        try {
            // 验证问卷所有权
            const survey = await prisma.survey.findUnique({
                where: {
                    id: input.surveyId,
                    ownerId: userId,
                },
            })

            if (!survey) {
                throw new TRPCError({
                    message: '问卷不存在或无权限访问',
                    code: 'NOT_FOUND',
                })
            }

            const page = input.page || 1
            const limit = input.limit || 10
            const skip = (page - 1) * limit

            const [responses, total] = await Promise.all([
                prisma.questionnaires.findMany({
                    where: {
                        surveyId: input.surveyId,
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.questionnaires.count({
                    where: {
                        surveyId: input.surveyId,
                    },
                }),
            ])

            return {
                responses,
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        } catch (error) {
            if (error instanceof TRPCError) throw error
            throw new TRPCError({
                message: '获取问卷回复失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }
}

export const surveyService = new SurveyService()
