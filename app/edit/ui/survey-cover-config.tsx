import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { FileText, Clock, Shield, MessageSquare } from 'lucide-react'

interface SurveyCoverConfigProps {
    coverConfig: {
        estimatedTime?: string
        coverDescription?: string
        privacyNotice?: string
        bottomNotice?: string
        coverIcon?: string
        coverColor?: string
        showProgressInfo?: boolean
        showPrivacyNotice?: boolean
    }
    onUpdate: (config: Partial<SurveyCoverConfigProps['coverConfig']>) => void
}

const ICON_OPTIONS = [
    { value: 'file-text', label: '文档', icon: FileText },
    { value: 'clock', label: '时钟', icon: Clock },
    { value: 'shield', label: '盾牌', icon: Shield },
    { value: 'message-square', label: '消息', icon: MessageSquare },
]

const COLOR_OPTIONS = [
    { value: 'blue', label: '蓝色', color: 'bg-blue-500' },
    { value: 'green', label: '绿色', color: 'bg-green-500' },
    { value: 'purple', label: '紫色', color: 'bg-purple-500' },
    { value: 'orange', label: '橙色', color: 'bg-orange-500' },
    { value: 'red', label: '红色', color: 'bg-red-500' },
]

export function SurveyCoverConfig({ coverConfig, onUpdate }: SurveyCoverConfigProps) {
    const handleChange = (key: keyof typeof coverConfig, value: any) => {
        onUpdate({ [key]: value })
    }

    return (
        <div className="flex-1 px-4 overflow-y-auto h-full">
            <div className="space-y-4 py-2">
                {/* 基础信息 */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">基础信息</h3>
                    <div className="space-y-1.5">
                        <Label htmlFor="estimatedTime" className="text-xs">预计用时</Label>
                        <Input
                            id="estimatedTime"
                            placeholder="如：3-5分钟"
                            value={coverConfig.estimatedTime || ''}
                            onChange={(e) => handleChange('estimatedTime', e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="coverDescription" className="text-xs">封面描述</Label>
                        <Textarea
                            id="coverDescription"
                            placeholder="填写问卷的引导文案"
                            value={coverConfig.coverDescription || ''}
                            onChange={(e) => handleChange('coverDescription', e.target.value)}
                            rows={2}
                            className="text-sm resize-none"
                        />
                    </div>
                </div>

                <Separator className="my-2" />

                {/* 隐私和说明 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">隐私和说明</h3>
                    <div className="space-y-1.5">
                        <Label htmlFor="privacyNotice" className="text-xs">隐私保护说明</Label>
                        <Textarea
                            id="privacyNotice"
                            placeholder="隐私保护相关说明文案"
                            value={coverConfig.privacyNotice || ''}
                            onChange={(e) => handleChange('privacyNotice', e.target.value)}
                            rows={2}
                            className="text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="bottomNotice" className="text-xs">底部说明文案</Label>
                        <Textarea
                            id="bottomNotice"
                            placeholder="页面底部的说明文案"
                            value={coverConfig.bottomNotice || ''}
                            onChange={(e) => handleChange('bottomNotice', e.target.value)}
                            rows={2}
                            className="text-sm resize-none"
                        />
                    </div>
                </div>

                <Separator className="my-2" />

                {/* 视觉样式 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">视觉样式</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="coverIcon" className="text-xs">封面图标</Label>
                            <Select
                                value={coverConfig.coverIcon || 'file-text'}
                                onValueChange={(value) => handleChange('coverIcon', value)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="选择图标" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ICON_OPTIONS.map((option) => {
                                        const IconComponent = option.icon
                                        return (
                                            <SelectItem key={option.value} value={option.value} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="h-3 w-3" />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="coverColor" className="text-xs">主色调</Label>
                            <Select
                                value={coverConfig.coverColor || 'blue'}
                                onValueChange={(value) => handleChange('coverColor', value)}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="选择颜色" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COLOR_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded ${option.color}`} />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator className="my-2" />

                {/* 显示控制 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">显示控制</h3>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-medium">显示进度信息</Label>
                                <p className="text-xs text-gray-500">显示预计用时和问题数量</p>
                            </div>
                            <Switch
                                checked={coverConfig.showProgressInfo !== false}
                                onCheckedChange={(checked) => handleChange('showProgressInfo', checked)}
                                className="scale-75"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-xs font-medium">显示隐私说明</Label>
                                <p className="text-xs text-gray-500">显示隐私保护相关说明</p>
                            </div>
                            <Switch
                                checked={coverConfig.showPrivacyNotice !== false}
                                onCheckedChange={(checked) => handleChange('showPrivacyNotice', checked)}
                                className="scale-75"
                            />
                        </div>
                    </div>
                </div>

                {/* 预览区域 */}
                <Separator className="my-2" />

                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">预览效果</h3>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-center">
                            <div className={`w-12 h-12 ${COLOR_OPTIONS.find(c => c.value === (coverConfig.coverColor || 'blue'))?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                {(() => {
                                    const IconComponent = ICON_OPTIONS.find(i => i.value === (coverConfig.coverIcon || 'file-text'))?.icon || FileText
                                    return <IconComponent className="h-6 w-6 text-white" />
                                })()}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                                {coverConfig.estimatedTime || '3-5分钟'} • {coverConfig.showProgressInfo !== false ? '显示进度信息' : '隐藏进度信息'}
                            </p>
                            {coverConfig.showPrivacyNotice !== false && (
                                <p className="text-xs text-gray-500">隐私保护说明已启用</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
