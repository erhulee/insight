import { Switch } from '@/components/ui/switch'

export function DateConfig() {
	return (
		<div className="flex items-center justify-between py-1">
			<div className="text-sm text-muted-foreground">是否为范围选择</div>
			<Switch />
		</div>
	)
}
