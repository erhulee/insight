import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function NoData() {
  return (
    <div className="text-center py-12 border rounded-lg">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">未找到匹配的模板</h3>
      <p className="text-muted-foreground mb-4">尝试使用不同的搜索词或清除过滤器</p>
      <Button variant="outline" onClick={() => {}}>
        清除筛选条件
      </Button>
    </div>
  )
}
