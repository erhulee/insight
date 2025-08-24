'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TestCallbackPage() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl')

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>回调URL测试页面</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">当前回调URL参数:</p>
                        <code className="block p-2 bg-muted rounded text-sm break-all">
                            {callbackUrl || '无'}
                        </code>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">测试链接:</p>
                        <div className="space-y-2">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/login?callbackUrl=/test-callback">
                                    测试登录回调
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/register?callbackUrl=/test-callback">
                                    测试注册回调
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">
                                返回仪表板
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
