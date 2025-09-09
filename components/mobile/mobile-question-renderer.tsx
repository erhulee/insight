'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Question } from '@/lib/api-types'
import {
	TextInput,
	TextareaInput,
	SelectInput,
	RadioInput,
	CheckboxInput,
	RatingInput,
	DateInput,
	NumberInput,
	EmailInput,
	PhoneInput,
	UrlInput,
} from './mobile-question-types'

interface MobileQuestionRendererProps {
	question: Question
	value: any
	onChange: (value: any) => void
	error?: string
}

export function MobileQuestionRenderer({
	question,
	value,
	onChange,
	error,
}: MobileQuestionRendererProps) {
	const hasError = !!error

	// 渲染不同类型的输入控件
	const renderInput = () => {
		switch (question.type) {
			case 'text':
				return (
					<TextInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'textarea':
				return (
					<TextareaInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'select':
				return (
					<SelectInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'radio':
				return (
					<RadioInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'checkbox':
				return (
					<CheckboxInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'rating':
				return (
					<RatingInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'date':
				return (
					<DateInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'number':
				return (
					<NumberInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'email':
				return (
					<EmailInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'phone':
				return (
					<PhoneInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			case 'url':
				return (
					<UrlInput
						question={question}
						value={value}
						onChange={onChange}
						error={error || ''}
					/>
				)

			default:
				return (
					<div className="text-sm text-gray-500 p-4 text-center">
						不支持的问题类型: {question.type}
					</div>
				)
		}
	}

	return (
		<Card className={`w-full ${hasError ? 'border-destructive' : ''}`}>
			<CardHeader className="pb-4">
				<div className="flex items-start gap-2">
					<CardTitle className="text-lg font-semibold text-foreground leading-tight">
						{question.title}
						{question.required && <span className="text-red-500 ml-1">*</span>}
					</CardTitle>
				</div>
				{question.description && (
					<p className="text-sm text-muted-foreground mt-2 leading-relaxed">
						{question.description}
					</p>
				)}
			</CardHeader>
			<CardContent>
				{renderInput()}
				{hasError && (
					<p className="text-red-500 text-sm mt-3 flex items-center">
						<span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
						{error}
					</p>
				)}
			</CardContent>
		</Card>
	)
}
