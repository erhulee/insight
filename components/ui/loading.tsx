import React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './spin'
import { Skeleton } from './skeleton'

// 加载状态类型
export type LoadingVariant = 'spinner' | 'dots' | 'bars' | 'pulse' | 'skeleton'

// 加载大小类型
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'

// 加载主题类型
export type LoadingTheme =
	| 'default'
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'error'

// 基础加载组件属性
export interface BaseLoadingProps {
	variant?: LoadingVariant
	size?: LoadingSize
	theme?: LoadingTheme
	text?: string
	className?: string
	fullScreen?: boolean
}

// 加载点组件
const LoadingDots = ({ size = 'md', theme = 'default' }: BaseLoadingProps) => {
	const sizeClasses = {
		sm: 'w-1 h-1',
		md: 'w-2 h-2',
		lg: 'w-3 h-3',
		xl: 'w-4 h-4',
	}

	const themeClasses = {
		default: 'bg-muted-foreground',
		primary: 'bg-primary',
		secondary: 'bg-secondary',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500',
	}

	return (
		<div className="flex space-x-1">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className={cn(
						'rounded-full animate-bounce',
						sizeClasses[size],
						themeClasses[theme],
					)}
					style={{
						animationDelay: `${i * 0.1}s`,
						animationDuration: '1s',
					}}
				/>
			))}
		</div>
	)
}

// 加载条组件
const LoadingBars = ({ size = 'md', theme = 'default' }: BaseLoadingProps) => {
	const sizeClasses = {
		sm: 'w-1 h-3',
		md: 'w-1.5 h-4',
		lg: 'w-2 h-6',
		xl: 'w-3 h-8',
	}

	const themeClasses = {
		default: 'bg-muted-foreground',
		primary: 'bg-primary',
		secondary: 'bg-secondary',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500',
	}

	return (
		<div className="flex space-x-1">
			{[0, 1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className={cn(
						'rounded-sm animate-pulse',
						sizeClasses[size],
						themeClasses[theme],
					)}
					style={{
						animationDelay: `${i * 0.1}s`,
						animationDuration: '1.5s',
					}}
				/>
			))}
		</div>
	)
}

// 脉冲加载组件
const LoadingPulse = ({ size = 'md', theme = 'default' }: BaseLoadingProps) => {
	const sizeClasses = {
		sm: 'w-6 h-6',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16',
	}

	const themeClasses = {
		default: 'bg-muted-foreground',
		primary: 'bg-primary',
		secondary: 'bg-secondary',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500',
	}

	return (
		<div
			className={cn(
				'rounded-full animate-ping',
				sizeClasses[size],
				themeClasses[theme],
			)}
		/>
	)
}

// 骨架屏加载组件
const LoadingSkeleton = ({ size = 'md', className }: BaseLoadingProps) => {
	const sizeClasses = {
		sm: 'h-4',
		md: 'h-6',
		lg: 'h-8',
		xl: 'h-12',
	}

	return (
		<div className="space-y-2">
			<Skeleton className={cn(sizeClasses[size], 'w-full', className)} />
			<Skeleton className={cn(sizeClasses[size], 'w-3/4', className)} />
			<Skeleton className={cn(sizeClasses[size], 'w-1/2', className)} />
		</div>
	)
}

// 主加载组件
export const Loading = ({
	variant = 'spinner',
	size = 'md',
	theme = 'default',
	text,
	className,
	fullScreen = false,
}: BaseLoadingProps) => {
	const sizeMap = {
		sm: 16,
		md: 24,
		lg: 32,
		xl: 48,
	}

	const renderLoadingContent = () => {
		switch (variant) {
			case 'spinner':
				return (
					<LoadingSpinner
						size={sizeMap[size]}
						className={cn('text-foreground', className)}
					/>
				)
			case 'dots':
				return <LoadingDots size={size} theme={theme} />
			case 'bars':
				return <LoadingBars size={size} theme={theme} />
			case 'pulse':
				return <LoadingPulse size={size} theme={theme} />
			case 'skeleton':
				return <LoadingSkeleton size={size} className={className} />
			default:
				return (
					<LoadingSpinner
						size={sizeMap[size]}
						className={cn('text-foreground', className)}
					/>
				)
		}
	}

	const content = (
		<div className="flex flex-col items-center justify-center space-y-4">
			{renderLoadingContent()}
			{text && (
				<p
					className={cn(
						'text-sm text-muted-foreground text-center',
						size === 'sm' && 'text-xs',
						size === 'lg' && 'text-base',
						size === 'xl' && 'text-lg',
					)}
				>
					{text}
				</p>
			)}
		</div>
	)

	if (fullScreen) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
				{content}
			</div>
		)
	}

	return content
}

// 页面加载组件
export const PageLoading = ({
	text = '页面加载中...',
	variant = 'spinner',
	size = 'lg',
	theme = 'primary',
	className,
}: Omit<BaseLoadingProps, 'fullScreen'>) => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<Loading
				variant={variant}
				size={size}
				theme={theme}
				text={text}
				className={className}
			/>
		</div>
	)
}

// 卡片加载组件
export const CardLoading = ({
	text = '加载中...',
	variant = 'skeleton',
	size = 'md',
	theme = 'default',
	className,
}: BaseLoadingProps) => {
	return (
		<div className="p-6 border rounded-lg bg-card">
			<Loading
				variant={variant}
				size={size}
				theme={theme}
				text={text}
				className={className}
			/>
		</div>
	)
}

// 按钮加载组件
export const ButtonLoading = ({
	size = 'sm',
	theme = 'primary',
	className,
}: Omit<BaseLoadingProps, 'variant' | 'text' | 'fullScreen'>) => {
	return (
		<Loading
			variant="spinner"
			size={size}
			theme={theme}
			className={className}
		/>
	)
}

// 表格加载组件
export const TableLoading = ({
	rows = 5,
	columns = 4,
}: {
	rows?: number
	columns?: number
}) => {
	return (
		<div className="space-y-3">
			{/* 表头骨架 */}
			<div className="flex space-x-4">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={`header-${i}`} className="h-4 w-20" />
				))}
			</div>

			{/* 表格行骨架 */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div key={`row-${rowIndex}`} className="flex space-x-4">
					{Array.from({ length: columns }).map((_, colIndex) => (
						<Skeleton
							key={`cell-${rowIndex}-${colIndex}`}
							className="h-4 w-24"
						/>
					))}
				</div>
			))}
		</div>
	)
}

// 列表加载组件
export const ListLoading = ({
	items = 3,
	columns = 1,
}: {
	items?: number
	columns?: number
}) => {
	const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-${columns} gap-4`
	return (
		<div className={cn(' gap-3 w-full', gridClass)}>
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="p-4 border rounded-lg bg-card">
					<div className="flex items-center space-x-3">
						<Skeleton className="h-10 w-10" />
						<div className="space-y-2 flex-1">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

// 默认导出
export default Loading
