# 句子听写项目 - Docker 部署方案

## 一、项目技术栈分析

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | React 19 + Vite 7 | 静态构建，输出到 `dist` |
| 后端 | Netlify Functions | Node.js Serverless 函数 |
| 数据库 | Supabase | PostgreSQL + REST API |
| 依赖 | axios, cheerio, notion-client, edge-tts | API 调用和爬虫 |

## 二、Docker 部署可行性

### 核心挑战
Netlify Functions 是平台特定服务，原生无法直接在 Docker 中运行。

### 解决方案
用 **Express.js** 模拟 Netlify Functions 行为：

| Netlify 原生 | Docker 方案 |
|-------------|-------------|
| 前端 (dist/) | Nginx 静态服务 |
| Functions | Express.js API 路由 |

## 三、部署架构

```
┌─────────────────────────────────────────┐
│                 Nginx                   │
│            (端口 80/443)                 │
│  /     →  静态文件 (前端 dist)           │
│  /api/* →  代理到 Express (3000)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│              Express.js                 │
│            (端口 3000)                   │
│  /api/xxx     → 对应 netlify/functions  │
│  /api-admin/* → 对应 netlify/functions  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│              Supabase                   │
│         (外部服务，无需容器化)           │
└─────────────────────────────────────────┘
```

## 四、文件设计

### 1. Dockerfile (前端 + API)

```dockerfile
# 第一阶段：构建
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY netlify/functions/package.json ./netlify/functions/
COPY netlify/functions/shared/package.json ./netlify/functions/shared/
RUN npm ci

COPY . .
RUN npm run build

# 第二阶段：运行
FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/netlify/functions ./functions
COPY package*.json ./
COPY server.js ./

RUN npm ci --production

EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. docker-compose.yml

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NOTION_API_KEY=${NOTION_API_KEY}
      - NOTION_DATABASE_ID=${NOTION_DATABASE_ID}
    restart: unless-stopped
```

### 3. server.js (Express 模拟)

- 静态文件服务 (前端 dist)
- API 路由代理 (模拟 Netlify Functions)

## 五、实施步骤

1. ✅ 分析完成
2. ⬜ 创建 Dockerfile
3. ⬜ 创建 server.js (Express)
4. ⬜ 更新 docker-compose.yml
5. ⬜ 测试构建和运行

## 六、结论

**可行性：✅ 可行**

- 前端：无缝迁移 (Nginx)
- Functions：需用 Express 重写 (~20 个函数)
- 数据库：直接连接 Supabase (无需改动)

**预估工作量：** 2-4 小时完成适配