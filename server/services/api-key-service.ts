import { PrismaClient } from '@prisma/client/edge'
import { TRPCError } from '@trpc/server'
import { withAccelerate } from '@prisma/extension-accelerate'
import * as crypto from 'crypto'

const prisma = new PrismaClient().$extends(withAccelerate())

export interface CreateApiKeyInput {
    name: string
    templateId?: string
    permissions?: Record<string, any>
    expiresAt?: Date
}

export interface ApiKeyInfo {
    id: string
    name: string
    key: string
    templateId?: string
    userId: string
    permissions: string
    isActive: boolean
    expiresAt?: Date
    createdAt: Date
    lastUsedAt?: Date
    template?: {
        id: string
        name: string
    }
}

export interface ApiKeyListResult {
    apiKeys: Omit<ApiKeyInfo, 'key'>[]
}

export class ApiKeyService {
    /**
     * 创建API密钥
     */
    async createApiKey(userId: string, input: CreateApiKeyInput): Promise<ApiKeyInfo> {
        try {
            // 生成随机密钥
            const key = crypto.randomBytes(32).toString('hex')

            // 创建API密钥记录
            const apiKey = await prisma.apiKey.create({
                data: {
                    name: input.name,
                    key,
                    templateId: input.templateId,
                    userId,
                    permissions: JSON.stringify(input.permissions || {}),
                    expiresAt: input.expiresAt,
                },
                include: {
                    template: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            })

            return {
                ...apiKey,
                permissions: apiKey.permissions as string,
            }
        } catch (error) {
            console.error('创建API密钥失败:', error)
            throw new TRPCError({
                message: '创建API密钥失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 获取API密钥列表
     */
    async getApiKeys(userId: string): Promise<ApiKeyListResult> {
        try {
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

            return {
                apiKeys: apiKeys.map(key => ({
                    ...key,
                    permissions: key.permissions as string,
                }))
            }
        } catch (error) {
            console.error('获取API密钥列表失败:', error)
            throw new TRPCError({
                message: '获取API密钥列表失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 删除API密钥（软删除）
     */
    async deleteApiKey(userId: string, apiKeyId: string): Promise<any> {
        try {
            const apiKey = await prisma.apiKey.update({
                where: {
                    id: apiKeyId,
                    userId,
                },
                data: {
                    isActive: false,
                }
            })
            return apiKey
        } catch (error) {
            console.error('删除API密钥失败:', error)
            throw new TRPCError({
                message: '删除API密钥失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 验证API密钥
     */
    async validateApiKey(apiKey: string): Promise<{
        valid: boolean
        userId?: string
        templateId?: string
        permissions?: Record<string, any>
        expiresAt?: Date
    }> {
        try {
            const keyRecord = await prisma.apiKey.findFirst({
                where: {
                    key: apiKey,
                    isActive: true,
                }
            })

            if (!keyRecord) {
                return { valid: false }
            }

            // 检查是否过期
            if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
                return { valid: false }
            }

            // 更新最后使用时间
            await prisma.apiKey.update({
                where: { id: keyRecord.id },
                data: { lastUsedAt: new Date() }
            })

            return {
                valid: true,
                userId: keyRecord.userId,
                templateId: keyRecord.templateId || undefined,
                permissions: JSON.parse(keyRecord.permissions as string),
                expiresAt: keyRecord.expiresAt || undefined,
            }
        } catch (error) {
            console.error('验证API密钥失败:', error)
            return { valid: false }
        }
    }

    /**
     * 获取API密钥详情
     */
    async getApiKeyDetail(userId: string, apiKeyId: string): Promise<ApiKeyInfo | null> {
        try {
            const apiKey = await prisma.apiKey.findFirst({
                where: {
                    id: apiKeyId,
                    userId,
                },
                include: {
                    template: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            })

            if (!apiKey) return null

            return {
                ...apiKey,
                permissions: apiKey.permissions as string,
            }
        } catch (error) {
            console.error('获取API密钥详情失败:', error)
            throw new TRPCError({
                message: '获取API密钥详情失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    /**
     * 更新API密钥
     */
    async updateApiKey(
        userId: string,
        apiKeyId: string,
        input: Partial<CreateApiKeyInput>
    ): Promise<ApiKeyInfo> {
        try {
            // 验证API密钥所有权
            const existingKey = await prisma.apiKey.findFirst({
                where: {
                    id: apiKeyId,
                    userId,
                }
            })

            if (!existingKey) {
                throw new TRPCError({
                    message: 'API密钥不存在或无权限修改',
                    code: 'NOT_FOUND',
                })
            }

            // 更新API密钥
            const updateData: any = {}

            if (input.name) {
                updateData.name = input.name
            }

            if (input.templateId !== undefined) {
                updateData.templateId = input.templateId
            }

            if (input.permissions !== undefined) {
                updateData.permissions = JSON.stringify(input.permissions)
            }

            if (input.expiresAt !== undefined) {
                updateData.expiresAt = input.expiresAt
            }

            const updatedKey = await prisma.apiKey.update({
                where: { id: apiKeyId },
                data: updateData,
                include: {
                    template: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            })

            return {
                ...updatedKey,
                permissions: updatedKey.permissions as string,
            }
        } catch (error) {
            if (error instanceof TRPCError) throw error

            console.error('更新API密钥失败:', error)
            throw new TRPCError({
                message: '更新API密钥失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }
}

export const apiKeyService = new ApiKeyService()
