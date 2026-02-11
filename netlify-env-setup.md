# Netlify 环境变量配置指南

## 步骤：

### 1. 登录 Netlify Dashboard
访问：https://app.netlify.com

### 2. 选择你的站点
找到 sentences-dictation 项目

### 3. 配置环境变量
Site settings → Environment variables → Add a variable

#### 必需变量：
```
SUPABASE_URL=https://db.gtcnjqeloworstrimcsr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

#### 可选变量（Notion 集成）：
```
NOTION_API_KEY=你的notion_api_key
NOTION_PAGE_ID=你的notion_page_id
```

### 4. 获取密钥
- Supabase service_role key: Dashboard → Settings → API → service_role
- Notion key: https://www.notion.so/my-integrations

### 5. 触发重新部署
配置完成后：
- 方式1：Push 新代码
- 方式2：Deploys → Trigger deploy → Deploy site

---

## Admin 模块部署（可选）

Admin 模块需要单独部署：

### 方法1：新 Netlify 站点
```bash
cd ~/code/sentences-dictation/admin
# 在 Netlify 创建新站点
# 构建命令：npm run build
# 发布目录：dist
```

### 方法2：子路径部署
修改主项目配置，将 admin 构建到子路径
