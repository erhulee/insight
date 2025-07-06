import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'

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

// 记录渲染日志
async function logRender(templateId: string, apiKeyId: string | null, requestData: any, responseData: any, renderTime: number, status: string, errorMessage?: string, ipAddress?: string, userAgent?: string) {
    try {
        await prisma.renderLog.create({
            data: {
                templateId,
                apiKeyId,
                requestData,
                responseData,
                renderTime,
                status,
                errorMessage,
                ipAddress,
                userAgent
            }
        })
    } catch (error) {
        console.error('Failed to log render:', error)
    }
}

// 动态渲染模板
async function renderTemplate(template: any, data: any, config: any) {
    try {
        // 这里实现模板渲染逻辑
        // 可以根据模板内容动态生成React组件或HTML
        const renderedContent = {
            template: template.content,
            data: data,
            config: config,
            renderedAt: new Date().toISOString(),
            // 可以返回HTML、JSON或其他格式
            html: `<div class="rendered-template">Template: ${template.name}</div>`,
            json: {
                templateId: template.id,
                templateName: template.name,
                data: data,
                config: config
            }
        }

        return {
            success: true,
            data: renderedContent
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// GET /api/render - 渲染模板
export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        const { searchParams } = new URL(request.url)
        const templateId = searchParams.get('templateId')
        const apiKey = request.headers.get('x-api-key')
        const format = searchParams.get('format') || 'json' // json, html
        const userAgent = request.headers.get('user-agent')
        const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

        // 验证参数
        if (!templateId) {
            return NextResponse.json(
                { error: 'Missing templateId parameter' },
                { status: 400 }
            )
        }

        // 获取模板
        const template = await prisma.renderTemplate.findUnique({
            where: { id: templateId, isActive: true },
            include: {
                configs: {
                    where: { isDefault: true },
                    take: 1
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

        // 获取请求数据
        const data = Object.fromEntries(searchParams.entries())
        delete data.templateId // 移除templateId参数
        delete data.format // 移除format参数

        // 获取默认配置
        const defaultConfig = template.configs[0]?.config || template.config

        // 渲染模板
        const renderResult = await renderTemplate(template, data, defaultConfig)

        const totalTime = Date.now() - startTime

        // 记录日志
        await logRender(
            templateId,
            apiKey ? apiKey : null,
            data,
            renderResult.success && renderResult.data ? renderResult.data : null,
            totalTime,
            renderResult.success ? 'success' : 'error',
            renderResult.success ? undefined : renderResult.error,
            ipAddress || undefined,
            userAgent || undefined
        )

        if (renderResult.success && renderResult.data) {
            // 根据format参数返回不同格式
            if (format === 'html') {
                return new NextResponse(renderResult.data.html, {
                    headers: { 'Content-Type': 'text/html' }
                })
            } else {
                return NextResponse.json({
                    success: true,
                    data: renderResult.data,
                    template: {
                        id: template.id,
                        name: template.name,
                        version: template.version
                    }
                })
            }
        } else {
            return NextResponse.json(
                { error: renderResult.error },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Render API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/render - 提交数据
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const apiKey = request.headers.get('x-api-key')

        // 验证请求体
        const schema = z.object({
            templateId: z.string(),
            data: z.record(z.any()),
            sessionId: z.string().optional()
        })

        const validatedData = schema.parse(body)

        // 检查模板是否存在
        const template = await prisma.renderTemplate.findUnique({
            where: { id: validatedData.templateId, isActive: true }
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

            const isValidKey = await validateApiKey(apiKey, validatedData.templateId)
            if (!isValidKey) {
                return NextResponse.json(
                    { error: 'Invalid or expired API key' },
                    { status: 401 }
                )
            }
        }

        // 生成会话ID
        const sessionId = validatedData.sessionId || crypto.randomUUID()

        // 保存数据
        const collection = await prisma.dataCollection.create({
            data: {
                templateId: validatedData.templateId,
                sessionId,
                data: validatedData.data,
                metadata: {
                    timestamp: new Date().toISOString(),
                    apiKeyUsed: !!apiKey
                }
            }
        })

        return NextResponse.json({
            success: true,
            sessionId,
            collectionId: collection.id,
            message: 'Data collected successfully'
        })

    } catch (error) {
        console.error('Data collection error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 