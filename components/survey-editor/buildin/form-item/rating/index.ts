import { Star, Heart, Hash } from 'lucide-react'

export const ratingTypes = [
	{
		value: 'star',
		label: '星级评分',
		icon: Star,
	},
	{
		value: 'number',
		label: '数字评分',
		icon: Hash,
	},
	{
		value: 'heart',
		label: '爱心评分',
		icon: Heart,
	},
]

export * from './render'
export * from './schema'
