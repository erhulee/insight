import { initTRPC, TRPCError } from '@trpc/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { auth } from '@/auth'
import { exportPKCS8 } from 'jose'
// 定义 context 类型
export interface Context {
	userId?: string
	req?: any
}

// 创建 tRPC 实例
const t = initTRPC.context<Context>().create()

// 创建 context 函数
export const createContext = async (req?: any): Promise<Context> => {
	let token: string | undefined

	// 优先从 header 获取 token
	if (req?.headers) {
		const auth = req.headers['authorization'] || req.headers['Authorization']
		if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
			token = auth.replace('Bearer ', '')
		}
	}

	// 兼容 cookie 方式（SSR 场景）
	if (!token) {
		try {
			const cookieStore = await cookies()
			token = cookieStore.get('session')?.value
		} catch (error) {
			// 在 API Route 中可能无法访问 cookies
		}
	}

	let userId: string | undefined
	if (token) {
		const payload = await decrypt(token)
		if (payload) {
			userId = payload.userId as string
		}
	}

	return {
		userId,
		req,
	}
}

// Base router and procedure helpers
export const router = t.router
export const procedure = t.procedure
export const createCallerFactory = t.createCallerFactory

// 鉴权中间件
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
	const session = await auth()
	const userId = session?.user?.id
	if (!userId) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: '未登录',
		})
	}
	return next({
		ctx: {
			...ctx,
			userId,
		},
	})
})

// 需要鉴权的 procedure
export const protectedProcedure = t.procedure.use(authMiddleware)

// 不需要鉴权的 procedure
export const publicProcedure = t.procedure
