import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'

const prisma = new PrismaClient()

// 验证API密钥
async function validateApiKey(apiKey: string, templateId: string) {
    const key = await prisma.apiKey.findUnique({
        where: {
            key: apiKey,
            isActive: true,
            templateId: templateId
        }
    })

    if (!key) {
        return false
    }

    // 检查是否过期
    if (key.expiresAt && key.expiresAt < new Date()) {
        return false
    }

    // 更新最后使用时间
    await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() }
    })

    return true
}

// GET /api/templates/[id] - 获取模板信息
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const templateId = params.id
        const apiKey = request.headers.get('x-api-key')

        // 获取模板
        const template = await prisma.renderTemplate.findUnique({
            where: { id: templateId, isActive: true },
            include: {
                configs: {
                    where: { isDefault: true },
                    take: 1
                },
                creator: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        })

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found or inactive' },
                { status: 404 }
            )
        }

        // 检查访问权限
        if (!template.isPublic) {
            if (!apiKey) {
                return NextResponse.json(
                    { error: 'API key required for private template' },
                    { status: 401 }
                )
            }

            const isValidKey = await validateApiKey(apiKey, templateId)
            if (!isValidKey) {
                return NextResponse.json(
                    { error: 'Invalid or expired API key' },
                    { status: 401 }
                )
            }
        }

        // 返回模板信息（不包含敏感内容）
        const templateInfo = {
            id: template.id,
            name: template.name,
            description: template.description,
            version: template.version,
            category: template.category,
            tags: template.tags,
            isPublic: template.isPublic,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
            creator: template.creator,
            defaultConfig: template.configs[0]?.config || template.config
        }

        return NextResponse.json({
            success: true,
            data: templateInfo
        })

    } catch (error) {
        console.error('Get template error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 