'use client'
import type React from 'react'
import { use } from 'react'

export default function RootLayout(
  props: Readonly<{
    children: React.ReactNode
    params: Promise<{
      id: string
    }>
  }>,
) {
  const params = use(props.params)
  return <div>

    {props.children}</div>
}
