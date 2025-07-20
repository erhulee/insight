'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Settings, Eye, EyeOff } from 'lucide-react'
import {
    DisplayLogicConfig,
    DisplayLogicRule,
    DisplayLogicCondition,
    LOGIC_OPERATORS,
    LogicConfigUtils,
    LOGIC_TEMPLATES
} from '@/lib/custom-display-logic'
import { Question } from '@/lib/api-types'

interface DisplayLogicConfiguratorProps {
    questions: Question[]
    logicConfig: DisplayLogicConfig
    onConfigChange: (config: DisplayLogicConfig) => void
}

export function DisplayLogicConfigurator({
    questions,
    logicConfig,
    onConfigChange
}: DisplayLogicConfiguratorProps) {
    const [config, setConfig] = useState<DisplayLogicConfig>(logicConfig)
    const [selectedRule, setSelectedRule] = useState<DisplayLogicRule | null>(null)
    const [showTemplates, setShowTemplates] = useState(false)

    useEffect(() => {
        setConfig(logicConfig)
    }, [logicConfig])

    const updateConfig = (newConfig: DisplayLogicConfig) => {
        setConfig(newConfig)
        onConfigChange(newConfig)
    }

    const addRule = () => {
        const newRule = LogicConfigUtils.createRule('')
        const newConfig = {
            ...config,
            rules: [...config.rules, newRule]
        }
        updateConfig(newConfig)
        setSelectedRule(newRule)
    }

    const removeRule = (ruleId: string) => {
        const newConfig = {
            ...config,
            rules: config.rules.filter(rule => rule.id !== ruleId)
        }
        updateConfig(newConfig)
        if (selectedRule?.id === ruleId) {
            setSelectedRule(null)
        }
    }

    const updateRule = (ruleId: string, updates: Partial<DisplayLogicRule>) => {
        const newConfig = {
            ...config,
            rules: config.rules.map(rule =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
            )
        }
        updateConfig(newConfig)
        if (selectedRule?.id === ruleId) {
            setSelectedRule({ ...selectedRule, ...updates })
        }
    }

    const addCondition = (ruleId: string) => {
        const rule = config.rules.find(r => r.id === ruleId)
        if (!rule) return

        const newCondition = LogicConfigUtils.createCondition('')
        const newConfig = {
            ...config,
            rules: config.rules.map(r =>
                r.id === ruleId
                    ? { ...r, conditions: [...r.conditions, newCondition] }
                    : r
            )
        }
        updateConfig(newConfig)
    }

    const removeCondition = (ruleId: string, conditionIndex: number) => {
        const newConfig = {
            ...config,
            rules: config.rules.map(rule =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        conditions: rule.conditions.filter((_, index) => index !== conditionIndex)
                    }
                    : rule
            )
        }
        updateConfig(newConfig)
    }

    const updateCondition = (ruleId: string, conditionIndex: number, updates: Partial<DisplayLogicCondition>) => {
        const newConfig = {
            ...config,
            rules: config.rules.map(rule =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        conditions: rule.conditions.map((condition, index) =>
                            index === conditionIndex ? { ...condition, ...updates } : condition
                        )
                    }
                    : rule
            )
        }
        updateConfig(newConfig)
    }

    const applyTemplate = (templateKey: keyof typeof LOGIC_TEMPLATES) => {
        const template = LOGIC_TEMPLATES[templateKey]
        // 这里需要用户选择具体的问题ID，暂时使用前几个问题作为示例
        if (questions.length < 3) {
            alert('需要至少3个问题才能应用此模板')
            return
        }

        const templateConfig = template.template(
            questions[0].id,
            questions[1].id,
            questions[2].id
        )

        const newConfig = {
            ...config,
            rules: [...config.rules, ...templateConfig.rules]
        }
        updateConfig(newConfig)
        setShowTemplates(false)
    }

    const getQuestionOptions = () => {
        return questions.map(q => ({
            value: q.id,
            label: q.title
        }))
    }

    const getOperatorOptions = () => {
        return Object.entries(LOGIC_OPERATORS).map(([key, label]) => ({
            value: key,
            label
        }))
    }

    return (
        <div className="space-y-6">
            {/* 启用开关 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        自定义展示逻辑
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={config.enabled}
                            onCheckedChange={(enabled) => updateConfig({ ...config, enabled })}
                        />
                        <Label>启用自定义展示逻辑</Label>
                    </div>
                </CardContent>
            </Card>

            {config.enabled && (
                <>
                    {/* 模板选择 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">逻辑模板</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                onClick={() => setShowTemplates(!showTemplates)}
                                className="w-full"
                            >
                                选择预设模板
                            </Button>

                            {showTemplates && (
                                <div className="mt-4 space-y-2">
                                    {Object.entries(LOGIC_TEMPLATES).map(([key, template]) => (
                                        <div key={key} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium">{template.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => applyTemplate(key as keyof typeof LOGIC_TEMPLATES)}
                                                >
                                                    应用
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 规则列表 */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">逻辑规则</CardTitle>
                                <Button onClick={addRule} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    添加规则
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {config.rules.map((rule) => (
                                    <div key={rule.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={rule.action === 'show' ? 'default' : 'secondary'}>
                                                    {rule.action === 'show' ? (
                                                        <>
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            显示
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="h-3 w-3 mr-1" />
                                                            隐藏
                                                        </>
                                                    )}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    目标问题: {questions.find(q => q.id === rule.targetQuestionId)?.title || rule.targetQuestionId}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeRule(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* 规则配置 */}
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>目标问题</Label>
                                                    <Select
                                                        value={rule.targetQuestionId}
                                                        onValueChange={(value) => updateRule(rule.id, { targetQuestionId: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="选择目标问题" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getQuestionOptions().map((option) => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>操作类型</Label>
                                                    <Select
                                                        value={rule.action}
                                                        onValueChange={(value: 'show' | 'hide') => updateRule(rule.id, { action: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="show">显示问题</SelectItem>
                                                            <SelectItem value="hide">隐藏问题</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* 条件列表 */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <Label>条件</Label>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => addCondition(rule.id)}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        添加条件
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {rule.conditions.map((condition, index) => (
                                                        <div key={index} className="flex items-center gap-2 p-3 border rounded">
                                                            <Select
                                                                value={condition.questionId}
                                                                onValueChange={(value) => updateCondition(rule.id, index, { questionId: value })}
                                                            >
                                                                <SelectTrigger className="w-48">
                                                                    <SelectValue placeholder="选择问题" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getQuestionOptions().map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>

                                                            <Select
                                                                value={condition.operator}
                                                                onValueChange={(value: any) => updateCondition(rule.id, index, { operator: value })}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getOperatorOptions().map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>

                                                            {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                                                                <Input
                                                                    placeholder="比较值"
                                                                    value={condition.value || ''}
                                                                    onChange={(e) => updateCondition(rule.id, index, { value: e.target.value })}
                                                                    className="w-32"
                                                                />
                                                            )}

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeCondition(rule.id, index)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {rule.conditions.length > 1 && (
                                                    <div className="mt-3">
                                                        <Label>条件关系</Label>
                                                        <Select
                                                            value={rule.operator}
                                                            onValueChange={(value: 'AND' | 'OR') => updateRule(rule.id, { operator: value })}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="AND">且 (AND)</SelectItem>
                                                                <SelectItem value="OR">或 (OR)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {config.rules.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>暂无逻辑规则</p>
                                        <p className="text-sm">点击"添加规则"开始配置</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
} 