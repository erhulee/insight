"use client"

import type React from "react"
import type { Question } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface QuestionConfigProps {
  question: Question
  onUpdate: (updatedQuestion: Question) => void
}

export function QuestionConfig({ question, onUpdate }: QuestionConfigProps) {
  // 更新问题标题
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, title: e.target.value })
  }

  // 更新问题描述
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...question, description: e.target.value })
  }

  // 更新问题是否必填
  const handleRequiredChange = (checked: boolean) => {
    onUpdate({ ...question, required: checked })
  }

  // 添加选项（用于单选、多选、下拉选择题）
  const handleAddOption = () => {
    const options = [...(question.options || [])]
    options.push({ text: `选项 ${options.length + 1}`, value: `option-${options.length + 1}` })
    onUpdate({ ...question, options })
  }

  // 更新选项文本
  const handleOptionTextChange = (index: number, text: string) => {
    const options = [...(question.options || [])]
    options[index] = { ...options[index], text }
    onUpdate({ ...question, options })
  }

  // 删除选项
  const handleDeleteOption = (index: number) => {
    const options = [...(question.options || [])]
    options.splice(index, 1)
    onUpdate({ ...question, options })
  }

  // 更新选项顺序
  const handleMoveOption = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= (question.options?.length || 0)) return

    const options = [...(question.options || [])]
    const [removed] = options.splice(fromIndex, 1)
    options.splice(toIndex, 0, removed)
    onUpdate({ ...question, options })
  }

  // 更新文本题的占位文本
  const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...question, placeholder: e.target.value })
  }

  // 更新评分题的最大评分
  const handleMaxRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxRating = Number.parseInt(e.target.value)
    if (!isNaN(maxRating) && maxRating > 0) {
      onUpdate({ ...question, maxRating })
    }
  }

  // 渲染基本配置选项
  const renderBasicConfig = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-title">问题标题</Label>
          <Input id="question-title" value={question.title} onChange={handleTitleChange} placeholder="输入问题标题" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-description">问题描述（可选）</Label>
          <Textarea
            id="question-description"
            value={question.description || ""}
            onChange={handleDescriptionChange}
            placeholder="输入问题描述或提示信息"
            rows={3}
          />
        </div>

        {question.type !== "section" && (
          <div className="flex items-center space-x-2">
            <Switch
              id="question-required"
              checked={question.required || false}
              onCheckedChange={handleRequiredChange}
            />
            <Label htmlFor="question-required">必填</Label>
          </div>
        )}
      </div>
    )
  }

  // 渲染选项配置（用于单选、多选、下拉选择题）
  const renderOptionsConfig = () => {
    if (!["radio", "checkbox", "dropdown"].includes(question.type)) return null

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>选项列表</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> 添加选项
          </Button>
        </div>

        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <div className="cursor-grab">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                value={option.text}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                placeholder={`选项 ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteOption(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {question.type === "radio" && (
          <div className="flex items-center space-x-2">
            <Switch
              id="question-randomize"
              checked={question.randomize || false}
              onCheckedChange={(checked) => onUpdate({ ...question, randomize: checked })}
            />
            <Label htmlFor="question-randomize">随机排序选项</Label>
          </div>
        )}
      </div>
    )
  }

  // 渲染文本题特有配置
  const renderTextConfig = () => {
    if (question.type !== "text") return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-placeholder">占位文本</Label>
          <Input
            id="question-placeholder"
            value={question.placeholder || ""}
            onChange={handlePlaceholderChange}
            placeholder="请输入..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="question-multiline"
            checked={question.multiline || false}
            onCheckedChange={(checked) => onUpdate({ ...question, multiline: checked })}
          />
          <Label htmlFor="question-multiline">多行文本</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="question-min-length">最小字符数</Label>
            <Input
              id="question-min-length"
              type="number"
              min="0"
              value={question.minLength || ""}
              onChange={(e) => onUpdate({ ...question, minLength: Number.parseInt(e.target.value) || undefined })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question-max-length">最大字符数</Label>
            <Input
              id="question-max-length"
              type="number"
              min="0"
              value={question.maxLength || ""}
              onChange={(e) => onUpdate({ ...question, maxLength: Number.parseInt(e.target.value) || undefined })}
            />
          </div>
        </div>
      </div>
    )
  }

  // 渲染评分题特有配置
  const renderRatingConfig = () => {
    if (question.type !== "rating") return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-max-rating">最大评分值</Label>
          <Input
            id="question-max-rating"
            type="number"
            min="2"
            max="10"
            value={question.maxRating || 5}
            onChange={handleMaxRatingChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-rating-type">评分样式</Label>
          <select
            id="question-rating-type"
            className="w-full px-3 py-2 border rounded-md bg-background"
            value={question.ratingType || "number"}
            onChange={(e) => onUpdate({ ...question, ratingType: e.target.value })}
          >
            <option value="number">数字</option>
            <option value="star">星星</option>
            <option value="heart">心形</option>
          </select>
        </div>
      </div>
    )
  }

  // 渲染日期题特有配置
  const renderDateConfig = () => {
    if (question.type !== "date") return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-min-date">最早日期</Label>
          <Input
            id="question-min-date"
            type="date"
            value={question.minDate || ""}
            onChange={(e) => onUpdate({ ...question, minDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-max-date">最晚日期</Label>
          <Input
            id="question-max-date"
            type="date"
            value={question.maxDate || ""}
            onChange={(e) => onUpdate({ ...question, maxDate: e.target.value })}
          />
        </div>
      </div>
    )
  }

  // 渲染文件上传题特有配置
  const renderFileConfig = () => {
    if (question.type !== "file") return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-max-files">最大文件数</Label>
          <Input
            id="question-max-files"
            type="number"
            min="1"
            max="10"
            value={question.maxFiles || 1}
            onChange={(e) => onUpdate({ ...question, maxFiles: Number.parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-max-size">最大文件大小 (MB)</Label>
          <Input
            id="question-max-size"
            type="number"
            min="1"
            max="50"
            value={question.maxSize || 5}
            onChange={(e) => onUpdate({ ...question, maxSize: Number.parseInt(e.target.value) || 5 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-file-types">允许的文件类型</Label>
          <Input
            id="question-file-types"
            placeholder="例如: .pdf,.jpg,.png"
            value={question.fileTypes || ""}
            onChange={(e) => onUpdate({ ...question, fileTypes: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">用逗号分隔多个文件类型</p>
        </div>
      </div>
    )
  }

  // 渲染条件逻辑配置
  const renderLogicConfig = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="question-has-logic"
            checked={question.hasLogic || false}
            onCheckedChange={(checked) => onUpdate({ ...question, hasLogic: checked })}
          />
          <Label htmlFor="question-has-logic">启用条件逻辑</Label>
        </div>

        {question.hasLogic && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/30">
            <p className="text-sm text-muted-foreground">条件逻辑允许您根据用户的回答显示或隐藏问题。</p>

            <div className="space-y-2">
              <Label htmlFor="logic-source">当此问题的回答</Label>
              <select
                id="logic-source"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={question.logicCondition || "equals"}
                onChange={(e) => onUpdate({ ...question, logicCondition: e.target.value })}
              >
                <option value="equals">等于</option>
                <option value="not_equals">不等于</option>
                <option value="contains">包含</option>
                <option value="not_contains">不包含</option>
                <option value="greater_than">大于</option>
                <option value="less_than">小于</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logic-value">条件值</Label>
              <Input
                id="logic-value"
                value={question.logicValue || ""}
                onChange={(e) => onUpdate({ ...question, logicValue: e.target.value })}
                placeholder="输入条件值"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logic-action">执行操作</Label>
              <select
                id="logic-action"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={question.logicAction || "show"}
                onChange={(e) => onUpdate({ ...question, logicAction: e.target.value })}
              >
                <option value="show">显示问题</option>
                <option value="hide">隐藏问题</option>
                <option value="jump">跳转到问题</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logic-target">目标问题ID</Label>
              <Input
                id="logic-target"
                value={question.logicTarget || ""}
                onChange={(e) => onUpdate({ ...question, logicTarget: e.target.value })}
                placeholder="输入目标问题ID"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染验证规则配置
  const renderValidationConfig = () => {
    if (question.type === "section") return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="validation-type">验证类型</Label>
          <select
            id="validation-type"
            className="w-full px-3 py-2 border rounded-md bg-background"
            value={question.validationType || "none"}
            onChange={(e) => onUpdate({ ...question, validationType: e.target.value })}
          >
            <option value="none">无</option>
            <option value="email">电子邮箱</option>
            <option value="phone">电话号码</option>
            <option value="url">网址</option>
            <option value="number">数字</option>
            <option value="regex">自定义正则表达式</option>
          </select>
        </div>

        {question.validationType === "regex" && (
          <div className="space-y-2">
            <Label htmlFor="validation-regex">正则表达式</Label>
            <Input
              id="validation-regex"
              value={question.validationRegex || ""}
              onChange={(e) => onUpdate({ ...question, validationRegex: e.target.value })}
              placeholder="例如: ^[a-zA-Z0-9]+$"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="validation-message">验证失败提示信息</Label>
          <Input
            id="validation-message"
            value={question.validationMessage || ""}
            onChange={(e) => onUpdate({ ...question, validationMessage: e.target.value })}
            placeholder="请输入有效的值"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="options" disabled={!["radio", "checkbox", "dropdown"].includes(question.type)}>
            选项
          </TabsTrigger>
          <TabsTrigger value="advanced">高级</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          {renderBasicConfig()}
          {renderTextConfig()}
          {renderRatingConfig()}
          {renderDateConfig()}
          {renderFileConfig()}
        </TabsContent>

        <TabsContent value="options" className="space-y-4 pt-4">
          {renderOptionsConfig()}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-md p-3">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary p-1 rounded mr-2 text-xs">验证</span>
                数据验证规则
              </h4>
              {renderValidationConfig()}
            </div>

            <div className="bg-muted/50 rounded-md p-3">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary p-1 rounded mr-2 text-xs">逻辑</span>
                条件逻辑
              </h4>
              {renderLogicConfig()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
