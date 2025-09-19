import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
	isAvailable: boolean
}

export function StatusBadge({ isAvailable }: StatusBadgeProps) {
	return isAvailable ? (
		<Badge variant="default" className="bg-green-100 text-green-800">
			服务正常
		</Badge>
	) : (
		<Badge variant="destructive">服务异常</Badge>
	)
}
