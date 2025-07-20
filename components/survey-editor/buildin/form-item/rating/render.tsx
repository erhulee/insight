import React, { useState } from 'react'
import { Star, Heart, Hash } from 'lucide-react'
import { RatingQuestionSchemaType } from '@/lib/dsl/rating'
import { ratingTypes } from './index'

interface RatingQuestionProps {
    dsl: RatingQuestionSchemaType
    value?: number
    onChange?: (value: number) => void
    disabled?: boolean
}

export function RatingQuestion({ dsl, value, onChange, disabled }: RatingQuestionProps) {
    const {
        props: {
            maxRating = 5,
            ratingType = 'star',
            minLabel = '非常不认同',
            maxLabel = '非常认同',
            showLabels = true,
            description,
        } = {},
    } = dsl

    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const handleClick = (rating: number) => {
        if (!disabled && onChange) {
            onChange(rating)
        }
    }

    const handleMouseEnter = (rating: number) => {
        if (!disabled) {
            setHoverValue(rating)
        }
    }

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoverValue(null)
        }
    }

    const renderIcon = (index: number, isFilled: boolean) => {
        const iconProps = {
            className: `w-6 h-6 transition-colors ${isFilled ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`,
        }

        switch (ratingType) {
            case 'star':
                return <Star {...iconProps} />
            case 'heart':
                return <Heart {...iconProps} />
            case 'number':
                return (
                    <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${isFilled ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-500'
                            }`}
                    >
                        {index + 1}
                    </div>
                )
            default:
                return <Star {...iconProps} />
        }
    }

    const currentValue = hoverValue !== null ? hoverValue : value

    return (
        <div className="space-y-4">
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            <div className="flex items-center justify-between">
                {showLabels && (
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            {minLabel}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            {maxLabel}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {Array.from({ length: maxRating }).map((_, index) => {
                    const rating = index + 1
                    const isFilled = currentValue !== undefined && rating <= currentValue

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleClick(rating)}
                            onMouseEnter={() => handleMouseEnter(rating)}
                            onMouseLeave={handleMouseLeave}
                            disabled={disabled}
                            className={`p-1 transition-all hover:scale-110 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                        >
                            {renderIcon(index, isFilled)}
                        </button>
                    )
                })}
            </div>

            {currentValue && (
                <div className="text-sm text-muted-foreground">
                    当前评分: {currentValue} / {maxRating}
                </div>
            )}
        </div>
    )
} 