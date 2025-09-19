'use client'

export default function TestPage() {
	const handleConfigChange = (config: any) => {
		console.log('配置变更:', config)
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Ollama 服务管理器预览</h1>
		</div>
	)
}
