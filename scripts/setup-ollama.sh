#!/bin/bash

# Ollama 快速设置脚本
# 用于快速安装和配置Ollama

set -e

echo "🚀 开始设置 Ollama..."

# 检查操作系统
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "📋 检测到操作系统: $MACHINE"

# 检查是否已安装Ollama
if command -v ollama &> /dev/null; then
    echo "✅ Ollama 已安装"
else
    echo "📥 正在安装 Ollama..."
    
    if [ "$MACHINE" = "Mac" ]; then
        # macOS 安装
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo "❌ 请先安装 Homebrew，或访问 https://ollama.ai/download 手动下载"
            exit 1
        fi
    elif [ "$MACHINE" = "Linux" ]; then
        # Linux 安装
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        echo "❌ 不支持的操作系统，请访问 https://ollama.ai/download 手动安装"
        exit 1
    fi
fi

# 启动Ollama服务
echo "🔧 启动 Ollama 服务..."
ollama serve &
OLLAMA_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务是否启动
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama 服务启动成功"
else
    echo "❌ Ollama 服务启动失败"
    exit 1
fi

# 下载推荐模型
echo "📦 下载推荐模型 qwen2.5:7b..."
ollama pull qwen2.5:7b

# 测试模型
echo "🧪 测试模型..."
ollama run qwen2.5:7b "你好，请简单介绍一下自己" > /dev/null 2>&1

echo "✅ Ollama 设置完成！"
echo ""
echo "📝 下一步："
echo "1. 启动项目: npm run dev"
echo "2. 访问: http://localhost:3000/dashboard/ai-settings"
echo "3. 测试连接"
echo "4. 开始使用AI问卷生成功能"
echo ""
echo "🔧 管理Ollama服务："
echo "- 停止服务: pkill ollama"
echo "- 查看模型: ollama list"
echo "- 运行模型: ollama run qwen2.5:7b"

# 保存PID以便后续管理
echo $OLLAMA_PID > .ollama.pid
echo "💡 PID已保存到 .ollama.pid" 