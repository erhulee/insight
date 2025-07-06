.PHONY: help build up down logs restart clean deploy

# 默认目标
help:
	@echo "可用的命令:"
	@echo "  make build    - 构建Docker镜像"
	@echo "  make up       - 启动服务"
	@echo "  make down     - 停止服务"
	@echo "  make logs     - 查看日志"
	@echo "  make restart  - 重启服务"
	@echo "  make clean    - 清理所有容器和镜像"
	@echo "  make deploy   - 一键部署"

# 构建镜像
build:
	docker-compose -f docker-compose.simple.yml build

# 启动服务
up:
	docker-compose -f docker-compose.simple.yml up -d

# 停止服务
down:
	docker-compose -f docker-compose.simple.yml down

# 查看日志
logs:
	docker-compose -f docker-compose.simple.yml logs -f

# 重启服务
restart:
	docker-compose -f docker-compose.simple.yml restart

# 清理环境
clean:
	docker-compose -f docker-compose.simple.yml down -v
	docker system prune -f

# 一键部署
deploy:
	@echo "🚀 开始部署..."
	@make down
	@make build
	@make up
	@echo "⏳ 等待服务启动..."
	@sleep 30
	@echo "🗄️ 运行数据库迁移..."
	@docker-compose -f docker-compose.simple.yml exec app npx prisma migrate deploy || echo "⚠️ 迁移失败，跳过..."
	@echo "✅ 部署完成！访问 http://localhost:3000"

# 开发环境
dev-build:
	docker build -t survey-platform:dev .

dev-run:
	docker run -p 3000:3000 --env-file .env survey-platform:dev

# 生产环境
prod-build:
	docker build -f Dockerfile.prod -t survey-platform:prod .

prod-run:
	docker run -p 3000:3000 --env-file .env survey-platform:prod 