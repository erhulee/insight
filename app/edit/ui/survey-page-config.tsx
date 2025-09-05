import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Upload, Save } from 'lucide-react'
import { SurveyCoverConfig } from './survey-cover-config'
import { useState } from 'react'
import { trpc } from '@/app/_trpc/client'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SuveryPageConfig() {
    const params = useParams()
    const surveyId = params.id as string

    // 基本设置状态
    const [basicSettings, setBasicSettings] = useState({
        display_no: false,
        order_random: false,
        surver_name: '',
        surver_description: '',
        surver_cover: ''
    })

    // 封面配置状态
    const [coverConfig, setCoverConfig] = useState({
        estimatedTime: '',
        coverDescription: '',
        privacyNotice: '',
        bottomNotice: '',
        coverIcon: 'file-text',
        coverColor: 'blue',
        showProgressInfo: true,
        showPrivacyNotice: true,
    })

    // tRPC 接口
    const updateCoverConfigMutation = trpc.surver.UpdateSurveyCoverConfig.useMutation()
    const updateBasicSettingsMutation = trpc.surver.UpdateSurveyBasicSettings.useMutation()

    // 处理基本设置更新
    const handleBasicSettingsUpdate = (key: keyof typeof basicSettings, value: any) => {
        setBasicSettings(prev => ({
            ...prev,
            [key]: value
        }))
    }

    // 处理封面配置更新
    const handleCoverConfigUpdate = (config: Partial<typeof coverConfig>) => {
        setCoverConfig(prev => ({
            ...prev,
            ...config
        }))
    }
    // 保存所有配置
    const handleSaveAll = async () => {
        try {
            await Promise.all([
                updateCoverConfigMutation.mutateAsync({
                    surveyId,
                    coverConfig,
                }),
                updateBasicSettingsMutation.mutateAsync({
                    surveyId,
                    basicSettings,
                })
            ])
            toast.success('所有配置保存成功')
        } catch (error) {
            console.error('保存配置失败:', error)
            toast.error('保存配置失败')
        }
    }

    return (
        <div className="bg-muted/30 flex flex-col max-h-screen">
            <div className="border-b p-4">
                <h3 className="font-medium">页面配置</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    编辑问卷的属性和选项
                </p>
            </div>
            <div className='overflow-y-scroll'>
                <Tabs defaultValue="cover" >
                    <TabsList className="grid grid-cols-2 m-4">
                        <TabsTrigger value="basic">基本设置</TabsTrigger>
                        <TabsTrigger value="cover">封面配置</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 pt-2 px-4">
                        <div className="space-y-4">
                            {/* 显示编号 */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">显示编号</Label>
                                    <p className="text-xs text-muted-foreground">在问题前显示序号</p>
                                </div>
                                <Switch
                                    checked={basicSettings.display_no}
                                    onCheckedChange={(checked) => handleBasicSettingsUpdate('display_no', checked)}
                                />
                            </div>

                            {/* 随机排序 */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">随机排序</Label>
                                    <p className="text-xs text-muted-foreground">随机排列问题顺序</p>
                                </div>
                                <Switch
                                    checked={basicSettings.order_random}
                                    onCheckedChange={(checked) => handleBasicSettingsUpdate('order_random', checked)}
                                />
                            </div>

                            {/* 问卷名称 */}
                            <div className="space-y-2">
                                <Label htmlFor="surver_name">问卷名称</Label>
                                <Input
                                    id="surver_name"
                                    placeholder="请输入问卷名称"
                                    value={basicSettings.surver_name}
                                    onChange={(e) => handleBasicSettingsUpdate('surver_name', e.target.value)}
                                />
                            </div>

                            {/* 问卷描述 */}
                            <div className="space-y-2">
                                <Label htmlFor="surver_description">问卷描述</Label>
                                <Textarea
                                    id="surver_description"
                                    placeholder="请输入问卷描述"
                                    value={basicSettings.surver_description}
                                    onChange={(e) => handleBasicSettingsUpdate('surver_description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* 问卷封面 */}
                            <div className="space-y-2">
                                <Label htmlFor="surver_cover">问卷封面</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="surver_cover"
                                        placeholder="封面图片URL或上传文件"
                                        value={basicSettings.surver_cover}
                                        onChange={(e) => handleBasicSettingsUpdate('surver_cover', e.target.value)}
                                    />
                                    <Button variant="outline" size="sm" className="px-3">
                                        <Upload className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="cover" className="pt-2 px-4 h-full overflow-y-auto">
                        <SurveyCoverConfig
                            coverConfig={coverConfig}
                            onUpdate={handleCoverConfigUpdate}
                        />
                    </TabsContent>
                </Tabs>
                <div className=' w-full p-4' >
                    <Button
                        onClick={handleSaveAll}
                        disabled={updateCoverConfigMutation.isPending || updateBasicSettingsMutation.isPending}
                        className="w-full"
                        size="lg"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {updateCoverConfigMutation.isPending || updateBasicSettingsMutation.isPending ? '保存中...' : '保存所有配置'}
                    </Button>
                </div>
            </div>

        </div>
    )
}
