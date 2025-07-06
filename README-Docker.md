# Survey Platform - Docker 部署指南

本项目支持使用 Docker 进行容器化部署，提供完整的开发和生产环境支持。

## 📋 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd survey-platform
```

### 2. 环境配置

复制环境变量模板并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# 数据库配置
DATABASE_URL="mysql://survey_user:survey_password@mysql:3306/survey_platform"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 其他配置
NODE_ENV="production"
```

### 3. 一键部署

使用提供的部署脚本：

```bash
./scripts/deploy.sh
```

或者手动部署：

```bash
# 构建并启动服务
docker-compose -f docker-compose.simple.yml up --build -d

# 等待数据库启动后运行迁移
docker-compose -f docker-compose.simple.yml exec app npx prisma migrate deploy
```

### 4. 访问应用

部署完成后，访问以下地址：

- **应用地址**: http://localhost:3000
- **数据库**: localhost:3306 (用户名: survey_user, 密码: survey_password)

## 🛠️ 管理命令

### 查看服务状态

```bash
docker-compose -f docker-compose.simple.yml ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.simple.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.simple.yml logs -f app
docker-compose -f docker-compose.simple.yml logs -f mysql
```

### 停止服务

```bash
docker-compose -f docker-compose.simple.yml down
```

### 重启服务

```bash
docker-compose -f docker-compose.simple.yml restart
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose -f docker-compose.simple.yml up --build -d

# 运行数据库迁移
docker-compose -f docker-compose.simple.yml exec app npx prisma migrate deploy
```

## 🔧 高级配置

### 使用完整版 Docker Compose

项目提供了两个 Docker Compose 配置：

- `docker-compose.simple.yml` - 简化版（推荐）
- `docker-compose.yml` - 完整版（包含 Nginx 反向代理）

使用完整版：

```bash
docker-compose up --build -d
```

### 自定义端口

编辑 `docker-compose.simple.yml` 文件，修改端口映射：

```yaml
app:
  ports:
    - "8080:3000"  # 将应用端口改为 8080
```

### 数据持久化

数据库数据会自动持久化到 Docker 卷中。如需备份：

```bash
# 备份数据库
docker-compose -f docker-compose.simple.yml exec mysql mysqldump -u survey_user -psurvey_password survey_platform > backup.sql

# 恢复数据库
docker-compose -f docker-compose.simple.yml exec -T mysql mysql -u survey_user -psurvey_password survey_platform < backup.sql
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :3000
   lsof -i :3306
   
   # 修改端口或停止占用进程
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库容器状态
   docker-compose -f docker-compose.simple.yml logs mysql
   
   # 重启数据库
   docker-compose -f docker-compose.simple.yml restart mysql
   ```

3. **应用启动失败**
   ```bash
   # 检查应用日志
   docker-compose -f docker-compose.simple.yml logs app
   
   # 检查环境变量
   docker-compose -f docker-compose.simple.yml exec app env
   ```

### 清理环境

```bash
# 停止并删除所有容器
docker-compose -f docker-compose.simple.yml down

# 删除所有相关镜像
docker rmi survey-platform_app

# 删除数据卷（谨慎操作，会丢失数据）
docker volume rm survey-platform_mysql_data
```

## 📊 监控和日志

### 容器资源使用

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器资源使用
docker stats survey-app survey-mysql
```

### 日志轮转

为防止日志文件过大，建议配置日志轮转：

```bash
# 在 docker-compose.simple.yml 中添加日志配置
app:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

## 🔒 安全建议

1. **修改默认密码**
   - 修改 `docker-compose.simple.yml` 中的数据库密码
   - 使用强密码生成器生成复杂密码

2. **限制网络访问**
   - 在生产环境中，移除数据库的端口映射
   - 使用 Docker 网络进行容器间通信

3. **定期更新**
   - 定期更新 Docker 镜像
   - 及时应用安全补丁

## 📞 支持

如遇到问题，请：

1. 查看项目 Issues
2. 检查 Docker 和系统日志
3. 联系技术支持团队

---

**注意**: 生产环境部署前，请确保：
- 修改所有默认密码
- 配置 SSL 证书
- 设置适当的防火墙规则
- 配置备份策略 