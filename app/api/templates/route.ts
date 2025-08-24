import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'

const prisma = new PrismaClient()

// 获取当前用户ID
async function getCurrentUserId() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('session')?.value
        if (!token) {
            throw new Error('No session token')
        }
        const payload: any = await decrypt(token)
        return payload.userId
    } catch (error) {
        throw new Error('Unauthorized')
    }
}

// 模板创建验证schema
const createTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required'),
    description: z.string().optional(),
    content: z.record(z.any()),
    config: z.record(z.any()).optional(),
    tags: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().optional(),
})

// 模板更新验证schema
const updateTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    content: z.record(z.any()).optional(),
    config: z.record(z.any()).optional(),
    tags: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().optional(),
    isActive: z.boolean().optional(),
})

// GET /api/templates - 获取模板列表
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const category = searchParams.get('category')
        const tags = searchParams.get('tags')
        const isPublic = searchParams.get('isPublic')

        const skip = (page - 1) * limit

        // 构建查询条件
        const where: any = { isActive: true }

        if (category) {
            where.category = category
        }

        if (tags) {
            where.tags = { contains: tags }
        }

        if (isPublic !== null) {
            where.isPublic = isPublic === 'true'
        }

        // 获取模板列表
        const [templates, total] = await Promise.all([
            prisma.renderTemplate.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    tags: true,
                    category: true,
                    version: true,
                    isPublic: true,
                    createdAt: true,
                    updatedAt: true,
                    creator: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            }),
            prisma.renderTemplate.count({ where })
        ])

        return NextResponse.json({
            success: true,
            data: templates,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Get templates error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/templates - 创建模板
export async function POST(request: NextRequest) {
    try {
        const userId = await getCurrentUserId()
        const body = await request.json()

        // 验证请求数据
        const validatedData = createTemplateSchema.parse(body)

        // 创建模板
        const template = await prisma.renderTemplate.create({
            data: {
                ...validatedData,
                createdBy: userId,
                config: validatedData.config || {},
                tags: validatedData.tags || '',
                category: validatedData.category || 'default',
                isPublic: validatedData.isPublic || false
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: template,
            message: 'Template created successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Create template error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 