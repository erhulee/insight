import { Button } from "../ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, UserIcon } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { logout } from "@/app/login/service";
export function UserInfoAvatar() {
    const userInfo = trpc.GetUserInfo.useQuery()
    const handleLogOut = async () => {
        await logout()
        userInfo.refetch()
    }
    if (userInfo.data) {
        return (
            <div className="ml-4 flex items-center gap-4">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Avatar>
                            <AvatarFallback>{userInfo.data?.username}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 relative -left-6 top-4">
                        <DropdownMenuItem >
                            <Link href="/account" className=" flex gap-2 items-center">
                                <UserIcon></UserIcon>
                                账户设置
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            handleLogOut()
                        }}>
                            <LogOut></LogOut>
                            退出登陆
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    } else {
        return (<div className="ml-4 flex items-center gap-4">
            <Link href="/login">
                <Button variant="outline" size="sm">
                    登录
                </Button>
            </Link>
            <Link href="/register">
                <Button size="sm">注册</Button>
            </Link>
        </div>)

    }
}