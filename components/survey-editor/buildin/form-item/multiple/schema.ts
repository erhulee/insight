import { CircleCheckBig } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { QuestionSchema } from '@/lib/dsl'
import { z } from 'zod'

export const MultipleQuestionSchema = QuestionSchema.extend({
    type: z.enum(['multiple']),
    props: z
        .object({
            options: z
                .array(
                    z.object({
                        id: z.string(),
                        label: z.string(),
                        value: z.string(),
                    }),
                )
                .optional()
                .default([
                    {
                        id: "multiple-option-1",
                        label: '选项1',
                        value: 'value1',
                    },
                ]),
        })
})
export type MultipleQuestionSchemaType = z.infer<typeof MultipleQuestionSchema>


export const MultipleMeta: IFormItemMeta<typeof MultipleQuestionSchema> = {
    icon: CircleCheckBig,
    title: '多选题',
    type: 'multiple',
    schema: MultipleQuestionSchema,
}
