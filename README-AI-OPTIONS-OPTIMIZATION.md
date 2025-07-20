# AI 选项格式优化说明

## 🎯 优化概述

已优化AI问卷生成功能中的选项格式，确保单选题和多选题能够正确生成包含 `label`、`value`、`id` 三个字段的选项。

## 🔧 优化内容

### 1. 提示词优化

更新了 `buildSurveyPrompt` 函数，明确指定选项格式要求：

```typescript
// 选项格式要求：
- label: 选项显示文本
- value: 选项值（英文或数字）
- id: 唯一标识符（英文或数字）

// 问题类型说明：
- "single": 单选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "multiple": 多选题 - 必须包含props.options数组，每个选项包含label、value、id字段
- "textarea": 文本域 - 不需要options
- "input": 文本输入 - 不需要options
```

### 2. 模板更新

更新了所有模板生成函数中的选项格式：

**优化前：**
```json
{
  "props": {
    "options": [
      {"text": "非常满意", "value": "very_satisfied"},
      {"text": "满意", "value": "satisfied"}
    ]
  }
}
```

**优化后：**
```json
{
  "props": {
    "options": [
      {
        "label": "非常满意",
        "value": "very_satisfied",
        "id": "opt_very_satisfied"
      },
      {
        "label": "满意",
        "value": "satisfied",
        "id": "opt_satisfied"
      }
    ]
  }
}
```

### 3. 字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `label` | string | 选项显示文本 | "非常满意" |
| `value` | string | 选项值（用于数据处理） | "very_satisfied" |
| `id` | string | 唯一标识符 | "opt_very_satisfied" |

## 📁 更新的文件

### 1. 核心文件
- `server/ai-service.ts` - 提示词和模板优化
- `app/dashboard/create/_components/AISurveyGeneratorStream.tsx` - 恢复创建功能

### 2. 测试文件
- `scripts/test-ai-options.js` - 选项格式验证脚本

### 3. 配置文件
- `package.json` - 添加测试脚本

## 🧪 测试验证

### 运行测试脚本
```bash
npm run test:ai-options
```

### 测试内容
1. **选项格式验证**: 检查每个选项是否包含必需字段
2. **提示词示例**: 提供测试用的提示词
3. **期望格式**: 显示正确的选项格式示例

### 测试输出示例
```
🚀 AI选项格式测试

🔍 验证选项格式...

问题 1: 您对我们的产品总体满意度如何？
类型: single
✅ 选项数组存在
  选项 1:
   ✅ label: "非常满意"
   ✅ value: "very_satisfied"
   ✅ id: "opt_very_satisfied"
  选项 2:
   ✅ label: "满意"
   ✅ value: "satisfied"
   ✅ id: "opt_satisfied"
✅ 所有选项格式正确

📊 验证结果: 2/2 个问题格式正确
🎉 所有测试通过！选项格式正确。
```

## 🚀 使用方法

### 1. 测试AI生成
```bash
# 启动Ollama服务
npm run ollama:start

# 运行选项格式测试
npm run test:ai-options

# 访问AI生成功能
# http://localhost:3000/dashboard/create
```

### 2. 推荐提示词
- "创建一个客户满意度调查问卷"
- "设计一个员工工作环境调查"
- "制作一个市场调研问卷"
- "创建一个活动反馈问卷"

### 3. 验证生成结果
检查生成的问卷中单选题和多选题是否包含：
- ✅ `label` 字段（显示文本）
- ✅ `value` 字段（选项值）
- ✅ `id` 字段（唯一标识）

## 🔍 故障排除

### 常见问题

1. **选项格式不正确**
   - 检查AI模型是否正确理解提示词
   - 确认提示词中明确指定了选项格式要求
   - 运行测试脚本验证格式

2. **缺少选项字段**
   - 确保每个选项都包含 `label`、`value`、`id` 三个字段
   - 检查字段名称是否正确（不是 `text` 而是 `label`）

3. **ID重复**
   - 确保每个选项的 `id` 字段是唯一的
   - 建议使用有意义的ID命名规则

### 调试方法

1. **查看控制台日志**
   ```javascript
   console.log("generatedSurvey.questions:", generatedSurvey.questions)
   ```

2. **检查AI响应**
   - 在流式生成过程中查看原始JSON
   - 确认选项数组结构正确

3. **运行测试脚本**
   ```bash
   npm run test:ai-options
   ```

## 📊 优化效果

### 优化前问题
- ❌ 选项格式不统一
- ❌ 缺少必需的字段
- ❌ 无法正确渲染选项
- ❌ 数据存储格式不一致

### 优化后效果
- ✅ 选项格式统一规范
- ✅ 包含所有必需字段
- ✅ 正确渲染选项
- ✅ 数据存储格式一致
- ✅ 支持前端组件正确显示

## 🎨 界面展示

### 优化后的选项显示
```
┌─────────────────────────────────────┐
│ 您对我们的产品总体满意度如何？       │
├─────────────────────────────────────┤
│ ○ 非常满意                          │
│ ○ 满意                              │
│ ○ 一般                              │
│ ○ 不满意                            │
│ ○ 非常不满意                        │
└─────────────────────────────────────┘
```

### 数据结构
```json
{
  "type": "single",
  "props": {
    "options": [
      {
        "label": "非常满意",
        "value": "very_satisfied",
        "id": "opt_very_satisfied"
      }
    ]
  }
}
```

## 🔮 未来扩展

### 计划功能
1. **更多选项类型**: 支持图片选项、评分选项
2. **选项验证**: 添加选项格式的自动验证
3. **智能ID生成**: 自动生成唯一的选项ID
4. **选项模板**: 提供常用选项模板

### 技术改进
1. **格式验证**: 在生成过程中验证选项格式
2. **错误修复**: 自动修复常见的格式问题
3. **性能优化**: 优化选项渲染性能
4. **缓存机制**: 缓存常用的选项组合

## 📚 相关文档

- [Ollama设置指南](README-OLLAMA-SETUP.md)
- [AI问卷生成功能说明](README-AI-SURVEY.md)
- [SSE流式生成功能说明](README-SSE-STREAMING.md)
- [AI功能实现总结](README-AI-IMPLEMENTATION.md)

## 🎉 总结

选项格式优化确保了AI生成的问卷能够正确显示和存储：

✅ **格式统一**: 所有选项都使用相同的字段结构
✅ **字段完整**: 包含显示文本、值和唯一标识
✅ **兼容性好**: 与前端组件完美兼容
✅ **易于维护**: 清晰的数据结构便于后续开发
✅ **测试完善**: 提供验证脚本确保格式正确

这个优化让AI问卷生成功能更加稳定和可靠！ 