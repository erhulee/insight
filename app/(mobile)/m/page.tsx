'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default function MobileHomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* 顶部标题区域 */}
            <div className="px-6 pt-16 pb-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">夏令营报名表</h1>
                    <p className="text-gray-500 text-base">请填写以下信息完成报名</p>
                </div>
            </div>

            {/* 说明文字 */}
            <div className="px-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm leading-relaxed text-center">
                        感谢您对我们夏令营活动的关注，请认真填写以下信息，我们将根据您提供的信息进行审核。
                    </p>
                </div>
            </div>

            {/* 开始答题按钮 */}
            <div className="px-6 mb-8">
                <Link href="/m/survey/1" className="block">
                    <Button
                        size="lg"
                        className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600 border-0 shadow-sm"
                    >
                        开始填写
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>

            {/* 底部信息 */}
            <div className="px-6 pb-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-400 mb-4">
                        <span>预计用时: 3-5分钟</span>
                        <span>•</span>
                        <span>问题数量: 5个</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        您的信息将被严格保密，仅用于活动组织
                    </p>
                </div>
            </div>
        </div>
    )
}
