import { Switch } from '@/components/ui/switch'
export function SingleConfig() {
	return (
		<div>
			<div className="flex items-center justify-between py-1">
				<div className="text-sm text-muted-foreground">选项顺序随机</div>
				<Switch />
			</div>
		</div>
	)
}
