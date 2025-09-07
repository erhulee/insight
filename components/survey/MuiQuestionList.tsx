'use client'
import React, { memo } from 'react'
import {
	Typography,
	FormControl,
	RadioGroup,
	Radio,
	Stack,
	Card,
	CardContent,
} from '@mui/joy'
import Input from '@mui/joy/Input'
import Button from '@mui/joy/Button'
import { QuestionSchemaType } from '@/lib/dsl'
import type { SingleQuestionSchemaType } from '@/components/survey-editor/buildin/form-item/single/schema'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { DescriptionSchemaType } from '../survey-editor/buildin/form-item/description'
export interface MuiQuestionListProps {
	questions: QuestionSchemaType[]
	answers: Record<string, any>
	errors?: Record<string, string>
	isQuestionVisible: (id: string) => boolean
	onAnswerChange: (questionId: string, value: any) => void
}

function renderByType(
	q: QuestionSchemaType,
	value: any,
	error: string | undefined,
	onChange: (val: any) => void,
) {
	function isSingle(q: QuestionSchemaType): q is SingleQuestionSchemaType {
		return q.type === 'single'
	}
	function isDescription(q: QuestionSchemaType): q is DescriptionSchemaType {
		return q.type === 'description'
	}

	switch (q.type) {
		case 'input':
			return (
				<Input
					placeholder="Type in here…"
					value={value ?? ''}
					onChange={(e) => onChange(e.target.value)}
				/>
			)
		case 'single':
			// 缩小为 SingleQuestionSchemaType，以便访问 q.props.options
			if (!isSingle(q)) return null
			return (
				<FormControl>
					<RadioGroup
						value={value ?? ''}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							onChange(e.target.value)
						}
					>
						{q.props.options.map((opt, idx) => (
							<Radio key={idx} value={opt.value} label={opt.label} />
						))}
					</RadioGroup>
					{error && (
						<Typography level="body-xs" color="danger">
							{error}
						</Typography>
					)}
				</FormControl>
			)

		case 'rating':
			return (
				<Stack direction="row" alignItems="center" gap={1}>
					<Stack direction="row" gap={0.5}>
						{Array.from({ length: (q.props?.max as number) || 5 }).map(
							(_, idx) => {
								const selected = Number(value) === idx + 1
								return (
									<Button
										key={idx}
										size="sm"
										variant={selected ? 'solid' : 'soft'}
										color={selected ? 'primary' : 'neutral'}
										onClick={() => onChange(idx + 1)}
									>
										{idx + 1}
									</Button>
								)
							},
						)}
					</Stack>
					{error && (
						<Typography level="body-xs" color="danger">
							{error}
						</Typography>
					)}
				</Stack>
			)

		case 'date':
			return (
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DatePicker
						value={value ? dayjs(value as string) : null}
						onChange={(v: Dayjs | null) =>
							onChange(v ? v.format('YYYY-MM-DD') : '')
						}
						format="YYYY-MM-DD"
					/>
				</LocalizationProvider>
			)
		case 'description':
			if (!isDescription(q)) return null
			return (
				<Typography level="body-sm" color="neutral">
					{q.props.content || ''}
				</Typography>
			)

		default:
			return (
				<Typography level="body-sm" color="neutral">
					不支持的问题类型: {q.type}
				</Typography>
			)
	}
}

export const MuiQuestionList = memo(function MuiQuestionList(
	props: MuiQuestionListProps,
) {
	const {
		questions,
		answers,
		errors = {},
		isQuestionVisible,
		onAnswerChange,
	} = props

	return (
		<Stack gap={1.5}>
			{questions
				.filter((q) => isQuestionVisible(q.id))
				.map((q) => {
					const err = errors[q.id]
					const val = answers[q.id]
					return (
						<Card
							key={q.id}
							variant={err ? 'outlined' : 'soft'}
							color={err ? 'danger' : 'neutral'}
						>
							<CardContent>
								<Stack gap={0.75}>
									<Typography level="title-sm">
										{q.title}
										{q.required && (
											<Typography
												component="span"
												color="danger"
												level="body-sm"
												sx={{ ml: 0.5 }}
											>
												*
											</Typography>
										)}
									</Typography>
									{q.description && (
										<Typography level="body-sm" color="neutral">
											{q.description}
										</Typography>
									)}
									{renderByType(q, val, err, (v) => onAnswerChange(q.id, v))}
								</Stack>
							</CardContent>
						</Card>
					)
				})}
		</Stack>
	)
})

export default MuiQuestionList
