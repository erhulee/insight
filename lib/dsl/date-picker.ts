import { z } from "zod";
import { QuestionSchema } from "./base";

export const DatePickerQuestionSchema = QuestionSchema.extend({
    type: z.enum(['date']),
    props: z.object({
        range: z.boolean().default(false),
        format: z.enum(['date', 'datetime', 'time']).default('date'),
        max: z.date().optional(),
        min: z.date().optional(),
    })
})

export type DatePickerQuestionSchemaType = z.infer<typeof DatePickerQuestionSchema>