"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

/**
 * 分享配置
 */
export function ShareConfig() {
    return (
        <div className="flex min-h-screen flex-col w-full gap-4">
            <div className="flex items-center space-x-2">
                <Switch id="survey-active" defaultChecked />
                <Label>开启投放</Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="expiry-date">问卷截止日期</Label>
                <Input type="date" id="expiry-date" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="max-responses">最大回复数量</Label>
                <Input type="number" id="max-responses" placeholder="不限制" />
            </div>
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Switch id="password-protect" />
                    <Label htmlFor="password-protect">密码保护</Label>
                </div>
                <Input type="password" placeholder="设置访问密码" disabled />
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="collect-email" />
                <Label htmlFor="collect-email">收集填写者邮箱</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="one-response" defaultChecked />
                <Label htmlFor="one-response">每人只能提交一次</Label>
            </div>
            <Button>保存设置</Button>
        </div>
    )
}