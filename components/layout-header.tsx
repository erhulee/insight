import Link from "next/link";
import { InsightBrand } from "./common/insight-brand";
import { UserInfoAvatar } from "./common/userInfoAvatar";

export function LayoutHeader(props: {
    hideBorder?: boolean
}) {
    const { hideBorder } = props;
    return (
        <header className={`${hideBorder ? "" : "border-b"}  w-full`}>
            <div className="flex h-16 items-center justify-between ">
                <InsightBrand></InsightBrand>
                <nav className="flex items-center gap-14">
                    <Link href="/dashboard" className=" text-base font-medium border-b">
                        我的问卷
                    </Link>
                    <Link href="/templates" className="text-base font-medium text-muted-foreground">
                        模板中心
                    </Link>
                    <Link href="/developer" className="text-base font-medium text-muted-foreground">
                        开发者中心
                    </Link>
                </nav>
                <UserInfoAvatar></UserInfoAvatar>

            </div>
        </header>
    )
}