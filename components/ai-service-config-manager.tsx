'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, Plus, Settings, TestTube, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    AIServiceConfig,
    AI_SERVICE_PROVIDERS,
    DEFAULT_AI_CONFIG,
    validateAIServiceConfig,
    saveAIConfigToStorage,
    deleteAIConfigFromStorage,
    getStoredAIConfigs
} from '@/lib/ai-service-config'
import { aiServiceManager } from '@/lib/ai-service-manager'

interface AIServiceConfigManagerProps {
    onConfigChange?: () => void
}

export function AIServiceConfigManager({ onConfigChange }: AIServiceConfigManagerProps) {
    const [configs, setConfigs] = useState<AIServiceConfig[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingConfig, setEditingConfig] = useState<AIServiceConfig | null>(null)
    const [isTesting, setIsTesting] = useState(false)
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; error?: string }>>({})

    useEffect(() => {
        loadConfigs()
    }, [])

    const loadConfigs = () => {
        const storedConfigs = getStoredAIConfigs()
        if (storedConfigs.length === 0) {
            // 如果没有配置，创建默认配置
            const defaultConfig = { ...DEFAULT_AI_CONFIG, id: 'default-' + Date.now() }
            saveAIConfigToStorage(defaultConfig)
            setConfigs([defaultConfig])
        } else {
            setConfigs(storedConfigs)
        }
    }

    const handleCreateConfig = () => {
        setEditingConfig(null)
        setIsDialogOpen(true)
    }

    const handleEditConfig = (config: AIServiceConfig) => {
        setEditingConfig(config)
        setIsDialogOpen(true)
    }

    const handleDeleteConfig = (configId: string) => {
        if (configs.length <= 1) {
            toast.error('至少需要保留一个配置')
            return
        }

        deleteAIConfigFromStorage(configId)
        loadConfigs()
        onConfigChange?.()
        toast.success('配置删除成功')
    }

    const handleSetActive = (configId: string) => {
        aiServiceManager.setActiveConfig(configId)
        loadConfigs()
        onConfigChange?.()
        toast.success('活跃配置已更新')
    }

    const handleTestConnection = async (config: AIServiceConfig) => {
        setIsTesting(true)
        try {
            const result = await aiServiceManager.testConnection(config)
            setTestResults(prev => ({ ...prev, [config.id]: result }))

            if (result.success) {
                toast.success('连接测试成功！')
            } else {
                toast.error(`连接测试失败: ${result.error}`)
            }
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [config.id]: { success: false, error: '测试失败' }
            }))
            toast.error('连接测试失败')
        } finally {
            setIsTesting(false)
        }
    }

    const handleSaveConfig = (config: AIServiceConfig) => {
        const validation = validateAIServiceConfig(config)
        if (!validation.valid) {
            toast.error(`配置验证失败: ${validation.errors.join(', ')}`)
            return
        }

        saveAIConfigToStorage(config)
        loadConfigs()
        onConfigChange?.()
        setIsDialogOpen(false)
        toast.success('配置保存成功')
    }

    const getProviderInfo = (type: string) => {
        return AI_SERVICE_PROVIDERS.find(p => p.id === type) || AI_SERVICE_PROVIDERS[0]
    }

    return (
        <div className="space-y-6">
            {/* 配置列表 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">AI服务配置</h3>
                    <Button onClick={handleCreateConfig} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        添加配置
                    </Button>
                </div>

                {configs.map((config) => {
                    const provider = getProviderInfo(config.type)
                    const testResult = testResults[config.id]

                    return (
                        <Card key={config.id} className={config.isActive ? 'ring-2 ring-primary' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={config.isActive ? 'default' : 'secondary'}>
                                            {config.isActive ? '活跃' : '非活跃'}
                                        </Badge>
                                        <Badge variant="outline">{provider.name}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {config.isActive ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                当前使用
                                            </Badge>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetActive(config.id)}
                                            >
                                                设为活跃
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="font-medium">{config.name}</h4>
                                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">服务地址:</span>
                                        <p className="font-mono">{config.baseUrl}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">模型:</span>
                                        <p>{config.model}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Temperature:</span>
                                        <p>{config.temperature}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Top P:</span>
                                        <p>{config.topP}</p>
                                    </div>
                                </div>

                                {testResult && (
                                    <Alert variant={testResult.success ? 'default' : 'destructive'}>
                                        {testResult.success ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <XCircle className="h-4 w-4" />
                                        )}
                                        <AlertDescription>
                                            {testResult.success ? '连接正常' : `连接失败: ${testResult.error}`}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTestConnection(config)}
                                        disabled={isTesting}
                                    >
                                        {isTesting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <TestTube className="h-4 w-4" />
                                        )}
                                        测试连接
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditConfig(config)}
                                    >
                                        <Edit className="h-4 w-4" />
                                        编辑
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteConfig(config.id)}
                                        disabled={configs.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        删除
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* 配置编辑对话框 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingConfig ? '编辑AI服务配置' : '添加AI服务配置'}
                        </DialogTitle>
                        <DialogDescription>
                            配置AI服务的连接参数和模型设置
                        </DialogDescription>
                    </DialogHeader>

                    <ConfigForm
                        config={editingConfig}
                        onSave={handleSaveConfig}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface ConfigFormProps {
    config: AIServiceConfig | null
    onSave: (config: AIServiceConfig) => void
    onCancel: () => void
}

function ConfigForm({ config, onSave, onCancel }: ConfigFormProps) {
    const [formData, setFormData] = useState<AIServiceConfig>(
        config || {
            ...DEFAULT_AI_CONFIG,
            id: 'config-' + Date.now(),
            name: '',
            type: 'ollama',
            baseUrl: '',
            model: '',
        }
    )
    const [selectedProvider, setSelectedProvider] = useState(config?.type || 'ollama')

    useEffect(() => {
        if (selectedProvider !== formData.type) {
            const provider = AI_SERVICE_PROVIDERS.find(p => p.id === selectedProvider)
            if (provider) {
                setFormData(prev => ({
                    ...prev,
                    type: selectedProvider,
                    baseUrl: provider.baseUrl,
                    model: provider.models[0] || '',
                    ...provider.defaultConfig,
                }))
            }
        }
    }, [selectedProvider])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const provider = AI_SERVICE_PROVIDERS.find(p => p.id === selectedProvider)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* 服务提供商选择 */}
                <div className="space-y-2">
                    <Label>服务提供商</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AI_SERVICE_PROVIDERS.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                    {provider.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {provider && (
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                    )}
                </div>

                {/* 配置名称 */}
                <div className="space-y-2">
                    <Label htmlFor="name">配置名称</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如：我的OpenAI配置"
                        required
                    />
                </div>

                {/* 服务地址 */}
                <div className="space-y-2">
                    <Label htmlFor="baseUrl">服务地址</Label>
                    <Input
                        id="baseUrl"
                        value={formData.baseUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                        placeholder={provider?.baseUrl || 'https://api.example.com'}
                        required
                    />
                </div>

                {/* API密钥（仅OpenAI和Anthropic需要） */}
                {(selectedProvider === 'openai' || selectedProvider === 'anthropic') && (
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API密钥</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            value={formData.apiKey || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="sk-..."
                            required
                        />
                    </div>
                )}

                {/* 模型选择 */}
                <div className="space-y-2">
                    <Label htmlFor="model">模型</Label>
                    <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
                        <SelectTrigger>
                            <SelectValue placeholder="选择模型" />
                        </SelectTrigger>
                        <SelectContent>
                            {provider?.models.map((model) => (
                                <SelectItem key={model} value={model}>
                                    {model}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                {/* 高级参数 */}
                <div className="space-y-4">
                    <h4 className="font-medium">高级参数</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="temperature">Temperature</Label>
                            <Input
                                id="temperature"
                                type="number"
                                step="0.1"
                                min="0"
                                max="2"
                                value={formData.temperature}
                                onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            />
                            <p className="text-xs text-muted-foreground">控制输出的随机性 (0-2)</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="topP">Top P</Label>
                            <Input
                                id="topP"
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={formData.topP}
                                onChange={(e) => setFormData(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                            />
                            <p className="text-xs text-muted-foreground">控制词汇选择的多样性 (0-1)</p>
                        </div>
                    </div>

                    {/* 重复惩罚（仅Ollama支持） */}
                    {selectedProvider === 'ollama' && (
                        <div className="space-y-2">
                            <Label htmlFor="repeatPenalty">重复惩罚</Label>
                            <Input
                                id="repeatPenalty"
                                type="number"
                                step="0.1"
                                min="0"
                                max="2"
                                value={formData.repeatPenalty || 1.1}
                                onChange={(e) => setFormData(prev => ({ ...prev, repeatPenalty: parseFloat(e.target.value) }))}
                            />
                            <p className="text-xs text-muted-foreground">减少重复内容的生成 (0-2)</p>
                        </div>
                    )}

                    {/* 最大令牌数（OpenAI和Anthropic支持） */}
                    {(selectedProvider === 'openai' || selectedProvider === 'anthropic') && (
                        <div className="space-y-2">
                            <Label htmlFor="maxTokens">最大令牌数</Label>
                            <Input
                                id="maxTokens"
                                type="number"
                                step="100"
                                min="1"
                                max="8000"
                                value={formData.maxTokens || 4000}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                            />
                            <p className="text-xs text-muted-foreground">限制生成内容的最大长度 (1-8000)</p>
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    取消
                </Button>
                <Button type="submit">
                    保存配置
                </Button>
            </DialogFooter>
        </form>
    )
}
