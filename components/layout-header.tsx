import Link from 'next/link'
import { InsightBrand } from './common/insight-brand'
import { UserInfoAvatar } from './common/userInfoAvatar'

export function LayoutHeader(props: { hideBorder?: boolean, activeTab?: "dashboard" | "templates" | "developer" | "ai-settings" }) {
  const { hideBorder, activeTab } = props
  return (
    <header className={`${hideBorder ? '' : 'border-b'} w-full`}>
      <div className="flex h-16 items-center justify-between  max-w-[1500px] mx-auto relative ">
        <InsightBrand></InsightBrand>
        <nav className="flex items-center 2xl:gap-14 xl:gap-12 gap-8 2xl:text-base font-medium text-sm">
          <Link href="/dashboard" className={`${activeTab === "dashboard" ? "" : "text-muted-foreground"}`}>
            我的问卷
            {activeTab === "dashboard" && <div className=" w-[64px] h-[3px] rounded bg-primary absolute bottom-0"></div>}
          </Link>
          <Link href="/templates" className={`${activeTab === "templates" ? "" : "text-muted-foreground"}`}>
            模板中心
            {activeTab === "templates" && <div className=" w-[64px] h-[3px] rounded bg-primary absolute bottom-0"></div>}
          </Link>
          <Link href="/developer" className={`${activeTab === "developer" ? "" : "text-muted-foreground"}`}>
            开发者中心
            {activeTab === "developer" && <div className=" w-[64px] h-[3px] rounded bg-primary absolute bottom-0"></div>}
          </Link>
          <Link href="/ai-settings" className={`${activeTab === "ai-settings" ? "" : "text-muted-foreground"}`}>
            AI设置
            {activeTab === "ai-settings" && <div className=" w-[64px] h-[3px] rounded bg-primary absolute bottom-0"></div>}
          </Link>
        </nav>
        <UserInfoAvatar></UserInfoAvatar>
      </div>
    </header>
  )
}
