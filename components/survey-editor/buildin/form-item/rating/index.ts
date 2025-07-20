import { Star, Heart, Hash } from 'lucide-react'
import { IFormItemMeta } from '../core/type'
import { RatingQuestionSchema } from '@/lib/dsl/rating'

export const meta: IFormItemMeta<typeof RatingQuestionSchema> = {
    type: 'rating',
    title: '评价打分',
    icon: Star,
    schema: RatingQuestionSchema,
}

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
export * from './config' 