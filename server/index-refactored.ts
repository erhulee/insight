import { procedure, router, protectedProcedure, createContext } from './trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import {
    userService,
    surveyService,
    templateService,
    apiKeyService,
    aiConfigService,
    ollamaService
} from './services'

export const appRouter = router({
    // 用户相关路由
    Register: procedure.input(z.object({
        account: z.string(),
        password: z.string(),
        username: z.string(),
    })).mutation(async (opt) => {
        try {
            const { account, password, username } = opt.input
            return await userService.register({ account, password, username })
        } catch (e) {
            console.error('注册失败:', e)
            throw new TRPCError({
                message: '注册失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }),

    CreateUser: procedure
        .input(
            z.object({
                account: z.string(),
                password: z.string(),
                username: z.string(),
            }),
        )
        .mutation(async (opt) => {
            const { account, password, username } = opt.input
            try {
                return await userService.createUser({ account, password, username })
            } catch (e) {
                throw new TRPCError({
                    message: '注册失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    Logout: protectedProcedure.mutation(async (opt) => {
        const userId = opt.ctx.userId!
        return await userService.logout(userId)
    }),

    GetUserInfo: protectedProcedure.query(async (opt) => {
        const userId = opt.ctx.userId!
        try {
            const user = await userService.getUserInfo(userId)
            if (!user) {
                throw new TRPCError({
                    message: '用户不存在',
                    code: 'NOT_FOUND',
                })
            }
            return user
        } catch (e) {
            throw new TRPCError({
                message: '获取用户信息失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }),

    ValidateToken: procedure
        .input(
            z.object({
                token: z.string(),
            }),
        )
        .query(async (opt) => {
            const { token } = opt.input
            try {
                return await userService.validateToken(token)
            } catch (error) {
                console.error('Token validation error:', error)
                return null
            }
        }),

    UpdateUserInfo: protectedProcedure
        .input(
            z.object({
                name: z.string().optional(),
                current_password: z.string().optional(),
                password: z.string().optional(),
            }),
        )
        .mutation(async (opt) => {
            const userId = opt.ctx.userId!
            const { name, password, current_password } = opt.input
            try {
                const updateData: any = {}
                if (name) updateData.name = name
                if (password) updateData.password = password
                if (current_password) updateData.current_password = current_password

                return await userService.updateUserInfo(userId, updateData)
            } catch (e) {
                throw new TRPCError({
                    message: '更新用户信息失败',
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

    // AI相关路由
    TestAIConnection: protectedProcedure
        .input(
            z.object({
                config: z.object({
                    type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
                    baseUrl: z.string(),
                    apiKey: z.string().optional(),
                    model: z.string(),
                    temperature: z.number(),
                    topP: z.number(),
                    repeatPenalty: z.number().optional(),
                    maxTokens: z.number().optional(),
                }),
            }),
        )
        .mutation(async (opt) => {
            try {
                return await aiConfigService.testConnection(opt.input.config)
            } catch (error) {
                console.error('AI连接测试失败:', error)
                return {
                    success: false,
                    error: error instanceof Error ? error.message : '连接测试失败'
                }
            }
        }),

    GetAIStatus: protectedProcedure
        .input(
            z.object({
                config: z.object({
                    type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
                    baseUrl: z.string(),
                    apiKey: z.string().optional(),
                    model: z.string(),
                    temperature: z.number(),
                    topP: z.number(),
                    repeatPenalty: z.number().optional(),
                    maxTokens: z.number().optional(),
                }),
            }),
        )
        .mutation(async (opt) => {
            try {
                return await aiConfigService.getServiceStatus(opt.input.config)
            } catch (error) {
                console.error('获取AI服务状态失败:', error)
                return {
                    available: false,
                    models: [],
                    currentModel: '',
                    error: error instanceof Error ? error.message : '获取状态失败',
                }
            }
        }),

    GenerateAISurveyWithConfig: protectedProcedure
        .input(
            z.object({
                prompt: z.string(),
                config: z.object({
                    type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
                    baseUrl: z.string(),
                    apiKey: z.string().optional(),
                    model: z.string(),
                    temperature: z.number(),
                    topP: z.number(),
                    repeatPenalty: z.number().optional(),
                    maxTokens: z.number().optional(),
                }),
            }),
        )
        .mutation(async (opt) => {
            try {
                return await aiConfigService.generateSurvey({
                    prompt: opt.input.prompt,
                    config: opt.input.config,
                })
            } catch (error) {
                console.error('AI生成问卷失败:', error)
                if (error instanceof TRPCError) throw error

                throw new TRPCError({
                    message: 'AI生成问卷失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    GenerateAISurveyStreamWithConfig: protectedProcedure
        .input(
            z.object({
                prompt: z.string(),
                config: z.object({
                    type: z.enum(['openai', 'ollama', 'anthropic', 'custom']),
                    baseUrl: z.string(),
                    apiKey: z.string().optional(),
                    model: z.string(),
                    temperature: z.number(),
                    topP: z.number(),
                    repeatPenalty: z.number().optional(),
                    maxTokens: z.number().optional(),
                }),
            }),
        )
        .subscription(async (opt) => {
            return observable<{ text: string }>((emit) => {
                aiConfigService.generateSurveyStream(
                    {
                        prompt: opt.input.prompt,
                        config: opt.input.config,
                    },
                    (chunk) => {
                        emit.next({ text: chunk.text || chunk.response || '' })
                    }
                ).catch((error) => {
                    emit.error(error)
                })
            })
        }),

    // Ollama相关路由
    GetOllamaModels: procedure.query(async () => {
        try {
            return await ollamaService.getModels()
        } catch (error) {
            throw new TRPCError({
                message: '获取Ollama模型列表失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }),

    GetOllamaModelInfo: procedure
        .input(z.object({ modelName: z.string() }))
        .query(async (opt) => {
            try {
                return await ollamaService.getModelInfo(opt.input.modelName)
            } catch (error) {
                throw new TRPCError({
                    message: '获取Ollama模型信息失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    PullOllamaModel: procedure
        .input(z.object({ modelName: z.string() }))
        .mutation(async (opt) => {
            try {
                return await ollamaService.pullModel(opt.input.modelName)
            } catch (error) {
                throw new TRPCError({
                    message: '拉取Ollama模型失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    DeleteOllamaModel: procedure
        .input(z.object({ modelName: z.string() }))
        .mutation(async (opt) => {
            try {
                return await ollamaService.deleteModel(opt.input.modelName)
            } catch (error) {
                throw new TRPCError({
                    message: '删除Ollama模型失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    // 模板相关路由
    SaveQuestionsToTemplate: protectedProcedure
        .input(z.object({ questionId: z.string() }))
        .mutation(async (opt) => {
            try {
                const userId = opt.ctx.userId!
                return await templateService.saveQuestionsToTemplate(userId, opt.input.questionId)
            } catch (error) {
                throw new TRPCError({
                    message: '保存模板失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    GetTemplateList: procedure
        .input(z.object({
            page: z.number().optional(),
            limit: z.number().optional(),
            category: z.string().optional(),
            tags: z.string().optional(),
        }))
        .query(async (opt) => {
            try {
                return await templateService.getTemplateList(opt.input)
            } catch (error) {
                throw new TRPCError({
                    message: '获取模板列表失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    CreateSurveyByTemplate: protectedProcedure
        .input(z.object({ templateId: z.string() }))
        .mutation(async (opt) => {
            try {
                const userId = opt.ctx.userId!
                return await templateService.createSurveyByTemplate(userId, opt.input.templateId)
            } catch (error) {
                throw new TRPCError({
                    message: '根据模板创建问卷失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    // API密钥相关路由
    CreateApiKey: protectedProcedure
        .input(z.object({
            name: z.string(),
            templateId: z.string().optional(),
            permissions: z.record(z.any()).optional(),
            expiresAt: z.date().optional(),
        }))
        .mutation(async (opt) => {
            try {
                const userId = opt.ctx.userId!
                return await apiKeyService.createApiKey(userId, opt.input)
            } catch (error) {
                throw new TRPCError({
                    message: '创建API密钥失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),

    GetApiKeys: protectedProcedure.query(async (opt) => {
        try {
            const userId = opt.ctx.userId!
            return await apiKeyService.getApiKeys(userId)
        } catch (error) {
            throw new TRPCError({
                message: '获取API密钥列表失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }),

    DeleteApiKey: protectedProcedure
        .input(z.object({ apiKeyId: z.string() }))
        .mutation(async (opt) => {
            try {
                const userId = opt.ctx.userId!
                return await apiKeyService.deleteApiKey(userId, opt.input.apiKeyId)
            } catch (error) {
                throw new TRPCError({
                    message: '删除API密钥失败',
                    code: 'INTERNAL_SERVER_ERROR',
                })
            }
        }),
})

export type AppRouter = typeof appRouter
