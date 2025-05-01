import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Provider from "./_trpc/Provider"
import { Toaster } from "@/components/ui/sonner"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Insight - 专业的在线问卷调查平台",
  description: "创建专业问卷，收集有价值的数据，简单易用的问卷设计工具",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${inter.className}`}>
        <Provider>{children}</Provider>
        <Toaster />
      </body>
    </html>
  )
}


