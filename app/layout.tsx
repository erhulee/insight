import type React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import Provider from './_trpc/Provider'
import { Toaster } from '@/components/ui/sonner'
import '@ant-design/v5-patch-for-react-19'
import localFont from 'next/font/local'
import { ConfigProvider } from 'antd'
export const metadata: Metadata = {
  title: 'Insight - 专业的在线问卷调查平台',
  description: '创建专业问卷，收集有价值的数据，简单易用的问卷设计工具',
}
import { AntdRegistry } from '@ant-design/nextjs-registry'
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
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${douyinFont.variable}`}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              components: {
                Form: {
                  itemMarginBottom: 12,
                },
              },
            }}
          >
            <TooltipProvider>
              <Provider>{children}</Provider>
            </TooltipProvider>
          </ConfigProvider>
        </AntdRegistry>
        <Toaster />
      </body>
    </html>
  )
}
