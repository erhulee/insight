import React from 'react'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { notFound } from 'next/navigation'
import { SurveyClient } from './survey-client'
import type { Question } from '@/lib/api-types'

const prisma = new PrismaClient().$extends(withAccelerate())

interface SurveyPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function SurveyPage({ params }: SurveyPageProps) {
    const resolvedParams = await params

    try {
        // 从数据库获取问卷数据
        const survey = await prisma.survey.findUnique({
            where: {
                id: resolvedParams.id,
            }
        })
        console.log("survey:", survey)


        if (!survey) {
            notFound()
        }

        // 转换questions字段类型
        const questions: Question[] = typeof survey.questions == "object" ? survey.questions as unknown as Question[] : JSON.parse(survey.questions as string) as Question[]

        // 将数据传递给客户端组件
        return <SurveyClient survey={{
            id: survey.id,
            name: survey.name,
            description: survey.description,
            questions: questions
        }} />

    } catch (error) {
        console.error('获取问卷失败:', error)
        notFound()
    }
}
