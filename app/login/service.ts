'use server'

import { createSession, decrypt, deleteSession } from '@/lib/session';
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
const prisma = new PrismaClient();
// app/actions.js
export async function create(account: string, password: string, username: string) {
    const User = await prisma.user.create({
        data: {
            account: account,
            password: password,
            username: username
        }
    })
    await createSession(User.id)
    redirect("/dashboard")
}

export async function logout() {
    await deleteSession()
}