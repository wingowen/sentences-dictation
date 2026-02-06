# 后台管理 - 快速启动指南

## 1. 安装依赖

```bash
cd admin
npm install
```

## 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_URL=/.netlify/functions/api
VITE_SUPABASE_URL=https://db.gtcnjqeloworstrimcsr.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 在 Supabase 执行数据库脚本

在 Supabase Dashboard 的 SQL Editor 中执行：
- `supabase/schema.sql`

## 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 5. 登录

- 邮箱：`admin@example.com`
- 密码：`admin123`

## 6. 构建生产版本

```bash
npm run build
```

构建文件在 `dist/` 目录，可部署到 Netlify、Vercel 等平台。
