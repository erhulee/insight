'use server'
import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient()
export async function publish(id: string) {
  try {
    const survey = await prisma.survey.update({
      where: {
        id,
      },
      data: {
        published: true,
      },
    })
    return survey.published
  } catch (e) {
    console.log('error:', e)
    return false
  }
}

export async function unpublish(id: string) {
  console.log('unpublish', id)
  try {
    const survey = await prisma.survey.update({
      where: {
        id,
      },
      data: {
        published: false,
      },
    })
    return survey.published == false
  } catch (e) {
    console.log('error:', e)
    return false
  }
}
