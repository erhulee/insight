#!/usr/bin/env node

/**
 * 测试AI生成的选项格式
 * 用于验证单选题和多选题的选项是否正确生成
 */

const testPrompts = [
  '创建一个客户满意度调查问卷',
  '设计一个员工工作环境调查',
  '制作一个市场调研问卷',
  '创建一个活动反馈问卷'
]

// 模拟AI响应（使用优化后的提示词）
const mockAIResponse = {
  title: "客户满意度调查",
  description: "了解客户对我们产品和服务的满意度",
  questions: [
    {
      id: "q_1",
      type: "single",
      title: "您对我们的产品总体满意度如何？",
      description: "请选择最符合您感受的选项",
      required: true,
      pageSize: 1,
      props: {
        options: [
          {
            label: "非常满意",
            value: "very_satisfied",
            id: "opt_very_satisfied"
          },
          {
            label: "满意",
            value: "satisfied",
            id: "opt_satisfied"
          },
          {
            label: "一般",
            value: "neutral",
            id: "opt_neutral"
          },
          {
            label: "不满意",
            value: "dissatisfied",
            id: "opt_dissatisfied"
          },
          {
            label: "非常不满意",
            value: "very_dissatisfied",
            id: "opt_very_dissatisfied"
          }
        ]
      }
    },
    {
      id: "q_2",
      type: "multiple",
      title: "您最喜欢我们产品的哪些方面？（可多选）",
      required: false,
      pageSize: 1,
      props: {
        options: [
          {
            label: "用户界面设计",
            value: "ui_design",
            id: "opt_ui_design"
          },
          {
            label: "功能丰富性",
            value: "features",
            id: "opt_features"
          },
          {
            label: "易用性",
            value: "usability",
            id: "opt_usability"
          },
          {
            label: "性能表现",
            value: "performance",
            id: "opt_performance"
          },
          {
            label: "客户支持",
            value: "support",
            id: "opt_support"
          },
          {
            label: "价格合理性",
            value: "price",
            id: "opt_price"
          }
        ]
      }
    }
  ]
}

function validateOptionsFormat(questions) {
  console.log('🔍 验证选项格式...\n')
  
  let validCount = 0
  let totalCount = 0
  
  questions.forEach((question, index) => {
    totalCount++
    console.log(`问题 ${index + 1}: ${question.title}`)
    console.log(`类型: ${question.type}`)
    
    if (question.type === 'single' || question.type === 'multiple') {
      if (question.props && question.props.options && Array.isArray(question.props.options)) {
        console.log('✅ 选项数组存在')
        
        let optionsValid = true
        question.props.options.forEach((option, optIndex) => {
          console.log(`  选项 ${optIndex + 1}:`)
          
          // 检查必需字段
          if (!option.label) {
            console.log('   ❌ 缺少 label 字段')
            optionsValid = false
          } else {
            console.log(`   ✅ label: "${option.label}"`)
          }
          
          if (!option.value) {
            console.log('   ❌ 缺少 value 字段')
            optionsValid = false
          } else {
            console.log(`   ✅ value: "${option.value}"`)
          }
          
          if (!option.id) {
            console.log('   ❌ 缺少 id 字段')
            optionsValid = false
          } else {
            console.log(`   ✅ id: "${option.id}"`)
          }
        })
        
        if (optionsValid) {
          console.log('✅ 所有选项格式正确\n')
          validCount++
        } else {
          console.log('❌ 选项格式有误\n')
        }
      } else {
        console.log('❌ 缺少选项数组\n')
      }
    } else {
      console.log('ℹ️  非选择题，跳过选项验证\n')
      validCount++
    }
  })
  
  console.log(`📊 验证结果: ${validCount}/${totalCount} 个问题格式正确`)
  return validCount === totalCount
}

function testPromptExamples() {
  console.log('🧪 测试提示词示例...\n')
  
  testPrompts.forEach((prompt, index) => {
    console.log(`${index + 1}. ${prompt}`)
  })
  
  console.log('\n这些提示词应该能生成包含正确选项格式的问卷。')
}

function showExpectedFormat() {
  console.log('\n📋 期望的选项格式:\n')
  console.log(JSON.stringify(mockAIResponse, null, 2))
}

// 运行测试
console.log('🚀 AI选项格式测试\n')
console.log('=' * 50)

// 测试模拟响应
const isValid = validateOptionsFormat(mockAIResponse.questions)

console.log('\n' + '=' * 50)

if (isValid) {
  console.log('🎉 所有测试通过！选项格式正确。')
} else {
  console.log('⚠️  发现格式问题，请检查选项结构。')
}

console.log('\n' + '=' * 50)

// 显示测试提示词
testPromptExamples()

// 显示期望格式
showExpectedFormat()

console.log('\n💡 使用说明:')
console.log('1. 确保Ollama服务正在运行')
console.log('2. 使用上述提示词测试AI生成')
console.log('3. 检查生成的选项是否包含 label、value、id 字段')
console.log('4. 验证选项格式是否符合预期') 