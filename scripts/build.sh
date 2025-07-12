#!/bin/bash

# 构建脚本 - 自动处理Docker构建问题

set -e

echo "🚀 开始构建问卷星应用..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 清理旧的构建缓存
echo "🧹 清理旧的构建缓存..."
docker system prune -f

# 构建镜像
echo "🔨 构建Docker镜像..."
docker build -f Dockerfile.stable -t survey-platform:latest .

# 检查构建是否成功
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo ""
    echo "📋 运行命令："
    echo "  docker run -p 3000:3000 survey-platform:latest"
    echo ""
    echo "或者使用docker-compose："
    echo "  docker-compose up"
else
    echo "❌ 构建失败"
    exit 1
fi 