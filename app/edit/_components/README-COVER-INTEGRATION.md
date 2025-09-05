# 问卷封面配置集成说明

## 📋 概述

本文档说明如何通过"基本设置"按钮访问和配置问卷封面设置。

## 🏗️ 集成架构

### 组件关系
```
WidgetPanel (左侧面板)
    ↓
基本设置按钮 → 链接到 ?tab=page
    ↓
SuveryPageConfig (右侧面板)
    ↓
Tabs 组件
    ├── 基本设置 (原有功能)
    └── 封面配置 (新增功能)
        ↓
    SurveyCoverConfig (封面配置组件)
```

### 文件结构
```
app/(dashboard)/dashboard/edit/_components/
├── WidgetPanel.tsx           # 左侧面板，包含基本设置按钮
├── SuveryPageConfig.tsx      # 右侧页面配置面板
├── SurveyCoverConfig.tsx     # 封面配置组件
└── README-COVER-INTEGRATION.md # 本说明文档
```

## 🎯 使用方法

### 1. 访问封面配置
1. 在问卷编辑页面，点击左侧面板的"基本设置"按钮
2. 右侧会显示页面配置面板
3. 在配置面板中，切换到"封面配置"标签页
4. 即可看到完整的封面配置选项

### 2. 配置选项说明

#### 基础信息
- **预计用时**: 设置问卷预计填写时间（如：3-5分钟）
- **封面描述**: 自定义问卷封面的引导文案

#### 隐私和说明
- **隐私保护说明**: 自定义隐私保护相关文案
- **底部说明文案**: 自定义页面底部的说明文案

#### 视觉样式
- **封面图标**: 选择封面图标类型（文档、时钟、盾牌、消息）
- **主色调**: 选择封面主色调（蓝、绿、紫、橙、红）

#### 显示控制
- **显示进度信息**: 控制是否显示预计用时和问题数量
- **显示隐私说明**: 控制是否显示隐私保护说明

### 3. 实时预览
- 配置面板底部提供实时预览效果
- 可以直观看到配置后的封面样式

## 🔧 技术实现

### 1. 状态管理
```typescript
// 封面配置状态
const [coverConfig, setCoverConfig] = useState({
    estimatedTime: '',
    coverDescription: '',
    privacyNotice: '',
    bottomNotice: '',
    coverIcon: 'file-text',
    coverColor: 'blue',
    showProgressInfo: true,
    showPrivacyNotice: true,
})
```

### 2. 配置更新处理
```typescript
const handleCoverConfigUpdate = (config: Partial<typeof coverConfig>) => {
    setCoverConfig(prev => ({
        ...prev,
        ...config
    }))
    // TODO: 保存到数据库
    console.log('封面配置更新:', config)
}
```

### 3. 组件集成
```typescript
<Tabs
    defaultActiveKey="basic"
    items={[
        {
            key: 'basic',
            label: '基本设置',
            children: <BasicSettings />
        },
        {
            key: 'cover',
            label: '封面配置',
            children: (
                <SurveyCoverConfig
                    coverConfig={coverConfig}
                    onUpdate={handleCoverConfigUpdate}
                />
            )
        }
    ]}
/>
```

## 📱 用户体验流程

### 1. 配置流程
```
点击基本设置 → 显示配置面板 → 切换到封面配置 → 进行配置 → 实时预览
```

### 2. 配置保存
- 当前配置会保存在组件状态中
- 需要实现数据库保存逻辑
- 建议添加自动保存功能

### 3. 配置应用
- 配置会实时应用到问卷封面
- 移动端用户可以看到配置后的效果

## 🚀 扩展功能

### 1. 模板系统
- 创建预设的封面模板
- 支持快速应用常用配置

### 2. 批量配置
- 支持多个问卷的批量封面配置
- 统一的品牌风格管理

### 3. 高级定制
- 支持自定义CSS样式
- 支持更多图标和颜色选项

## ⚠️ 注意事项

### 1. 数据持久化
- 当前配置仅保存在组件状态中
- 需要实现数据库保存和读取逻辑
- 建议添加配置验证

### 2. 性能优化
- 大量配置项时考虑懒加载
- 配置更新时避免不必要的重渲染

### 3. 错误处理
- 添加配置验证和错误提示
- 处理配置加载失败的情况

## 📚 相关文档

- [SurveyCoverConfig 组件文档](./SurveyCoverConfig.tsx)
- [问卷封面组件文档](../../../mobile/m/[id]/survey-cover.tsx)
- [Prisma Schema 更新](../prisma/schema.prisma)

---

*本文档描述了问卷封面配置的集成使用方法，如有疑问请参考相关组件代码或联系开发团队。*
