'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

type EventType = 'survey.published' | 'response.submitted' | 'response.updated' | 'survey.unpublished'

export default function WebhooksPage() {
    const [endpoint, setEndpoint] = useState<string>('https://example.com/webhooks/open')
    const [secret, setSecret] = useState<string>('whsec_********************************')
    const [enabled, setEnabled] = useState<boolean>(true)
    const [events, setEvents] = useState<Record<EventType, boolean>>({
        'survey.published': true,
        'response.submitted': true,
        'response.updated': false,
        'survey.unpublished': false,
    })

    const toggleEvent = (key: EventType, value: boolean) => setEvents(prev => ({ ...prev, [key]: value }))

    const handleSave = () => {
        toast('已保存 Webhook 配置')
    }

    const handleTest = async () => {
        toast('已发送测试事件', { description: '请在日志页查看投递结果' })
    }

    return (
        <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold mb-6'>Webhooks</h1>
            <Tabs defaultValue='settings' className='space-y-6'>
                <TabsList>
                    <TabsTrigger value='settings'>设置</TabsTrigger>
                    <TabsTrigger value='logs'>投递日志</TabsTrigger>
                </TabsList>

                <TabsContent value='settings'>
                    <Card>
                        <CardHeader>
                            <CardTitle>回调与签名</CardTitle>
                            <CardDescription>开启推送并配置签名密钥</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <Label>启用推送</Label>
                                    <p className='text-xs text-muted-foreground'>关闭后不再发送任何事件</p>
                                </div>
                                <Switch checked={enabled} onCheckedChange={setEnabled} />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='endpoint'>回调地址</Label>
                                <Input id='endpoint' value={endpoint} onChange={e => setEndpoint(e.target.value)} />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='secret'>签名密钥</Label>
                                <Input id='secret' value={secret} onChange={e => setSecret(e.target.value)} />
                                <p className='text-xs text-muted-foreground'>请求头包含 X-OpenEvent, X-OpenTs, X-OpenSig</p>
                            </div>
                        </CardContent>
                        <CardFooter className='gap-2'>
                            <Button onClick={handleSave}>保存</Button>
                            <Button variant='outline' onClick={handleTest}>发送测试</Button>
                        </CardFooter>
                    </Card>

                    <Card className='mt-6'>
                        <CardHeader>
                            <CardTitle>订阅事件</CardTitle>
                            <CardDescription>选择需要推送的事件类型</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            {(Object.keys(events) as EventType[]).map(key => (
                                <div className='flex items-center justify-between' key={key}>
                                    <span className='text-sm'>{key}</span>
                                    <Switch checked={events[key]} onCheckedChange={v => toggleEvent(key, v)} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='logs'>
                    <Card>
                        <CardHeader>
                            <CardTitle>最近投递</CardTitle>
                            <CardDescription>查看推送结果与重试</CardDescription>
                        </CardHeader>
                        <CardContent className='text-sm text-muted-foreground'>
                            这里将展示最近的事件推送记录（时间、事件、响应码、重试次数）。
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}


