import { Skeleton } from '@/components/ui/skeleton'

export function EditHeaderSkeleton() {
    return (
        <header className="sticky top-0 z-10 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4">
                {/* 左侧区域骨架屏 */}
                <div className="flex items-center gap-4">
                    {/* 返回按钮骨架屏 */}
                    <Skeleton className="h-10 w-10 rounded-md" />

                    {/* 品牌区域骨架屏 */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20 rounded" />
                        <Skeleton className="h-6 w-16 rounded" />
                    </div>
                </div>

                {/* 右侧操作区域骨架屏 */}
                <div className="flex items-center gap-2">
                    {/* 发布/取消发布按钮骨架屏 */}
                    <Skeleton className="h-9 w-20 rounded-md" />

                    {/* 分享按钮骨架屏 */}
                    <Skeleton className="h-9 w-16 rounded-md" />

                    {/* 保存按钮骨架屏 */}
                    <Skeleton className="h-9 w-16 rounded-md" />
                </div>
            </div>
        </header>
    )
}
