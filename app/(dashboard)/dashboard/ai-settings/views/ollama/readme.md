# OllamaServiceManager 重构技术方案

## 1. 现状分析

### 当前问题

- **逻辑与UI耦合**: 业务逻辑直接写在组件中
- **状态管理混乱**: 多个 useState 分散管理
- **模拟数据**: 使用静态数据，未连接真实服务
- **可维护性差**: 单个文件345行，职责不清
- **可测试性差**: 逻辑与UI混合，难以单元测试

### 重构目标

- **关注点分离**: UI组件与业务逻辑分离
- **可维护性**: 模块化设计，职责清晰
- **可测试性**: 独立的业务逻辑层
- **类型安全**: 完整的TypeScript类型定义
- **服务集成**: 连接真实的tRPC服务

## 2. 架构设计

### 2.1 整体架构

```
app/(dashboard)/dashboard/ai-settings/views/ollama/
├── index.tsx                    # 主入口组件
├── components/                  # UI组件层
│   ├── service-status-card.tsx  # 服务状态卡片
│   ├── model-management-card.tsx # 模型管理卡片
│   ├── quick-config-card.tsx    # 快速配置卡片
│   └── ui/                      # 通用UI组件
│       ├── status-badge.tsx
│       ├── progress-indicator.tsx
│       └── error-alert.tsx
├── hooks/                       # 业务逻辑层
│   ├── use-ollama-service.ts    # Ollama服务管理
│   ├── use-model-download.ts    # 模型下载逻辑
│   └── use-ollama-config.ts     # 配置管理
├── types/                       # 类型定义
│   └── ollama.types.ts
└── utils/                       # 工具函数
    └── ollama.utils.ts
```

### 2.2 分层架构

```
┌─────────────────────────────────────┐
│            UI Components            │  ← 纯展示组件
├─────────────────────────────────────┤
│         Custom Hooks                │  ← 业务逻辑层
├─────────────────────────────────────┤
│         tRPC Services               │  ← 数据服务层
├─────────────────────────────────────┤
│         Ollama Service              │  ← 后端服务层
└─────────────────────────────────────┘
```

## 3. 详细设计

### 3.1 类型定义 (`types/ollama.types.ts`)

```typescript
// Ollama 服务状态
export interface OllamaServiceStatus {
	isAvailable: boolean
	systemInfo?: {
		version: string
		gpu?: string
		memory?: string
		cpu?: string
	}
	models: string[]
	recommendedModels: string[]
}

// 下载进度
export interface PullProgress {
	status: 'downloading' | 'completed' | 'error'
	progress: number
	message?: string
}

// Ollama 配置
export interface OllamaConfig {
	type: 'ollama'
	baseUrl: string
	model: string
	name: string
}

// 组件Props类型
export interface OllamaServiceManagerProps {
	onConfigChange?: (config: OllamaConfig) => void
}

// Hook返回类型
export interface UseOllamaServiceReturn {
	serviceInfo: OllamaServiceStatus | null
	isLoading: boolean
	error: string | null
	refetch: () => void
}

export interface UseModelDownloadReturn {
	isDownloading: boolean
	progress: PullProgress | null
	downloadModel: (modelName: string) => Promise<void>
	cancelDownload: () => void
}
```

### 3.2 业务逻辑层 (`hooks/use-ollama-service.ts`)

```typescript
import { useState, useCallback } from 'react'
import { api } from '@/app/_trpc/client'
import type {
	OllamaServiceStatus,
	UseOllamaServiceReturn,
} from '../types/ollama.types'

export function useOllamaService(): UseOllamaServiceReturn {
	const [error, setError] = useState<string | null>(null)

	const {
		data: serviceInfo,
		isLoading,
		refetch,
		error: queryError,
	} = api.aiConfig.GetOllamaModels.useQuery()

	const handleRefetch = useCallback(async () => {
		setError(null)
		try {
			await refetch()
		} catch (err) {
			setError(err instanceof Error ? err.message : '获取服务信息失败')
		}
	}, [refetch])

	return {
		serviceInfo: serviceInfo || null,
		isLoading,
		error: error || queryError?.message || null,
		refetch: handleRefetch,
	}
}
```

### 3.3 模型下载逻辑 (`hooks/use-model-download.ts`)

```typescript
import { useState, useCallback } from 'react'
import { api } from '@/app/_trpc/client'
import type {
	PullProgress,
	UseModelDownloadReturn,
} from '../types/ollama.types'

export function useModelDownload(): UseModelDownloadReturn {
	const [isDownloading, setIsDownloading] = useState(false)
	const [progress, setProgress] = useState<PullProgress | null>(null)

	const pullModelMutation = api.aiConfig.PullOllamaModel.useMutation()

	const downloadModel = useCallback(
		async (modelName: string) => {
			setIsDownloading(true)
			setProgress({
				status: 'downloading',
				progress: 0,
				message: '开始下载...',
			})

			try {
				// 使用带进度的下载方法
				await pullModelMutation.mutateAsync({ modelName })

				setProgress({
					status: 'completed',
					progress: 100,
					message: '下载完成',
				})
			} catch (error) {
				setProgress({
					status: 'error',
					progress: 0,
					message: error instanceof Error ? error.message : '下载失败',
				})
			} finally {
				setIsDownloading(false)
			}
		},
		[pullModelMutation],
	)

	const cancelDownload = useCallback(() => {
		setIsDownloading(false)
		setProgress(null)
	}, [])

	return {
		isDownloading,
		progress,
		downloadModel,
		cancelDownload,
	}
}
```

### 3.4 UI组件层 (`components/service-status-card.tsx`)

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Server, Cpu, RefreshCw, AlertTriangle } from 'lucide-react'
import { StatusBadge } from './ui/status-badge'
import type { OllamaServiceStatus } from '../types/ollama.types'

interface ServiceStatusCardProps {
  serviceInfo: OllamaServiceStatus | null
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export function ServiceStatusCard({
  serviceInfo,
  isLoading,
  error,
  onRefresh
}: ServiceStatusCardProps) {
  const getStatusIcon = (isAvailable: boolean) => {
    return isAvailable ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Ollama 服务状态
        </CardTitle>
        <CardDescription>本地大模型服务状态和配置信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 服务状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(serviceInfo?.isAvailable || false)}
            <span className="font-medium">服务状态</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge isAvailable={serviceInfo?.isAvailable || false} />
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* 系统信息 */}
        {serviceInfo?.systemInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">系统信息</span>
            </div>
            <div className="ml-6 space-y-1">
              <div className="text-sm">
                <span className="font-medium">版本:</span>{' '}
                {serviceInfo.systemInfo.version}
              </div>
              {serviceInfo.systemInfo.gpu && (
                <div className="text-sm">
                  <span className="font-medium">GPU:</span>{' '}
                  {serviceInfo.systemInfo.gpu}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
```

### 3.5 主入口组件 (`index.tsx`)

```typescript
'use client'

import { ServiceStatusCard } from './components/service-status-card'
import { ModelManagementCard } from './components/model-management-card'
import { QuickConfigCard } from './components/quick-config-card'
import { useOllamaService } from './hooks/use-ollama-service'
import { useModelDownload } from './hooks/use-model-download'
import { useOllamaConfig } from './hooks/use-ollama-config'
import type { OllamaServiceManagerProps } from './types/ollama.types'

export function OllamaServiceManager({ onConfigChange }: OllamaServiceManagerProps) {
  const ollamaService = useOllamaService()
  const modelDownload = useModelDownload()
  const ollamaConfig = useOllamaConfig()

  const handleConfigChange = (config: OllamaConfig) => {
    onConfigChange?.(config)
  }

  return (
    <div className="space-y-6">
      <ServiceStatusCard
        serviceInfo={ollamaService.serviceInfo}
        isLoading={ollamaService.isLoading}
        error={ollamaService.error}
        onRefresh={ollamaService.refetch}
      />

      <ModelManagementCard
        serviceInfo={ollamaService.serviceInfo}
        isDownloading={modelDownload.isDownloading}
        progress={modelDownload.progress}
        onDownloadModel={modelDownload.downloadModel}
        onCancelDownload={modelDownload.cancelDownload}
      />

      <QuickConfigCard
        serviceInfo={ollamaService.serviceInfo}
        isDownloading={modelDownload.isDownloading}
        onAutoConfig={ollamaConfig.autoConfigure}
        onConfigChange={handleConfigChange}
      />
    </div>
  )
}
```

## 4. 实施计划

### 4.1 第一阶段：基础重构

1. **创建类型定义** (`types/ollama.types.ts`)
2. **实现核心Hook** (`hooks/use-ollama-service.ts`)
3. **拆分UI组件** (`components/service-status-card.tsx`)

### 4.2 第二阶段：功能完善

1. **实现下载逻辑** (`hooks/use-model-download.ts`)
2. **实现配置管理** (`hooks/use-ollama-config.ts`)
3. **完善UI组件** (模型管理、快速配置卡片)

### 4.3 第三阶段：集成测试

1. **tRPC集成** (连接真实服务)
2. **错误处理** (完善错误边界)
3. **性能优化** (缓存、防抖等)

## 5. 技术优势

### 5.1 可维护性

- **单一职责**: 每个组件和Hook职责明确
- **模块化**: 易于扩展和修改
- **类型安全**: 完整的TypeScript支持

### 5.2 可测试性

- **逻辑分离**: 业务逻辑可独立测试
- **依赖注入**: 便于Mock和测试
- **纯函数**: UI组件为纯展示组件

### 5.3 可复用性

- **组件复用**: UI组件可在其他地方使用
- **Hook复用**: 业务逻辑可在其他组件中使用
- **类型复用**: 类型定义可在整个应用中使用

### 5.4 开发体验

- **热重载**: 组件拆分后热重载更快
- **代码提示**: 完整的类型提示
- **错误定位**: 更精确的错误定位

这个重构方案将大大提高代码的可维护性、可测试性和开发效率，同时保持功能的完整性。
