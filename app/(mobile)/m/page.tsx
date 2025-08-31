'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Clock, Users, Shield } from 'lucide-react'
import Link from 'next/link'

export default function MobileHomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* 主要内容区域 */}
            <div className="px-6 pt-20 pb-8">
                {/* 问卷图标 */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-white" />
                    </div>
                </div>

                {/* 问卷标题 */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-3">用户体验调研问卷</h1>
                    <p className="text-base text-gray-600 leading-relaxed">
                        帮助我们了解您的使用体验，提升产品服务质量
                    </p>
                </div>

                {/* 问卷描述 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                    <p className="text-gray-700 text-center leading-relaxed text-sm">
                        感谢您参与我们的用户体验调研，您的反馈对我们非常重要。通过填写这份问卷，您将帮助我们更好地理解用户需求，优化产品功能，提供更优质的服务体验。
                    </p>
                </div>

                {/* 问卷信息卡片 */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <Clock className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">预计用时</p>
                        <p className="text-base font-medium text-gray-900">3-5分钟</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">问题数量</p>
                        <p className="text-base font-medium text-gray-900">8个问题</p>
                    </div>
                </div>

                {/* 开始答题按钮 */}
                <div className="mb-8">
                    <Link href="/m/survey/1" className="block">
                        <Button
                            size="lg"
                            className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600 border-0"
                        >
                            开始填写问卷
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* 隐私保护说明 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-sm">您的信息将被严格保密，仅用于产品改进</span>
                    </div>
                </div>

                {/* 底部信息 */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mb-3">
                        <span>匿名填写</span>
                        <span>•</span>
                        <span>随时可退出</span>
                        <span>•</span>
                        <span>数据安全</span>
                    </div>
                    <p className="text-xs text-gray-400">
                        本问卷由专业团队设计，感谢您的宝贵时间
                    </p>
                </div>
            </div>
        </div>
    )
}
