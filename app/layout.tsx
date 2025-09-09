import type React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import Provider from './_trpc/Provider'
import { Toaster } from '@/components/ui/sonner'
import localFont from 'next/font/local'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
export const metadata: Metadata = {
	title: 'Insight - 专业的在线问卷调查平台',
	description: '创建专业问卷，收集有价值的数据，简单易用的问卷设计工具',
}
import { TooltipProvider } from '@/components/ui/tooltip'
const douyinFont = localFont({
	src: './DouyinSansBold.ttf',
	display: 'swap',
	variable: '--font-douyin',
})
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
			<body
				className={`${douyinFont.variable} overflow-y-scroll [scrollbar-gutter:stable]`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>
						<AuthProvider>
							<Provider>{children}</Provider>
						</AuthProvider>
					</TooltipProvider>
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	)
}
