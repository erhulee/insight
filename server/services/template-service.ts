import { PrismaClient } from '@prisma/client/edge'
import { TRPCError } from '@trpc/server'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export interface CreateTemplateInput {
    name: string
    questions: any[]
    category?: string
    tags?: string[]
}

export interface TemplateListInput {
    page?: number
    limit?: number
    category?: string
    tags?: string
}

export interface TemplateListResult {
    templates: any[]
    total: number
    page: number
    limit: number
    pages: number
}

export class TemplateService {
    /**
     * 保存问卷为模板
     */
    async saveQuestionsToTemplate(userId: string, questionId: string): Promise<any> {
        try {
            // 获取问卷信息
            const survey = await prisma.survey.findUnique({
                where: { id: questionId }
            })

            if (!survey) {
                throw new TRPCError({
                    message: '问卷不存在',
                    code: 'NOT_FOUND',
                })
            }

            // 创建模板
            const template = await prisma.surverTemplate.create({
                data: {
                    name: survey.name,
                    questions: survey.questions!,
                    createdBy: userId,
                }
            })

            return template
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('保存模板失败:', error)
            throw new TRPCError({
                message: '保存模板失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取模板列表
     */
    async getTemplateList(input: TemplateListInput): Promise<TemplateListResult> {
        try {
            const page = input.page || 1
            const limit = input.limit || 10
            const skip = (page - 1) * limit

            const whereClause: any = {}

            // 根据分类筛选
            if (input.category) {
                whereClause.category = input.category
            }

            // 根据标签筛选
            if (input.tags) {
                whereClause.tags = {
                    contains: input.tags
                }
            }

            const [templates, total] = await Promise.all([
                prisma.surverTemplate.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdByUser: {
                            select: {
                                id: true,
                                username: true,
                            }
                        }
                    }
                }),
                prisma.surverTemplate.count({
                    where: whereClause
                })
            ])

            return {
                templates,
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        } catch (error) {
            console.error('获取模板列表失败:', error)
            throw new TRPCError({
                message: '获取模板列表失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 根据模板创建问卷
     */
    async createSurveyByTemplate(userId: string, templateId: string): Promise<any> {
        try {
            // 获取模板信息
            const template = await prisma.surverTemplate.findFirst({
                where: { id: templateId }
            })

            if (!template) {
                throw new TRPCError({
                    message: '模板不存在',
                    code: 'NOT_FOUND',
                })
            }

            // 创建问卷
            const survey = await prisma.survey.create({
                data: {
                    ownerId: userId,
                    name: template.name,
                    questions: template.questions!,
                    description: '',
                    pageCount: 1,
                    published: false,
                }
            })

            if (!survey) {
                throw new TRPCError({
                    message: '创建问卷失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }

            return survey
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('根据模板创建问卷失败:', error)
            throw new TRPCError({
                message: '创建问卷失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取模板详情
     */
    async getTemplate(templateId: string): Promise<any | null> {
        try {
            const template = await prisma.surverTemplate.findUnique({
                where: { id: templateId },
                include: {
                    createdByUser: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            })

            return template
        } catch (error) {
            console.error('获取模板详情失败:', error)
            throw new TRPCError({
                message: '获取模板详情失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 更新模板
     */
    async updateTemplate(
        userId: string,
        templateId: string,
        input: Partial<CreateTemplateInput>
    ): Promise<any> {
        try {
            // 验证模板所有权
            const template = await prisma.surverTemplate.findFirst({
                where: {
                    id: templateId,
                    createdBy: userId,
                }
            })

            if (!template) {
                throw new TRPCError({
                    message: '模板不存在或无权限修改',
                    code: 'NOT_FOUND',
                })
            }

            // 更新模板
            const updatedTemplate = await prisma.surverTemplate.update({
                where: { id: templateId },
                data: input
            })

            return updatedTemplate
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('更新模板失败:', error)
            throw new TRPCError({
                message: '更新模板失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 删除模板
     */
    async deleteTemplate(userId: string, templateId: string): Promise<boolean> {
        try {
            // 验证模板所有权
            const template = await prisma.surverTemplate.findFirst({
                where: {
                    id: templateId,
                    createdBy: userId,
                }
            })

            if (!template) {
                throw new TRPCError({
                    message: '模板不存在或无权限删除',
                    code: 'NOT_FOUND',
                })
            }

            // 删除模板
            await prisma.surverTemplate.delete({
                where: { id: templateId }
            })

            return true
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('删除模板失败:', error)
            throw new TRPCError({
                message: '删除模板失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }
}

export const templateService = new TemplateService()
