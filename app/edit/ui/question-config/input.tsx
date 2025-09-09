import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Input as NumberInput } from '@/components/ui/input'
export function InputConfig() {
	return (
		<div>
			<div className=" text-foreground mb-2 text-base">格式设置</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">文本格式</div>
				<Select>
					{/* TODO: replace with actual select options impl if needed */}
				</Select>
			</div>
			<div className="flex items-center justify-between py-1">
				<div className="text-sm text-muted-foreground">展示字数</div>
				<Switch />
			</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">最多填写</div>
				<NumberInput placeholder="不限" />
			</div>
			<div className="space-y-2">
				<div className="text-sm text-muted-foreground">提示文案</div>
				<Input placeholder="请输入" />
			</div>
		</div>
	)
}
