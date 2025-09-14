import Link from 'next/link'
import { Brand } from './common/brand'
import { UserInfoAvatar } from './common/userInfoAvatar'
import { ThemeToggle } from './ui/theme-toggle'

type ActiveTab =
	| 'dashboard'
	| 'templates'
	| 'developer'
	| 'ai-settings'
	| 'price'

export function LayoutHeader(props: {
	hideBorder?: boolean
	activeTab?: ActiveTab
	layout?: 'top' | 'sidebar'
}) {
	const { hideBorder, activeTab, layout = 'top' } = props

	const nav = [
		{
			href: '/dashboard',
			label: '我的问卷',
			active: activeTab === 'dashboard',
		},
		{
			href: '/templates',
			label: '模板中心',
			active: activeTab === 'templates',
		},
		{
			href: '/developer',
			label: '开发者中心',
			active: activeTab === 'developer',
		},
		{
			href: '/price',
			label: '定价',
			active: activeTab === 'price',
		},
		{
			href: '/ai-settings',
			label: 'AI设置',
			active: activeTab === 'ai-settings',
		},
	]
	return (
		<header className={`${hideBorder ? '' : 'border-b'} w-full`}>
			<div className="flex h-16 items-center justify-between max-w-[1500px] mx-auto relative">
				<Brand />
				{layout === 'top' && (
					<nav className="flex items-center 2xl:gap-14 xl:gap-12 gap-8 2xl:text-base font-medium text-sm">
						{nav.map((item) => (
							<Link href={item.href}>
								<div
									className={`${item.active ? 'min-w-[64px] text-foreground text-center' : 'min-w-[64px] text-muted-foreground text-center'}`}
								>
									{item.label}
								</div>
								{item.active && (
									<div className=" w-[64px] h-[3px] rounded bg-primary absolute bottom-0"></div>
								)}
							</Link>
						))}
					</nav>
				)}
				<div className=" flex flex-row items-center gap-2">
					<ThemeToggle />
					<UserInfoAvatar />
				</div>
			</div>
		</header>
	)
}
