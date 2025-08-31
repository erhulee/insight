// server/routers/survey-router.ts
import { router, protectedProcedure, procedure } from '../trpc'
import { z } from 'zod'
import { surveyService } from '../services'
import { TRPCError } from '@trpc/server'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
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
                return await surveyService.publishSurvey(userId, opt.input.id, opt.input.published)
            } catch (e) {
                throw new TRPCError({
                    message: '发布问卷失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),


})