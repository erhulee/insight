import Link from 'next/link'
import { InsightBrand } from './common/insight-brand'
import { UserInfoAvatar } from './common/userInfoAvatar'

export function LayoutHeader(props: { hideBorder?: boolean }) {
  const { hideBorder } = props
  return (
    <header className={`${hideBorder ? '' : 'border-b'} w-full`}>
      <div className="flex h-16 items-center justify-between  max-w-[1500px] mx-auto relative ">
        <InsightBrand></InsightBrand>
        <nav className="flex items-center 2xl:gap-14 xl:gap-12 gap-8 2xl:text-base font-medium text-sm">
          <Link href="/dashboard" className=" ">
            我的问卷
            <div className=" w-[64px] h-[3px] rounded bg-primary absolute bottom-0"></div>
          </Link>
          <Link href="/templates" className=" text-muted-foreground">
            模板中心
          </Link>
          <Link href="/developer" className="text-muted-foreground">
            开发者中心
          </Link>
        </nav>
        <UserInfoAvatar></UserInfoAvatar>
      </div>
    </header>
  )
}
