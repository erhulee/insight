import Link from 'next/link'
import { Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PromotionalHeader() {
	return (
		<header className="bg-card border-b border-border px-6 py-4">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<div className="flex items-center gap-8">
					<Link href="/" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">抖</span>
						</div>
						<span className="font-bold text-foreground">问卷开放平台</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							href="/developer/docs"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							文档中心
						</Link>
						<Link
							href="#features"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							能力概览
						</Link>
						<Link
							href="/developer/api-explorer"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							API Explorer
						</Link>
						<Link
							href="/developer/examples"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							代码示例
						</Link>
						<Link
							href="/developer/webhooks"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Webhooks
						</Link>
						<Link
							href="/openapi.yaml"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							OpenAPI
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-4">
					<div className="relative hidden md:block">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="搜索"
							className="pl-10 w-64 bg-muted border-border"
						/>
					</div>
					<Button asChild variant="ghost" size="sm">
						<Link href="/developer">
							<User className="h-4 w-4 mr-2" />
							开发者中心
						</Link>
					</Button>
				</div>
			</div>
		</header>
	)
}
