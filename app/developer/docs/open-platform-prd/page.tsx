'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OpenPlatformPrdPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">开放平台 PRD</h1>
                    <p className="text-muted-foreground">基于 docs/OPEN-PLATFORM-PRD.md 的要点摘要</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/openapi.yaml">下载 OpenAPI</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/developer">返回开发者中心</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>目标与范围</CardTitle>
                        <CardDescription>对外能力与 V1 范围</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>问卷管理：创建、更新、发布/下线、详情、删除</li>
                            <li>配置管理：基础信息、封面配置、题目 DSL(JSON)</li>
                            <li>答卷管理：分页查询、单条获取、导出</li>
                            <li>事件通知：Webhooks 推送（提交/发布/更新等）</li>
                            <li>系统能力：健康检查、签名校验、限流、幂等键</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>安全与合规</CardTitle>
                        <CardDescription>鉴权、权限与限流</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>鉴权：API Key（V1），后续 OAuth2 Client Credentials</li>
                            <li>权限：应用级资源隔离，最小权限</li>
                            <li>限流与配额：429 + Retry-After；IP 黑白名单</li>
                            <li>防重放：时间戳 + HMAC 签名；写操作幂等</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>更多内容</CardTitle>
                        <CardDescription>查看仓库内完整 PRD 文档</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p>
                            完整 PRD 请查看 <code>docs/OPEN-PLATFORM-PRD.md</code>。
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


