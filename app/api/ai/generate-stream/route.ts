import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
    try {
        // 验证用户身份
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: '未授权' }, { status: 401 })
        }

        const { prompt } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: '缺少提示词' }, { status: 400 })
        }

        // 设置SSE响应头
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 导入必要的模块
                    const { ollamaClient } = await import('@/server/ollama-client')
                    const { buildSurveyPrompt } = await import('@/server/ai-service')

                    const aiPrompt = buildSurveyPrompt(prompt)

                    // 发送开始标记
                    controller.enqueue(encoder.encode('data: [START]\n\n'))

                    // 使用流式生成
                    await ollamaClient.generateStream(aiPrompt, 'qwen2.5:1.5b', (chunk: string) => {
                        // 发送数据块
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
                    })

                    // 发送结束标记
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))

                    controller.close()
                } catch (error) {
                    console.error('Stream generation failed:', error)
                    controller.enqueue(encoder.encode(`data: [ERROR] ${JSON.stringify({ error: '生成失败' })}\n\n`))
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        })
    } catch (error) {
        console.error('SSE API error:', error)
        return NextResponse.json({ error: '服务器错误' }, { status: 500 })
    }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
} 