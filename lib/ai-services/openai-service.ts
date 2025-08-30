import { AIService, AIGenerationRequest, AIGenerationResponse, AIGenerationStreamResponse, AIServiceStatus } from '../ai-service-interface'
import { AIServiceConfig } from '../ai-service-config'
import OpenAI from 'openai';

export class OpenAIService implements AIService {
    async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options?.temperature ?? config.temperature,
                    top_p: options?.topP ?? config.topP,
                    max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                    stream: false,
                }),
            })

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const choice = data.choices[0]

            return {
                content: choice.message.content,
                usage: data.usage,
                model: data.model,
                finishReason: choice.finish_reason,
            }
        } catch (error) {
            throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async generateStream(
        request: AIGenerationRequest,
        onChunk: (chunk: AIGenerationStreamResponse) => void
    ): Promise<void> {
        const { prompt, config, options } = request

        try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: options?.temperature ?? config.temperature,
                    top_p: options?.topP ?? config.topP,
                    max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                    stream: true,
                }),
            })

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('Failed to get response reader')
            }

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') {
                            onChunk({
                                content: '',
                                isComplete: true,
                                model: config.model,
                            })
                            return
                        }

                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.choices?.[0]?.delta?.content) {
                                onChunk({
                                    content: parsed.choices[0].delta.content,
                                    isComplete: false,
                                    model: parsed.model,
                                })
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            throw new Error(`OpenAI stream generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async testConnection(config: AIServiceConfig): Promise<{ success: boolean; error?: string }> {
        // console.log("testConnection:", config)
        // try {
        //     const response = await fetch(`${config.baseUrl}/models`, {
        //         headers: {
        //             'Authorization': `Bearer ${config.apiKey}`,
        //         },
        //     })

        //     if (!response.ok) {
        //         return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
        //     }

        //     return { success: true }
        // } catch (error) {
        //     return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        // }
        console.log("process.env.ARK_API_KEY:", process.env.ARK_API_KEY)
        const openai = new OpenAI({
            apiKey: process.env.ARK_API_KEY,
            baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
        });
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'text', text: `
                            你是一个专业的问卷设计专家。请根据用户的需求生成一个完整的问卷
请按照以下JSON格式生成问卷，确保格式完全正确：

{
  "title": "问卷标题",
  "description": "问卷描述",
  "questions": [
    {
      "id": "unique_id_1",
      "type": "single",
      "title": "问题标题",
      "description": "问题描述（可选）",
      "required": true,
      "pageSize": 1,
      "props": {
        "options": [
          {
            "label": "选项1",
            "value": "value1",
            "id": "option1"
          },
          {
            "label": "选项2",
            "value": "value2",
            "id": "option2"
          }
        ]
      }
    }
  ]
}

问题类型说明：
- "single": 单选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "multiple": 多选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "rating": 评价打分 - 包含props.maxRating（最高分值，默认5）、props.ratingType（评分类型：star/number/heart）、props.minLabel（最低分标签）、props.maxLabel（最高分标签）
- "textarea": 文本域 - 不需要options
- "input": 文本输入 - 不需要options

选项格式要求：
- label: 选项显示文本
- value: 选项值（英文或数字）
- id: 唯一标识符（英文或数字）

请确保：
1. 生成4-6个问题，避免问卷过长
2. 问题类型多样化，包含选择类、文本类和评分类问题
3. 问题逻辑合理，符合问卷目的
4. 每个问题都有唯一的id
5. 所有问题都设置pageSize为1
6. 单选题和多选题必须包含完整的options数组
7. 每个选项都有label、value、id三个字段
8. 评分题包含合适的props配置（maxRating、ratingType、minLabel、maxLabel）
9. 只返回纯JSON格式，不要markdown代码块标记（如\`\`\`json），不要其他文字

现在请生成问卷：` },
                    ],
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: '生成一个关于广告举报页面交互体验的问卷' },
                    ],
                },
            ],
            model: 'doubao-seed-1-6-250615',
        });
        console.log("response:", response.choices[0]?.message.content)
        return { success: true }
    }

    async getStatus(config: AIServiceConfig): Promise<AIServiceStatus> {
        try {
            const response = await fetch(`${config.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
            })

            if (!response.ok) {
                return {
                    available: false,
                    models: [],
                    currentModel: '',
                    error: `HTTP ${response.status}: ${response.statusText}`,
                }
            }

            const data = await response.json()
            const models = data.data?.map((model: any) => model.id) || []

            return {
                available: true,
                models,
                currentModel: config.model,
            }
        } catch (error) {
            return {
                available: false,
                models: [],
                currentModel: '',
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
}
