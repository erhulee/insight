'use server'

import { createSession, deleteSession } from '@/lib/session'
const { PrismaClient } = require('@prisma/client')
import { redirect } from 'next/navigation'
const prisma = new PrismaClient()
// app/actions.js
export async function create(account: string, password: string, username: string) {

  // 先看看这个账号是否已经有了
  const User = await prisma.user.create({
    data: {
      account: account,
      password: password,
      username: username,
    },
  })
  await createSession(User.id)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
}
