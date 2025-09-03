'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function ApiKeysPage() {
    const [apiKey, setApiKey] = useState<string>('sk_live_********************************')
    const [name, setName] = useState<string>('我的应用')
    const [readonly, setReadonly] = useState<boolean>(false)
    const [rateLimit, setRateLimit] = useState<number>(60)

    const handleCreate = () => {
        toast('已创建 API 密钥', { description: '请妥善保管您的密钥' })
        setApiKey('sk_live_' + Math.random().toString(36).slice(2).padEnd(32, '*'))
    }

    const handleRotate = () => {
        toast('已重置密钥', { description: '旧密钥将于 1 小时后失效' })
        setApiKey('sk_live_' + Math.random().toString(36).slice(2).padEnd(32, '*'))
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(apiKey)
        toast('已复制', { description: '密钥已复制到剪贴板' })
    }

    return (
        <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold mb-6'>API 密钥管理</h1>
            <Tabs defaultValue='manage' className='space-y-6'>
                <TabsList>
                    <TabsTrigger value='manage'>管理</TabsTrigger>
                    <TabsTrigger value='settings'>设置</TabsTrigger>
                </TabsList>

                <TabsContent value='manage'>
                    <Card>
                        <CardHeader>
                            <CardTitle>当前密钥</CardTitle>
                            <CardDescription>密钥仅用于服务端与开放平台交互</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>密钥</Label>
                                <div className='flex gap-2'>
                                    <Input value={apiKey} readOnly className='font-mono' />
                                    <Button variant='outline' onClick={handleCopy}>复制</Button>
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <Button onClick={handleCreate}>创建新密钥</Button>
                                <Button variant='destructive' onClick={handleRotate}>重置密钥</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='settings'>
                    <Card>
                        <CardHeader>
                            <CardTitle>应用设置</CardTitle>
                            <CardDescription>名称、权限与限流</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='appName'>应用名称</Label>
                                <Input id='appName' value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <Label>只读密钥</Label>
                                    <p className='text-xs text-muted-foreground'>仅允许 GET 请求</p>
                                </div>
                                <Switch checked={readonly} onCheckedChange={setReadonly} />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='rate'>每分钟请求上限</Label>
                                <Input id='rate' type='number' value={rateLimit} onChange={e => setRateLimit(Number(e.target.value || 0))} />
                                <p className='text-xs text-muted-foreground'>返回 429 时将包含 Retry-After</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => toast('已保存设置')}>保存</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}


