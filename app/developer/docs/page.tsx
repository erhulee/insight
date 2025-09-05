'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DeveloperDocsHubPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>开发者文档中心</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>开放平台 PRD</CardTitle>
            <CardDescription>产品需求文档（仓库内）</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='list-disc pl-5 space-y-2 text-sm'>
              <li>
                <Link href='/developer/docs/open-platform-prd' className='text-primary hover:underline'>
                  在线阅读要点摘要
                </Link>
              </li>
              <li>
                <Link href='/docs/OPEN-PLATFORM-PRD.md' className='text-primary hover:underline'>
                  仓库文档（原文）
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OpenAPI 规范</CardTitle>
            <CardDescription>API 端点、参数与响应</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='list-disc pl-5 space-y-2 text-sm'>
              <li>
                <Link href='/openapi.yaml' className='text-primary hover:underline'>
                  下载 openapi.yaml
                </Link>
              </li>
              <li>
                <Link href='/developer/api-explorer' className='text-primary hover:underline'>
                  API Explorer（交互测试）
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>密钥、Webhooks 与示例</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='list-disc pl-5 space-y-2 text-sm'>
              <li>
                <Link href='/developer/api-keys' className='text-primary hover:underline'>
                  API 密钥管理
                </Link>
              </li>
              <li>
                <Link href='/developer/webhooks' className='text-primary hover:underline'>
                  Webhooks 配置与日志
                </Link>
              </li>
              <li>
                <Link href='/developer/examples' className='text-primary hover:underline'>
                  代码示例
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

