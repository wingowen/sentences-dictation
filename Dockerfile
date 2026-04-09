# 第一阶段：构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./
COPY netlify/functions/package.json ./netlify/functions/
COPY netlify/functions/shared/package.json ./netlify/functions/shared/
COPY netlify/functions/supabase/package.json ./netlify/functions/supabase/

# 使用 BuildKit 缓存挂载加速 npm 安装
 # --mount=type=cache,target=/root/.npm: 在容器间复用 npm 缓存
 # --ignore-scripts: 跳过 postinstall 脚本，避免 supabase 下载 GitHub CLI 失败
 RUN --mount=type=cache,target=/root/.npm \
     npm ci \
     --registry=https://registry.npmmirror.com \
     --ignore-scripts \
     --no-audit \
     --no-fund

# 复制源码并构建前端
COPY . .
RUN npm run build

# ============================================
# 第二阶段：运行
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 复制 Functions 代码
COPY --from=builder /app/netlify/functions ./netlify/functions

# 复制 package.json 和 server.cjs
COPY package*.json ./
COPY server.cjs ./

# 使用 BuildKit 缓存挂载加速 npm 安装
 # --ignore-scripts: 跳过 postinstall 脚本
RUN --mount=type=cache,target=/root/.npm \
    npm ci \
    --registry=https://registry.npmmirror.com \
    --ignore-scripts \
    --no-audit \
    --no-fund

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.cjs"]