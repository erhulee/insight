'use server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
export async function submit(id: string, values: Record<string, any>) {
    try {
        const survey = await prisma.questionnaires.create({
            data: {
                surveyId: id,
                Question: values
            }
        })
        return survey
    } catch (e) {
        console.log("error:", e)
        return false
    }
}