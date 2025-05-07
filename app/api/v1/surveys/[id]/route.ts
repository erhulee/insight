import { type NextRequest, NextResponse, } from "next/server"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// 获取单个问卷
type GetSurverParams = Promise<{
  id: string
}>
export async function GET(request: NextRequest, context: { params: GetSurverParams }) {
  const { id } = await context.params
  const surver = await prisma.survey.findUnique({
    where: {
      id
    }
  })
  if (surver == null) {
    return NextResponse.json({ error: "问卷不存在" }, { status: 404 })
  }
  if (!surver.published) {
    return NextResponse.json({ error: "问卷未公开" }, { status: 404 })
  }
  return NextResponse.json({ data: surver })
}

/**
 * 提交
 * @param request 
 * @param context 
 */
export type SubmitSurveyBody = {
  answers: {
    key: string,
    value: string
  }[]
}
export async function POST(request: NextRequest, context: { params: GetSurverParams }) {
  const { id } = await context.params
  const body = await request.json() as SubmitSurveyBody;
  const data = await prisma.questionnaires.create({
    data: {
      surveyId: id,
      Question: body.answers
    }
  })
  return NextResponse.json({ data })
}

