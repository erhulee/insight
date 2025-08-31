import { PrismaClient } from '@prisma/client/edge'
import { TRPCError } from '@trpc/server'
import { createSession, deleteSession } from '@/lib/session'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

export interface CreateUserInput {
    account: string
    password: string
    username: string
}

export interface UpdateUserInput {
    name?: string
    current_password?: string
    password?: string
}

export interface UserInfo {
    id: string
    account: string
    username: string
    createdAt: Date
    updatedAt: Date
}

export class UserService {
    async register(input: CreateUserInput): Promise<UserInfo> {
        try {
            const existingUser = await prisma.user.findFirst({
                where: { account: input.account }
            })

            if (existingUser) {
                throw new TRPCError({
                    message: '账号已存在',
                    code: 'CONFLICT',
                })
            }

            const user = await prisma.user.create({
                data: {
                    account: input.account,
                    password: input.password,
                    username: input.username,
                },
            })

            return {
                id: user.id,
                account: user.account,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        } catch (error) {
            if (error instanceof TRPCError) throw error
            throw new TRPCError({
                message: '注册失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    async createUser(input: CreateUserInput): Promise<{ user: UserInfo; token: string }> {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { account: input.account }
            })

            if (existingUser) {
                throw new TRPCError({
                    message: '账号已存在',
                    code: 'CONFLICT',
                })
            }

            const user = await prisma.user.create({
                data: {
                    account: input.account,
                    password: input.password,
                    username: input.username,
                },
            })

            const token = await createSession(user.id)

            return {
                user: {
                    id: user.id,
                    account: user.account,
                    username: user.username,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token
            }
        } catch (error) {
            if (error instanceof TRPCError) throw error
            throw new TRPCError({
                message: '注册失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    async logout(userId: string): Promise<{ success: boolean }> {
        try {
            await deleteSession(userId)
            return { success: true }
        } catch (error) {
            throw new TRPCError({
                message: '登出失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    async getUserInfo(userId: string): Promise<UserInfo | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            })

            if (!user) return null

            return {
                id: user.id,
                account: user.account,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        } catch (error) {
            throw new TRPCError({
                message: '获取用户信息失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }

    async validateToken(token: string): Promise<UserInfo | null> {
        try {
            const { decrypt } = await import('@/lib/session')
            const payload = await decrypt(token)

            if (!payload) return null

            const userId = payload.userId as string
            if (!userId) return null

            return await this.getUserInfo(userId)
        } catch (error) {
            return null
        }
    }

    async updateUserInfo(userId: string, input: UpdateUserInput): Promise<boolean> {
        try {
            const updateData: any = {}

            if (input.name) {
                updateData.username = input.name
            }

            if (input.password && input.current_password) {
                const user = await prisma.user.findFirst({
                    where: {
                        id: userId,
                        password: input.current_password,
                    }
                })

                if (!user) {
                    throw new TRPCError({
                        message: '当前密码错误',
                        code: 'BAD_REQUEST',
                    })
                }

                updateData.password = input.password
            }

            if (Object.keys(updateData).length === 0) {
                return false
            }

            await prisma.user.update({
                where: { id: userId },
                data: updateData
            })

            return true
        } catch (error) {
            if (error instanceof TRPCError) throw error
            throw new TRPCError({
                message: '更新失败',
                code: 'INTERNAL_SERVER_ERROR',
            })
        }
    }
}

export const userService = new UserService()
