'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles } from 'lucide-react'

interface TraditionalModeProps {
	prompt: string
	onPromptChange: (value: string) => void
	onGenerate: () => void
	isGenerating: boolean
}

export function TraditionalMode({
	prompt,
	onPromptChange,
	onGenerate,
	isGenerating,
}: TraditionalModeProps) {
	return (
		<div className="space-y-4">
			<div>
				<label className="text-sm font-medium mb-2 block">
					请输入完整的问卷需求描述
				</label>
				<Textarea
					className="w-full min-h-[120px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="例如：我需要创建一份客户满意度调查问卷，目标受众是18-35岁的年轻消费者，包含产品质量、服务态度、价格合理性等方面的评价..."
					value={prompt}
					onChange={(e) => onPromptChange(e.target.value)}
				/>
			</div>
			<Button onClick={onGenerate} className="w-full" disabled={isGenerating}>
				<Sparkles className="h-4 w-4 mr-2" />
				{isGenerating ? '生成中...' : '一键生成问卷'}
			</Button>
		</div>
	)
}
