// 预定义的AI服务提供商
export const AI_SERVICE_PROVIDERS = [
	{
		id: 'volcano',
		name: '火山引擎',
		type: 'volcano',
		description: '字节跳动火山引擎大模型服务，支持豆包等模型',
		baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
		models: [
			'doubao-seed-1-6-250615',
			'doubao-pro-4k-20241220',
			'doubao-lite-4k-20241220',
			'doubao-pro-32k-20241220',
			'doubao-lite-32k-20241220',
		],
		defaultConfig: {},
	},
	{
		id: 'custom',
		name: '自定义服务',
		type: 'custom',
		description: '自定义AI服务配置',
		baseUrl: '',
		models: [],
		defaultConfig: {},
	},
]
