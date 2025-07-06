#!/bin/bash

# 部署脚本
set -e

echo "🚀 开始部署 Survey Platform..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p uploads
mkdir -p logs

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose -f docker-compose.simple.yml down

# 构建并启动容器
echo "🔨 构建并启动容器..."
docker-compose -f docker-compose.simple.yml up --build -d

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 30

# 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
docker-compose -f docker-compose.simple.yml exec app npx prisma migrate deploy || {
    echo "⚠️ 数据库迁移失败，尝试生成Prisma客户端..."
    docker-compose -f docker-compose.simple.yml exec app npx prisma generate
}

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.simple.yml ps

echo "✅ 部署完成！"
echo "🌐 应用地址: http://localhost:3000"
echo "📊 查看日志: docker-compose -f docker-compose.simple.yml logs -f" 