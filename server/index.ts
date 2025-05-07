import { procedure, router } from "./trpc";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
const { PrismaClient, Questionnaires } = require('@prisma/client');
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
        throw new TRPCError({
            message: "未登录",
            code: "UNAUTHORIZED"
        })
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
    SubmitSurver: procedure.input(z.object({
        surveyId: z.string(),
        values: z.any(),
    })).mutation(async (opt) => {
        try {
            const survey = await prisma.questionnaires.create({
                data: {
                    surveyId: opt.input.surveyId,
                    Question: opt.input.values,
                    createdAt: new Date(),
                }
            })
            return survey
        } catch (e) {
            console.log(e)
            throw new TRPCError({
                message: "提交失败",
                code: "INTERNAL_SERVER_ERROR"
            })
        }

    }),
    SaveSurvey: procedure.input(z.object({
        id: z.string(),
        questions: z.any(),
        pageCnt: z.number(),
    })).mutation(async (opt) => {
        try {
            const response = await prisma.survey.update({
                where: {
                    id: opt.input.id
                },
                data: {
                    questions: opt.input.questions,
                    pageCount: opt.input.pageCnt
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
                survey.questions = JSON.parse(survey.questions ?? "[]") as any[] // TODO: 类型不匹配，需要修复，暂时先这样用着，后面再改
                return survey
            } else {
                return null
            }
        } catch (e) {
            console.log(e)
            return null
        }
    }),
    GetSurveyResult: procedure.input(z.object({
        id: z.string(),
    })).query(async (opt) => {
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
        const survey = await prisma.survey.findFirst({
            where: {
                ownerId: userId,
                id: opt.input.id
            }
        })
        if (survey == null) {
            throw new TRPCError({
                message: "问卷不存在",
                code: "NOT_FOUND"
            })
        }
        //@ts-ignore
        survey.questions = JSON.parse(survey.questions ?? "[]") // TODO: 类型不匹配，需要修复，暂时先这样用着，后面再改
        let questionnaires: Questionnaires[] = []
        try {
            questionnaires = await prisma.questionnaires.findMany({
                where: {
                    surveyId: opt.input.id,
                    // 近30天
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                        lte: new Date()
                    }
                }
            })
        } catch { }


        // 计算按小时的回复个数趋势数据
        const hourlyTrend = questionnaires.reduce((acc, curr) => {
            const date = new Date(curr.createdAt);
            const hour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // 填充缺失的小时段
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = new Date();
        for (let d = startDate; d <= endDate; d.setHours(d.getHours() + 1)) {
            const hour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
            if (!hourlyTrend[hour]) {
                hourlyTrend[hour] = 0;
            }
        }
        const trendList = Object.entries(hourlyTrend).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return {
            survey,
            questionnaires,
            trendList
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
        const _questions = (question: string | any) => {
            if (typeof question === "string") {
                return JSON.parse(question)
            } else {
                return question
            }
        }
        const transformList = await Promise.all(surveyList.map(async item => {
            let questionnairesInfo: Array<Questionnaires> = []
            try {
                questionnairesInfo = await prisma.questionnaires.findMany({
                    where: {
                        surveyId: item.id
                    }
                });
            } catch { }
            return {
                ...item,
                questions: _questions(item.questions ?? []),
                questionnairesCnt: questionnairesInfo.length
            }
        }))
        return transformList
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

        try {
            const survey = await prisma.survey.create({
                data: {
                    ownerId: userId,
                    name: name,
                    description: description,
                    questions: JSON.stringify([]),
                    pageCount: 1
                }
            })
            return survey
        } catch (e) {
            console.log("err:", e)
            throw new TRPCError({
                message: "创建失败",
                code: "INTERNAL_SERVER_ERROR"
            })
        }
    }),
    InsertSurveyNewPage: procedure.input(z.object({
        id: z.string(),
    })).mutation(async (opt) => {
        const { id } = opt.input;
        const cookieStore = await cookies()
        const token = cookieStore.get("session")?.value
        const payload: any = await decrypt(token)
        const userId: string = payload['userId']
        const survey = await prisma.survey.update({
            where: {
                ownerId: userId,
                id: id
            },
            data: {
                pageCount: {
                    increment: 1
                }
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