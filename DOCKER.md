# Docker 部署指南

## 快速开始

1. **克隆项目**
```bash
git clone <repo-url>
cd survey-platform
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库连接等
```

3. **一键部署**
```bash
./scripts/deploy.sh
```

4. **访问应用**
- 应用: http://localhost:3000
- 数据库: localhost:3306

## 常用命令

```bash
# 启动服务
docker-compose -f docker-compose.simple.yml up -d

# 查看日志
docker-compose -f docker-compose.simple.yml logs -f

# 停止服务
docker-compose -f docker-compose.simple.yml down

# 重启服务
docker-compose -f docker-compose.simple.yml restart

# 更新应用
git pull
docker-compose -f docker-compose.simple.yml up --build -d
```

## 环境变量

必需的环境变量：
- `DATABASE_URL`: MySQL 数据库连接字符串
- `NEXTAUTH_SECRET`: NextAuth 密钥
- `NEXTAUTH_URL`: 应用访问地址

## 故障排除

1. **端口冲突**: 修改 docker-compose.simple.yml 中的端口映射
2. **数据库连接失败**: 检查 DATABASE_URL 配置
3. **应用启动失败**: 查看容器日志 `docker-compose logs app` 