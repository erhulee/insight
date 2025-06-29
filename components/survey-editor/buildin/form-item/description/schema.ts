import { QuestionSchema } from "@/lib/dsl";
import { IFormItemMeta } from "../core/type";
import { MessageCircleQuestion } from "lucide-react"
import { z } from "zod";

export const DescriptionSchema = QuestionSchema.extend({
    type: z.enum(["description"]),
    props: z.object({
        content: z.string().optional(),
    })
})
export const DescriptionMeta: IFormItemMeta<typeof DescriptionSchema> = {
    icon: MessageCircleQuestion,
    title: "文本描述",
    type: "description",
    schema: DescriptionSchema,
}

export type DescriptionSchemaType = z.infer<typeof DescriptionSchema>