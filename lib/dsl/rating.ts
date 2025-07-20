import { QuestionSchema } from './base'
import { z } from 'zod'

export const RatingQuestionSchema = QuestionSchema.extend({
    type: z.enum(['rating']),
    props: z
        .object({
            maxRating: z.number().optional().default(5),
            ratingType: z.enum(['star', 'number', 'heart']).optional().default('star'),
            minLabel: z.string().optional().default('非常不认同'),
            maxLabel: z.string().optional().default('非常认同'),
            showLabels: z.boolean().optional().default(true),
            description: z.string().optional(),
        })
        .optional(),
    validate: z
        .object({
            required: z.boolean().optional(),
            min: z.number().optional(),
            max: z.number().optional(),
        })
        .optional(),
})

export type RatingQuestionSchemaType = z.infer<typeof RatingQuestionSchema> 