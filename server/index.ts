import { procedure, router } from "./trpc";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { PrismaClient } from '@prisma/client'
import { z } from "zod";

const prisma = new PrismaClient();
export const appRouter = router({
    GetUserInfo: procedure.query(async (...args) => {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        const userId: string = payload['userId']
        return await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
    }),
    GetSurvey: procedure.input(z.object({
        id: z.string(),
    })).query(async (opt) => {
        try {
            const cookieStore = await cookies()
            const token = cookieStore.get("session")?.value
            const payload: any = await decrypt(token)
            const userId: string = payload['userId']
            const survey = await prisma.survey.findUnique({
                where: {
                    ownerId: userId,
                    id: opt.input.id
                }
            })
            if (survey) {
                return {
                    ...survey,
                    questions: JSON.parse(survey.questions ?? "[]")
                }
            } else {
                return null
            }
        } catch (e) {
            console.log(e)
            return null
        }
    }),
    GetSurveyList: procedure.query(async () => {
        try {
            const cookieStore = await cookies()
            const token = cookieStore.get("session")?.value
            const payload: any = await decrypt(token)
            const userId: string = payload['userId']
            const surveyList = await prisma.survey.findMany({
                where: {
                    ownerId: userId
                }
            })
            return surveyList.map(item => ({
                ...item,
                questions: JSON.parse(item.questions ?? "[]")
            }))
        } catch (e) {
            console.log(e)
            return []
        }
    }),
    CreateSurvey: procedure.input(z.object({
        name: z.string().optional(),
        description: z.string().optional(),
    })).mutation(async (opt) => {
        const { name = "未命名", description = "" } = opt.input;
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        const userId: string = payload['userId']
        const survey = await prisma.survey.create({
            data: {
                ownerId: userId,
                name: name,
                description: description,
            }
        })
        return survey
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;