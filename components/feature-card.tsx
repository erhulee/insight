export function FeatureCard(props: {
    title: string;
    description: string;
    icon: React.ReactNode
}) {
    const { title, description, icon } = props
    return (
        <div className="rounded-lg border bg-background p-6 shadow-sm">
            <div className=" flex gap-2 items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <p className="mt-2 text-gray-500">{description}</p>
        </div>
    )
}