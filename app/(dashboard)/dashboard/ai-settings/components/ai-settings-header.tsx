interface AISettingsHeaderProps {
	title: string
	description: string
}

export function AISettingsHeader({
	title,
	description,
}: AISettingsHeaderProps) {
	return (
		<header className="border-b">
			<div className="flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-4">
					<h1 className="text-lg font-medium">{title}</h1>
				</div>
			</div>
		</header>
	)
}
