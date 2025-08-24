import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

export const signInSchema = z
    .object({
        account: z.string().min(8).max(12),
        password: z.string().min(6).max(20),
    })
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                account: {},
                password: {},
            },
            authorize: async (credentials) => {
                const { account, password } = await signInSchema.parseAsync(credentials)
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/validate`, {
                    method: "POST",
                    body: JSON.stringify({
                        account: account,
                        password: password,
                    }),
                })
                const response = await res.json()
                return response
            },
        }),
    ],
    callbacks: {
        session({ session, token }) {
            session.user.id = token.sub!
            return session;
        }
    }
})