import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	Loader2,
	CheckCircle,
	XCircle,
	Settings,
	TestTube,
	Sparkles,
} from 'lucide-react'
import type { TestResult } from '../hooks/use-ai-settings'

interface AIConfig {
	id: string
	name: string
	type: string
	baseUrl: string
	model: string
	temperature: number
	topP: number
	repeatPenalty?: number | null
	maxTokens?: number | null
	isActive: boolean
	createdAt: string | Date
	updatedAt: string | Date
	userId: string
	apiKey?: string
}

interface ConnectionStatusCardProps {
	activeConfig: AIConfig | null
	isTesting: boolean
	testResult: TestResult | null
	onTestConnection: () => void
}

export function ConnectionStatusCard({
	activeConfig,
	isTesting,
	testResult,
	onTestConnection,
}: ConnectionStatusCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					当前活跃配置
				</CardTitle>
				<CardDescription>查看当前使用的AI服务配置状态</CardDescription>
			</CardHeader>
			<CardContent>
				{activeConfig ? (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">配置名称:</span>
							<Badge variant="outline">{activeConfig.name}</Badge>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">服务类型:</span>
							<Badge variant="outline">{activeConfig.type}</Badge>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">服务地址:</span>
							<code className="text-sm bg-muted px-2 py-1 rounded">
								{activeConfig.baseUrl}
							</code>
						</div>

						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">模型:</span>
							<Badge variant="secondary">{activeConfig.model}</Badge>
						</div>

						{/* 连接测试 */}
						<div className="pt-4">
							<Button
								onClick={onTestConnection}
								disabled={isTesting}
								variant="outline"
							>
								{isTesting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										测试中...
									</>
								) : (
									<>
										<TestTube className="mr-2 h-4 w-4" />
										测试连接
									</>
								)}
							</Button>
						</div>

						{/* 测试结果 */}
						{testResult && (
							<Alert variant={testResult.success ? 'default' : 'destructive'}>
								{testResult.success ? (
									<CheckCircle className="h-4 w-4" />
								) : (
									<XCircle className="h-4 w-4" />
								)}
								<AlertDescription>
									{testResult.success
										? '连接正常'
										: `连接失败: ${testResult.error}`}
								</AlertDescription>
							</Alert>
						)}
					</div>
				) : (
					<div className="text-center py-8">
						<Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground">
							没有可用的AI服务配置，请先添加配置
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
