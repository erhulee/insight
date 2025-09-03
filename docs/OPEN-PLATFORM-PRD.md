### 开放平台（Open Platform）PRD

#### 文档信息
- 文档版本：v1.0
- 模块名称：开放平台（Open Platform）
- 产品负责人：-
- 技术负责人：-
- 预计版本：Beta v0.1
- 更新时间：2025-09-03

---

### 1. 背景与目标
- **背景**：现有问卷平台需要对外开放标准化接口，支持第三方应用“创建-配置-发布-收集-回传”问卷相关能力，并提供开发者后台、密钥管理、Webhooks 推送以及沙箱环境。
- **目标**
  - **对外能力**：创建问卷、更新配置、发布/下线、获取答卷、推送事件、导出。
  - **集成体验**：简明 API、清晰权限模型、稳定版本化、完善文档与 SDK。
  - **安全合规**：鉴权、权限最小化、审计、限流、防刷、防重放。
  - **商业化与运营**：可配置配额与速率、监控告警、统计分析、支持工单。

- **不做范围（V1 不包含）**
  - 内嵌第三方 JS SDK 自定义渲染（仅提供链接/ID）。
  - 图像/音视频大文件上传能力。
  - 复杂流程型审批与多组织级权限（保留为 V2）。

---

### 2. 用户画像与使用场景
- **用户画像**
  - **第三方开发者/ISV**：集成问卷创建和回传数据到自身系统。
  - **企业集成工程师**：打通 CRM/客服/营销系统。
  - **数据分析工程师**：拉取答卷数据做 BI。
- **核心场景**
  - **自动化拉起问卷**：系统触发创建问卷并下发填写链接。
  - **异步回传**：用户提交后，通过 Webhook 通知第三方。
  - **定期同步**：按需批量拉取问卷与答卷。
  - **模板化**：根据预设模板快速创建并定制。
  - **权限隔离**：团队/子账号仅可操作授权资源。

---

### 3. 产品范围与能力清单
- **开发者门户**
  - **应用管理**：创建应用、查看 AppId、重置/吊销密钥、设置回调、环境切换。
  - **凭证管理**：API Key、Client Credentials（OAuth2，可选 V1.1+）。
  - **Webhooks**：事件订阅、签名密钥、日志与重试。
  - **用量与账单**：调用量、成功率、限流状态、错误分布。
  - **文档与示例**：API 文档、交互式 Playground、SDK 下载。
- **API 能力**
  - **问卷管理**：创建、更新、发布/下线、获取详情、删除。
  - **配置管理**：基础信息、封面配置、题目结构（JSON DSL）。
  - **答卷管理**：分页查询、单条获取、导出、状态变更。
  - **事件通知**：问卷发布、答卷提交、答卷更新、问卷状态变更。
  - **系统能力**：健康检查、速率限制、签名校验、Idempotency-Key。
- **配额与限流**
  - 应用维度 QPS、日配额、突发限流、IP 黑白名单。
- **可观测性**
  - 追踪 ID、请求日志、错误分类、Webhook 重试与死信队列。

---

### 4. 信息架构与数据模型（核心）
- **App（开发者应用）**
  - id, name, ownerId, apiKey(hash), webhookUrl, webhookSecret, env(sandbox|prod),
    rateLimitPerMin, dailyQuota, status(active|suspended), createdAt, updatedAt
- **Survey（问卷）**
  - id, appId, name, description, published(boolean), questions(Json),
    coverConfig(Json), estimatedTime, privacyNotice, bottomNotice, coverIcon,
    coverColor, showProgressInfo, showPrivacyNotice, deletedAt, createdAt, updatedAt
- **Response（答卷）**
  - id, surveyId, externalUserId?, answers(Json), status(submitted|deleted),
    submittedAt, metadata(Json), createdAt, updatedAt
- **WebhookEvent**
  - id, appId, type, payload(Json), signature, deliveryStatus(pending|success|failed),
    retryCount, lastError?, createdAt, updatedAt

---

### 5. 功能需求与验收标准
- **应用管理**
  - 创建应用：必填 name；生成 apiKey 与 webhookSecret。
  - 重置密钥：立即生效，旧密钥1小时缓冲期（可配置）。
  - 设置 Webhook：支持多事件订阅；测试推送按钮。
  - 验收：门户可见、操作有审计日志、鉴权生效。
- **问卷管理 API**
  - 创建/更新/发布/下线/删除：状态机校验，发布后不可变更题目结构（需版本化或复制）。
  - 验收：状态变迁正确；权限校验正确；错误码完整。
- **答卷管理 API**
  - 查询/分页/导出：过滤条件（时间、状态、关键词、externalUserId）。
  - 验收：分页稳定；导出包含字段说明；时区一致。
- **Webhooks**
  - 事件类型：survey.published, response.submitted, response.updated, survey.unpublished
  - 签名：HMAC-SHA256，Header: `X-OpenSig`；重试策略：指数退避最多 8 次。
  - 验收：可在门户查看每条推送状态、重试、重放。
- **配额限流**
  - 基于 App 限流；返回 429 与 `Retry-After`。
  - 验收：突发保护有效；黑白名单生效；告警触发。
- **可用性与监控**
  - 健康检查 `/api/health`；SLA 99.9%（内网）。
  - 验收：Grafana/Logs 有仪表板；错误聚合清晰。

---

### 6. API 设计（tRPC + REST 网关）
- 推荐对外提供 REST（便于第三方），内部实现使用 tRPC/服务层。
- 所有 API 需带 `Authorization: Bearer <api_key>` 与 `Idempotency-Key`（对写操作）。

#### 6.1 REST 端点示例
- 创建问卷
  - POST `/api/open/v1/surveys`
  - Body:
```json
{
  "name": "Customer Feedback 2025",
  "description": "Q1 NPS survey",
  "questions": [{ "id": "q1", "type": "single", "title": "满意度", "options": ["好","一般","差"] }],
  "coverConfig": {
    "estimatedTime": "3-5分钟",
    "coverDescription": "感谢参与",
    "showProgressInfo": true
  }
}
```
  - Returns: 201 + { id, status }

- 发布问卷
  - POST `/api/open/v1/surveys/{id}/publish`

- 获取答卷（分页）
  - GET `/api/open/v1/surveys/{id}/responses?page=1&size=50&from=...&to=...`

- 导出答卷
  - POST `/api/open/v1/surveys/{id}/export`
  - Async job，返回 jobId；使用 GET `/api/open/v1/exports/{jobId}` 轮询或 Webhook 回调。

#### 6.2 Webhook 签名
- Header:
  - `X-OpenEvent`: 事件类型
  - `X-OpenTs`: 时间戳
  - `X-OpenSig`: `hex(hmac_sha256(webhookSecret, rawBody + '.' + timestamp))`

- 事件载荷示例
```json
{
  "id": "evt_123",
  "type": "response.submitted",
  "data": {
    "surveyId": "srv_abc",
    "responseId": "resp_xyz",
    "submittedAt": "2025-09-03T10:00:00Z"
  }
}
```

---

### 7. 权限与安全
- **鉴权**：API Key（V1），后续支持 OAuth2 Client Credentials（V1.1）。
- **权限模型**：App 仅可访问自身资源；最小权限 token（可细分读/写，V1.1）。
- **限流与配额**：按 AppId；429 + Retry-After；IP 黑白名单（运营配置）。
- **防重放**：时间戳 + 签名；Idempotency-Key 写操作幂等。
- **数据合规**：敏感字段脱敏；传输全程 HTTPS；审计日志。
- **Webhook 安全**：签名校验、失败重试、死信队列、回源拉取。

---

### 8. 开发者门户（前台）
- **页面**
  - 应用列表/详情、密钥管理、Webhook 配置、事件日志、调用统计、文档中心、Playground。
- **交互**
  - 复制密钥遮罩、双重确认重置、测试推送、导出事件日志 CSV。
- **技术**
  - Next.js App Router、Shadcn UI、Tailwind、tRPC、Prisma、Valtio（如需）。

---

### 9. 技术方案（后端）
- **组织**
  - `server/services/open/*`：领域服务
  - `server/router/open.ts`：tRPC 路由
  - `app/api/open/v1/*`：REST 网关（边缘/Node）
- **关键点**
  - API Key 中间件、App 与资源的租户隔离
  - 限流（Redis 令牌桶）、配额、审计
  - Webhook 分发（队列+重试+死信）
  - 导出任务（队列异步）
- **数据存储**
  - Prisma(PostgreSQL)；Webhook 投递状态单表；导出任务表

---

### 10. 指标与验收
- **核心指标**
  - 开发接入时长 ≤ 1 天
  - API 成功率 ≥ 99.9%
  - Webhook 端到端延迟 P95 ≤ 3s
  - 文档满意度 ≥ 4.5/5
- **验收清单**
  - 门户可创建应用并看到密钥
  - REST API 可创建/发布问卷，权限/限流生效
  - Webhook 可签名验证、可重试、可重放
  - Playground 可调用成功；SDK 示例可运行
  - 日志/监控/告警可用

---

### 11. 版本化与兼容策略
- **API 版本**：`/v1` 前缀；破坏性变更仅在大版本。
- **字段扩展**：新增为可选字段，默认不影响旧调用。
- **弃用策略**：Deprecation Header + 文档告知，至少 90 天过渡。

---

### 12. SDK 规划
- **语言**：TypeScript（优先），Python，PHP（Symfony 客户端）。
- **内容**：鉴权封装、签名校验、重试封装、类型提示、示例项目。
- **发布**：npm/packagist/pypi；SemVer。

---

### 13. 运维与风控
- **监控**：请求量、错误率、P95 延迟、429 次数、Webhook 成功率。
- **告警**：错误率 > 阈值、投递失败率 > 阈值、队列积压。
- **风控**：IP 黑名单、突发限流加严、可疑模式自动封禁（可灰度）。

---

### 14. 风险与对策
- **风险**
  - 第三方滥用 API
  - Webhook 被劫持/误配
  - 题目 DSL 复杂导致错误率高
- **对策**
  - 强鉴权、配额、可视化告警
  - 强签名校验、测试推送与回源拉取兜底
  - 提供校验器、示例与 Schema 文档

---

### 15. 项目计划（里程碑）
- **M1（2 周）**：数据模型与鉴权中间件、应用管理门户（基础）、创建/查询问卷 API。
- **M2（2 周）**：发布/下线、答卷查询、Webhook 基础投递与日志。
- **M3（2 周）**：导出异步任务、限流配额、仪表板与告警、文档与 SDK。
- **Beta 发布**：灰度 10% 应用；收集反馈优化至稳定。

---

### 16. 验收用例（样例）
- 创建应用 → 复制密钥 → 配置 Webhook → 创建问卷 → 发布 → 第三方收到 response.submitted → 调用导出 → 成功下载 CSV。

---

### 17. 附录：错误码示例
- **400**：参数错误（含字段详细说明）
- **401**：鉴权失败/密钥过期
- **403**：无权限访问目标资源
- **404**：资源不存在
- **409**：资源状态冲突（如重复发布）
- **429**：限流
- **500**：内部错误（包含 traceId）

---

如果需要，我可以把这份 PRD补充示意图与 API Swagger 示例。

