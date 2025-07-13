#!/usr/bin/env node

/**
 * 认证API测试脚本
 * 用于验证中间件和认证API的功能
 */

const fetch = require('node-fetch')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

/**
 * 测试健康检查API
 */
async function testHealthCheck() {
  console.log('🔍 测试健康检查API...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`)
    const data = await response.json()
    
    console.log('✅ 健康检查成功:', data)
    return data.status === 'ok'
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message)
    return false
  }
}

/**
 * 测试认证验证API
 */
async function testAuthValidation() {
  console.log('🔍 测试认证验证API...')
  
  const testCases = [
    {
      name: '空token',
      token: '',
      expectedSuccess: false
    },
    {
      name: '无效token',
      token: 'invalid-token',
      expectedSuccess: false
    },
    {
      name: '有效token (需要真实token)',
      token: 'your-valid-token-here',
      expectedSuccess: true
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n📝 测试: ${testCase.name}`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: testCase.token }),
      })
      
      const data = await response.json()
      
      if (testCase.expectedSuccess) {
        if (data.success) {
          console.log('✅ 测试通过:', data)
        } else {
          console.log('❌ 测试失败: 期望成功但返回失败')
        }
      } else {
        if (!data.success) {
          console.log('✅ 测试通过: 正确返回失败')
        } else {
          console.log('❌ 测试失败: 期望失败但返回成功')
        }
      }
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
    }
  }
}

/**
 * 测试中间件功能
 */
async function testMiddleware() {
  console.log('🔍 测试中间件功能...')
  
  const testCases = [
    {
      name: '访问公开页面',
      path: '/',
      headers: {},
      expectedAuth: false
    },
    {
      name: '访问保护页面 (无token)',
      path: '/dashboard',
      headers: {},
      expectedAuth: false
    },
    {
      name: '访问保护页面 (有token)',
      path: '/dashboard',
      headers: {
        'Cookie': 'session=your-valid-token-here'
      },
      expectedAuth: true
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n📝 测试: ${testCase.name}`)
    
    try {
      const response = await fetch(`${BASE_URL}${testCase.path}`, {
        headers: testCase.headers,
      })
      
      const hasAuthHeader = response.headers.get('x-user-id') !== null
      
      if (hasAuthHeader === testCase.expectedAuth) {
        console.log('✅ 测试通过')
      } else {
        console.log('❌ 测试失败: 认证状态不符合预期')
      }
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
    }
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始认证API测试...\n')
  
  // 测试健康检查
  const healthOk = await testHealthCheck()
  
  if (!healthOk) {
    console.log('\n❌ 健康检查失败，停止测试')
    process.exit(1)
  }
  
  // 测试认证验证
  await testAuthValidation()
  
  // 测试中间件
  await testMiddleware()
  
  console.log('\n✅ 所有测试完成')
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testHealthCheck,
  testAuthValidation,
  testMiddleware,
  runTests
} 