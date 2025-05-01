import { procedure, router } from "./trpc";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { PrismaClient } from '@prisma/client'
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const prisma = new PrismaClient();
const getUid = async () => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        const userId: string = payload['userId']
        return userId
    } catch (e) {
        throw new Error("未登录")
    }
}
export const appRouter = router({
    GetUserInfo: procedure.query(async () => {
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        if (!payload) {
            return null
        } else {
            const userId: string = payload['userId']
            return await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
        }
    }),
    UpdateUserInfo: procedure.input(z.object({
        name: z.string().optional(),
        current_password: z.string().optional(),
        password: z.string().optional(),
    })).mutation(async (opt) => {
        const uid = await getUid()
        const { name, password, current_password } = opt.input;
        if (name) {
            const user = await prisma.user.update({
                where: {
                    id: uid
                },
                data: {
                    username: name
                }
            })
            if (user == null) return false
        }
        if (password && current_password) {
            const user = await prisma.user.update({
                where: {
                    id: uid,
                    password: current_password
                },
                data: {
                    password: password
                }
            })
            if (user == null) return false
        }
        return true
    }),
    SaveSurvey: procedure.input(z.object({
        id: z.string(),
        questions: z.any()
    })).mutation(async (opt) => {
        try {
            const response = await prisma.survey.update({
                where: {
                    id: opt.input.id
                },
                data: {
                    questions: opt.input.questions
                }
            })
            return response
        } catch (e) {
            throw new TRPCError({
                message: "保存失败",
                code: "INTERNAL_SERVER_ERROR"
            })
        }
    }),
    GetSurvey: procedure.input(z.object({
        id: z.string(),
    })).query(async (opt) => {
        try {
            const userId = await getUid()
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
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        if (payload == null) {
            throw new TRPCError({
                message: "未登录",
                code: "UNAUTHORIZED"
            })
        }
        const userId: string = payload['userId']
        const surveyList = await prisma.survey.findMany({
            where: {
                ownerId: userId
            }
        })
        const _questions = (question: string | object) => {
            if (typeof question === "string") {
                return JSON.parse(question)
            } else {
                return question
            }
        }
        return surveyList.map(item => ({
            ...item,
            questions: _questions(item.questions ?? [])
        }))
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
                questions: JSON.stringify([])
            }
        })
        return survey
    }),
    DeleteSurvey: procedure.input(z.object({
        id: z.string(),
    })).mutation(async (opt) => {
        const { id } = opt.input;
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        const userId: string = payload['userId']
        const ok = await prisma.survey.delete({
            where: {
                ownerId: userId,
                id: id
            }
        })
        return Boolean(ok)
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;