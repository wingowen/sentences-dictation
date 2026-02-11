# Netlify 部署指南

## 1. 安装 Netlify CLI（如果未安装）
```bash
npm install -g netlify-cli
```

## 2. 登录 Netlify
```bash
netlify login
```

## 3. 初始化项目
```bash
cd ~/code/sentences-dictation
netlify init
# 选择 "Create & configure a new site"
# 选择团队
# 站点名称：sentences-dictation（或自定义）
# 构建命令：npm run build
# 发布目录：dist
```

## 4. 配置环境变量
```bash
# 设置 Supabase 配置
netlify env:set SUPABASE_URL "https://db.gtcnjqeloworstrimcsr.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "你的service_role密钥"

# 可选：Notion 集成
netlify env:set NOTION_API_KEY "你的notion_key"
netlify env:set NOTION_PAGE_ID "你的page_id"
```

## 5. 部署
```bash
# 预览部署
netlify deploy

# 生产部署
netlify deploy --prod
```

## 6. 访问
- 生产 URL: https://你的站点名.netlify.app
- Admin 后台: 需要单独部署 admin 目录

## 本地测试（可选）
如果想在本地测试，可以：
1. 启动 Netlify 本地开发服务器：
   ```bash
   netlify dev
   ```
2. 这会启动本地服务器并代理 Functions 到云端
