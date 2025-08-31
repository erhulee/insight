import { z } from 'zod'

// 封面配置的 Zod 验证模式
export const CoverConfigSchema = z.object({
    estimatedTime: z.string().optional(),
    coverDescription: z.string().optional(),
    privacyNotice: z.string().optional(),
    bottomNotice: z.string().optional(),
    coverIcon: z.string().optional(),
    coverColor: z.string().optional(),
    showProgressInfo: z.boolean().optional(),
    showPrivacyNotice: z.boolean().optional(),
})

// 基本设置的 Zod 验证模式
export const BasicSettingsSchema = z.object({
    display_no: z.boolean().optional(),
    order_random: z.boolean().optional(),
    surver_name: z.string().optional(),
    surver_description: z.string().optional(),
    surver_cover: z.string().optional(),
})

// 导出类型
export type CoverConfig = z.infer<typeof CoverConfigSchema>
export type BasicSettings = z.infer<typeof BasicSettingsSchema>
