'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
	Star,
	StarOff,
	Heart,
	HeartOff,
	ThumbsUp,
	ThumbsDown,
} from 'lucide-react'
import { Question } from '@/lib/api-types'

interface QuestionInputProps {
	question: Question
	value: any
	onChange: (value: any) => void
	error?: string
}

/**
 * 文本输入组件
 */
export function TextInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Input
			id={question.id}
			type="text"
			placeholder={question.placeholder || '请输入...'}
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			className={`w-full h-12 text-base ${error ? 'border-destructive' : ''}`}
		/>
	)
}

/**
 * 多行文本输入组件
 */
export function TextareaInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Textarea
			id={question.id}
			placeholder={question.placeholder || '请输入...'}
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			rows={4}
			className={`w-full text-base resize-none ${error ? 'border-destructive' : ''}`}
		/>
	)
}

/**
 * 下拉选择组件
 */
export function SelectInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<div className="relative">
			<select
				id={question.id}
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				className={`w-full h-12 px-4 text-base border rounded-lg bg-background appearance-none ${error ? 'border-destructive' : 'border-border'}`}
			>
				<option value="">请选择...</option>
				{question.options?.map((option, index) => (
					<option key={index} value={option.value || option.text}>
						{option.text}
					</option>
				))}
			</select>
			<div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
				<svg
					className="w-5 h-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</div>
		</div>
	)
}

/**
 * 单选组件
 */
export function RadioInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<RadioGroup
			value={value || ''}
			onValueChange={onChange}
			className="space-y-3"
		>
			{question.options?.map((option, index) => (
				<div
					key={index}
					className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors"
				>
					<RadioGroupItem
						value={option.value || option.text}
						id={`${question.id}-${index}`}
						className="w-5 h-5"
					/>
					<Label
						htmlFor={`${question.id}-${index}`}
						className="text-base font-medium leading-none cursor-pointer flex-1"
					>
						{option.text}
					</Label>
				</div>
			))}
		</RadioGroup>
	)
}

/**
 * 多选组件
 */
export function CheckboxInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<div className="space-y-3">
			{question.options?.map((option, index) => (
				<div
					key={index}
					className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors"
				>
					<Checkbox
						id={`${question.id}-${index}`}
						checked={
							Array.isArray(value)
								? value.includes(option.value || option.text)
								: false
						}
						onCheckedChange={(checked) => {
							const currentValues = Array.isArray(value) ? value : []
							if (checked) {
								onChange([...currentValues, option.value || option.text])
							} else {
								onChange(
									currentValues.filter(
										(v) => v !== (option.value || option.text),
									),
								)
							}
						}}
						className="w-5 h-5"
					/>
					<Label
						htmlFor={`${question.id}-${index}`}
						className="text-base font-medium leading-none cursor-pointer flex-1"
					>
						{option.text}
					</Label>
				</div>
			))}
		</div>
	)
}

/**
 * 评分组件
 */
export function RatingInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	const maxRating = question.maxRating || 5
	const ratingType = question.ratingType || 'star'

	const renderRatingIcon = (rating: number, isSelected: boolean) => {
		switch (ratingType) {
			case 'heart':
				return isSelected ? (
					<Heart className="h-8 w-8 fill-current text-red-500" />
				) : (
					<HeartOff className="h-8 w-8 text-gray-300" />
				)
			case 'thumbs':
				return isSelected ? (
					<ThumbsUp className="h-8 w-8 fill-current text-blue-500" />
				) : (
					<ThumbsDown className="h-8 w-8 text-gray-300" />
				)
			default:
				return isSelected ? (
					<Star className="h-8 w-8 fill-current text-yellow-400" />
				) : (
					<StarOff className="h-8 w-8 text-gray-300" />
				)
		}
	}

	return (
		<div className="flex justify-center space-x-3">
			{Array.from({ length: maxRating }).map((_, index) => {
				const rating = index + 1
				const isSelected = value === rating
				return (
					<button
						key={index}
						type="button"
						onClick={() => onChange(rating)}
						className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
							isSelected
								? 'bg-yellow-100 scale-110'
								: 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
						}`}
					>
						{renderRatingIcon(rating, isSelected)}
					</button>
				)
			})}
		</div>
	)
}

/**
 * 日期输入组件
 */
export function DateInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Input
			id={question.id}
			type="date"
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			min={question.minDate}
			max={question.maxDate}
			className={`w-full h-12 text-base ${error ? 'border-destructive' : ''}`}
		/>
	)
}

/**
 * 数字输入组件
 */
export function NumberInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Input
			id={question.id}
			type="number"
			placeholder={question.placeholder || '请输入数字...'}
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			className={`w-full h-12 text-base ${error ? 'border-destructive' : ''}`}
		/>
	)
}

/**
 * 邮箱输入组件
 */
export function EmailInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Input
			id={question.id}
			type="email"
			placeholder={question.placeholder || '请输入邮箱地址...'}
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			className={`w-full h-12 text-base ${error ? 'border-destructive' : ''}`}
		/>
	)
}

/**
 * 手机号输入组件
 */
export function PhoneInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Input
			id={question.id}
			type="tel"
			placeholder={question.placeholder || '请输入手机号码...'}
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			className={`w-full h-12 text-base ${error ? 'border-destructive' : ''}`}
		/>
	)
}

/**
 * 网址输入组件
 */
export function UrlInput({
	question,
	value,
	onChange,
	error,
}: QuestionInputProps) {
	return (
		<Input
			id={question.id}
			type="url"
			placeholder={question.placeholder || '请输入网址...'}
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			className={`w-full h-12 text-base ${error ? 'border-destructive' : ''}`}
		/>
	)
}
