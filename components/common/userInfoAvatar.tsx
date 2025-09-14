'use client'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowRight, LogOut, UserIcon } from 'lucide-react'
import { trpc } from '@/app/_trpc/client'
import { signOut } from 'next-auth/react'
export function UserInfoAvatar() {
	const userInfo = trpc.GetUserInfo.useQuery()
	const handleLogOut = async () => {
		await signOut()
		userInfo.refetch()
	}
	if (userInfo.data) {
		return (
			<div className="ml-4 flex items-center gap-4">
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Avatar>
							<AvatarFallback className="text-foreground">
								{userInfo.data?.username.slice(0, 3)}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56 relative -left-6 top-4">
						<DropdownMenuItem>
							<Link href="/account" className=" flex gap-2 items-center">
								<UserIcon></UserIcon>
								账户设置
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								handleLogOut()
							}}
						>
							<LogOut></LogOut>
							退出登陆
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		)
	} else {
		return (
			<div className="ml-4 flex items-center gap-1">
				<Link href="/login">
					<Button size="sm" className=" 2xl:w-24">
						登录
						<ArrowRight
							className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
							size={16}
							strokeWidth={2}
							aria-hidden="true"
						/>
					</Button>
				</Link>
				<Link href="/register">
					<Button variant="link" size="sm">
						注册
					</Button>
				</Link>
			</div>
		)
	}
}
