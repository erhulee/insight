import Link from "next/link";
import { InsightBrand } from "./common/insight-brand";
import { UserInfoAvatar } from "./common/userInfoAvatar";

export function LayoutHeader() {
    return (
        <header className="border-b">
            <div className="flex h-16 items-center justify-between px-4">
                <InsightBrand></InsightBrand>
                <nav className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-sm font-medium">
                        我的问卷
                    </Link>
                    <Link href="/templates" className="text-sm font-medium text-muted-foreground">
                        模板中心
                    </Link>
                    <Link href="/developer" className="text-sm font-medium text-muted-foreground">
                        开发者中心
                    </Link>
                    <UserInfoAvatar></UserInfoAvatar>
                </nav>
            </div>
        </header>
    )
}