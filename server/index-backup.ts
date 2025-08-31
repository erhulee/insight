import { procedure, router, protectedProcedure, createContext } from './trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import {
  userService,
  surveyService,
} from './services'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
const prisma = new PrismaClient().$extends(withAccelerate())
export const appRouter = router({
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

  // 验证 token 并返回用户信息
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


  GenerateAISurvey: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .mutation(async (opt) => {
      try {
        const { prompt } = opt.input

        // 调用Ollama生成问卷
        const generatedSurvey = await generateSurveyFromPrompt(prompt)

        return generatedSurvey
      } catch (e) {
        console.error('AI生成问卷失败:', e)
        throw new TRPCError({
          message: 'AI生成问卷失败',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),

  GenerateAISurveyStream: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .subscription(async (opt) => {
      const { prompt } = opt.input

      return observable<string>((emit) => {
        const generateStream = async () => {
          try {
            const { ollamaClient } = await import('./ollama-client')
            const aiPrompt = buildSurveyPrompt(prompt)

            // 使用流式生成
            await ollamaClient.generateStream(aiPrompt, 'qwen2.5:1.5b', (chunk: string) => {
              emit.next(chunk)
            })

            emit.complete()
          } catch (error) {
            console.error('Stream generation failed:', error)
            emit.error(new TRPCError({
              message: '流式生成失败',
              code: 'INTERNAL_SERVER_ERROR',
            }))
          }
        }

        generateStream()
      })
    }),

  TestOllamaConnection: protectedProcedure
    .input(
      z.object({
        baseUrl: z.string(),
        model: z.string(),
      }),
    )
    .mutation(async (opt) => {
      try {
        const { baseUrl, model } = opt.input

        // 创建临时客户端测试连接
        const { OllamaClient } = await import('./ollama-client')
        const testClient = new OllamaClient({ baseUrl, model })

        // 测试连接
        const isAvailable = await testClient.isAvailable()
        if (!isAvailable) {
          return { success: false, error: '无法连接到Ollama服务' }
        }

        // 测试模型是否可用
        try {
          await testClient.generate('测试', model)
          return { success: true }
        } catch (error) {
          return { success: false, error: '模型不可用或生成失败' }
        }
      } catch (e) {
        console.error('测试Ollama连接失败:', e)
        return { success: false, error: '连接测试失败' }
      }
    }),

  GetOllamaStatus: protectedProcedure
    .query(async () => {
      try {
        const { ollamaClient } = await import('./ollama-client')

        const isAvailable = await ollamaClient.isAvailable()
        if (!isAvailable) {
          return {
            available: false,
            models: [],
            currentModel: ''
          }
        }

        const models = await ollamaClient.listModels()
        const { getOllamaConfig } = await import('@/lib/ollama-config')
        const config = getOllamaConfig()

        return {
          available: true,
          models,
          currentModel: config.model
        }
      } catch (e) {
        console.error('获取Ollama状态失败:', e)
        return {
          available: false,
          models: [],
          currentModel: ''
        }
      }
    }),

  DeleteSurvey: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opt) => {
      try {
        const userId = opt.ctx.userId!
        const survey = await prisma.survey.update({
          where: {
            id: opt.input.id,
            ownerId: userId,
          },
          data: {
            deletedAt: new Date(),
          },
        })
        return survey
      } catch (e) {
        throw new TRPCError({
          message: '删除问卷失败',
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
        const survey = await prisma.survey.update({
          where: {
            id: opt.input.id,
            ownerId: userId,
          },
          data: {
            published: opt.input.published,
          },
        })
        return survey
      } catch (e) {
        throw new TRPCError({
          message: '发布问卷失败',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),

  /**
   * 创建问卷模版(from 现有的问卷)
   */
  SaveQuestionsToTemplate: protectedProcedure
    .input(z.object({
      question_id: z.string()
    }))
    .mutation(async (opt) => {
      const { question_id } = opt.input
      const userId = opt.ctx.userId!
      const survey = await prisma.survey.findUnique({
        where: {
          id: question_id
        }
      })
      if (!survey) {
        throw new TRPCError({
          message: '问卷不存在',
          code: 'NOT_FOUND',
        })
      }
      const questions = survey.questions!;
      const template = await prisma.surverTemplate.create({
        data: {
          name: survey.name,
          questions: questions,
          createdBy: userId,
        }
      })
      return template
    }),

  GetSurveyResponses: protectedProcedure
    .input(
      z.object({
        surveyId: z.string(),
        page: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async (opt) => {
      try {
        const userId = opt.ctx.userId!
        const page = opt.input.page || 1
        const limit = opt.input.limit || 10
        const skip = (page - 1) * limit

        // 验证问卷所有权
        const survey = await prisma.survey.findUnique({
          where: {
            id: opt.input.surveyId,
            ownerId: userId,
          },
        })

        if (!survey) {
          throw new TRPCError({
            message: '问卷不存在或无权限访问',
            code: 'NOT_FOUND',
          })
        }

        const [responses, total] = await Promise.all([
          prisma.questionnaires.findMany({
            where: {
              surveyId: opt.input.surveyId,
            },
            skip,
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          prisma.questionnaires.count({
            where: {
              surveyId: opt.input.surveyId,
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
      } catch (e) {
        if (e instanceof TRPCError) throw e
        throw new TRPCError({
          message: '获取问卷回复失败',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),


  GetSurveyTemplates: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1).optional(),
        limit: z.number().default(10).optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
      }),
    )
    .query(async (opt) => {
      try {
        const page = opt.input.page!;
        const limit = opt.input.limit!;
        const skip = (page - 1) * limit
        const [templates, total] = await Promise.all([
          prisma.surverTemplate.findMany({
            skip,
            take: limit,
          }),
          prisma.surverTemplate.count({})
        ])
        return {
          templates,
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      } catch (e) {
        throw new TRPCError({
          message: '获取模板列表失败',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),
  CreateSurveyByTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string()
    }))
    .mutation(async (opt) => {
      const { templateId } = opt.input
      const userId = opt.ctx.userId!
      const template = await prisma.surverTemplate.findFirst({
        where: {
          id: templateId
        }
      })
      if (!template) {
        throw new TRPCError({
          message: '模板不存在',
          code: 'NOT_FOUND',
        })
      }
      const survey = await prisma.survey.create({
        data: {
          ownerId: userId,
          name: template?.name,
          questions: template?.questions!,
          description: "",
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
    }),
  CreateApiKey: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        templateId: z.string().optional(),
        permissions: z.record(z.any()).optional(),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async (opt) => {
      try {
        const userId = opt.ctx.userId!
        const crypto = require('crypto')
        const key = crypto.randomBytes(32).toString('hex')

        const apiKey = await prisma.apiKey.create({
          data: {
            name: opt.input.name,
            key,
            templateId: opt.input.templateId,
            userId,
            permissions: JSON.stringify(opt.input.permissions || {}),
            expiresAt: opt.input.expiresAt,
          },
        })

        return { ...apiKey, key } // 只在创建时返回完整key
      } catch (e) {
        throw new TRPCError({
          message: '创建API密钥失败',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),

  GetApiKeys: protectedProcedure.query(async (opt) => {
    try {
      const userId = opt.ctx.userId!
      const apiKeys = await prisma.apiKey.findMany({
        where: {
          userId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          key: false, // 不返回完整key
          templateId: true,
          permissions: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          lastUsedAt: true,
          template: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      })

      return apiKeys
    } catch (e) {
      throw new TRPCError({
        message: '获取API密钥列表失败',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }
  }),

  DeleteApiKey: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async (opt) => {
      try {
        const userId = opt.ctx.userId!
        const apiKey = await prisma.apiKey.update({
          where: {
            id: opt.input.id,
            userId,
          },
          data: {
            isActive: false,
          },
        })
        return apiKey
      } catch (e) {
        throw new TRPCError({
          message: '删除API密钥失败',
          code: 'INTERNAL_SERVER_ERROR',
        })
      }
    }),

  // AI 服务配置相关路由
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
        const { config } = opt.input

        // 验证配置
        const validation = validateAIServiceConfig(config as AIServiceConfig)
        if (!validation.valid) {
          return { success: false, error: validation.errors.join(', ') }
        }

        // 创建 AI 服务实例
        const service = createAIService(config.type)

        // 测试连接
        const result = await service.testConnection(config as AIServiceConfig)

        return result
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
        const { config } = opt.input

        // 验证配置
        const validation = validateAIServiceConfig(config as AIServiceConfig)
        if (!validation.valid) {
          return {
            available: false,
            models: [],
            currentModel: '',
            error: validation.errors.join(', '),
          }
        }

        // 创建 AI 服务实例
        const service = createAIService(config.type)

        // 获取服务状态
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
        const { prompt, config } = opt.input

        // 验证配置
        const validation = validateAIServiceConfig(config as AIServiceConfig)
        if (!validation.valid) {
          throw new TRPCError({
            message: `配置验证失败: ${validation.errors.join(', ')}`,
            code: 'BAD_REQUEST',
          })
        }

        // 创建 AI 服务实例
        const service = createAIService(config.type)

        // 构建问卷生成提示
        const surveyPrompt = buildSurveyPrompt(prompt)

        // 生成问卷
        const result = await service.generate({
          prompt: surveyPrompt,
          config: config as AIServiceConfig,
        })

        return result
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
      const { prompt, config } = opt.input

      return observable<string>((emit) => {
        const generateStream = async () => {
          try {
            // 验证配置
            const validation = validateAIServiceConfig(config as AIServiceConfig)
            if (!validation.valid) {
              emit.error(new TRPCError({
                message: `配置验证失败: ${validation.errors.join(', ')}`,
                code: 'BAD_REQUEST',
              }))
              return
            }

            // 创建 AI 服务实例
            const service = createAIService(config.type)

            // 构建问卷生成提示
            const surveyPrompt = buildSurveyPrompt(prompt)

            // 流式生成问卷
            await service.generateStream(
              {
                prompt: surveyPrompt,
                config: config as AIServiceConfig,
              },
              (chunk) => {
                emit.next(chunk.content || chunk.text || '')
              }
            )

            emit.complete()
          } catch (error) {
            console.error('流式生成失败:', error)
            emit.error(new TRPCError({
              message: '流式生成失败',
              code: 'INTERNAL_SERVER_ERROR',
            }))
          }
        }

        generateStream()
      })
    }),

})

export type AppRouter = typeof appRouter
