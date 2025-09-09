import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

export function BasicConfig() {
	return (
		<div className="space-y-3">
			<div className="space-y-1">
				<div className="text-sm text-muted-foreground">题干</div>
				<Input />
			</div>
			<div className="flex items-center justify-between py-1">
				<div className="text-sm text-muted-foreground">必答题</div>
				<Switch />
			</div>
			<Separator />
		</div>
	)
}
