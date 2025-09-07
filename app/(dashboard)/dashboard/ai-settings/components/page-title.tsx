interface PageTitleProps {
	title: string
	description: string
}

export function PageTitle({ title, description }: PageTitleProps) {
	return (
		<div className="text-left space-y-2">
			<h1 className="text-3xl font-bold">{title}</h1>
			<p className="text-muted-foreground mx-auto">{description}</p>
		</div>
	)
}
