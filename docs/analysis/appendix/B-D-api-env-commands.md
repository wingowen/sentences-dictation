# 附录 B-D：API端点、环境变量与命令速查

---

## 附录 B：API端点汇总

> **完整接口列表**：25+个端点，按权限分类

### 🔓 公开端点（无需认证）

#### 数据获取类

| 方法 | 端点路径 | 功能 | 请求参数 | 响应格式 |
|------|---------|------|---------|---------|
| GET | `/.netlify/functions/get-notion-sentences` | 从Notion获取句子 | `?pageId=xxx` | `{ success, sentences: [] }` |
| GET | `/.netlify/functions/get-new-concept-2` | 获取NCE2文章列表 | 无 | `{ success, articles: [{id, title, link}] }` |
| POST | `/.netlify/functions/get-new-concept-2-lesson` | 获取NCE2课程内容 | `{ link: "..." }` | `{ success, sentences: [] }` |
| GET | `/.netlify/functions/get-new-concept-3` | 获取NCE3文章列表 | 无 | `{ success, articles: [...] }` |
| POST | `/.netlify/functions/get-new-concept-3-lesson` | 获取NCE3课程内容 | `{ link: "..." }` | `{ success, sentences: [] }` |
| GET | `/.netlify/functions/get-real-article-link` | 获取真实文章URL | `?link=xxx` | `{ success, link: "..." }` |
| GET | `/.netlify/functions/get-supabase-content` | 查询Supabase数据 | `?tagId=xxx&articleId=xxx` | `{ success, tags: [], articles: [], sentences: [] }` |
| GET | `/.netlify/functions/get-tts-audio` | **生成TTS音频** | `?text=Hello&voice=xxx&rate=1.0` | `{ success, audio: "base64..." }` |

**使用示例（get-tts-audio）**：
```javascript
// 前端调用
const response = await fetch('/.netlify/functions/get-tts-audio?' + new URLSearchParams({
  text: 'Hello, how are you?',
  voice: 'en-US-JennyNeural',  // Microsoft Zira
  rate: '1.0'
}));
const { audio } = await response.json();
const audioBlob = base64ToBlob(audio, 'audio/mp3');
const audioUrl = URL.createObjectURL(audioBlob);
new Audio(audioUrl).play();
```

---

### 🔐 认证端点

| 方法 | 端点路径 | 功能 | 请求体 | 响应格式 |
|------|---------|------|-------|---------|
| POST | `/api/auth` | 用户登录 | `{ email, password }` | `{ success, data: { user, token } }` |
| POST | `/api-auth` (别名) | 用户注册 | `{ email, password }` | `{ success, data: { user, token } }` |
| GET | `/api/auth` | 获取当前用户 | Header: `Authorization: Bearer <token>` | `{ success, data: { user } }` |

**认证流程**：
```
1. 前端收集 email + password
2. POST /api/auth 发送到 Netlify Function
3. auth.js 调用 Supabase Auth.signIn()
4. 返回 JWT Token + User Info
5. 前端保存 token 到 localStorage
6. 后续请求携带 Authorization header
```

---

### 📝 生词本 API（需JWT认证）

| 方法 | 端点 | 功能 | 请求体示例 | 成功响应 |
|------|-----|------|-----------|---------|
| **GET** | `/api/vocabulary` | 获取生词列表 | Query: `?page=1&limit=20&search=hello&sort=created_at` | `{ success, data: [], pagination: { total, page, totalPages } }` |
| **POST** | `/api/vocabulary` | 添加生词 | `{ word, phonetic, meaning, part_of_speech, sentence_context }` | `{ success, data: { id, ... } }` |
| **PUT** | `/api/vocabulary/:id` | 更新生词 | `{ meaning: "新释义", notes: "备注" }` | `{ success, data: { ... } }` |
| **DELETE** | `/api/vocabulary/:id` | 删除生词 | - | `{ success: true }` |
| **POST** | `/api/vocabulary/:id/review` | 标记已复习 | `{ rating: 3 }` (0-4分) | `{ success, data: { nextReviewAt, reviewCount } }` |

**查询参数说明**：
- `page` - 页码（默认1）
- `limit` - 每页数量（默认20，最大100）
- `search` - 关键词搜索（匹配word和meaning字段）
- `sort` - 排序字段（created_at / word / review_count）
- `order` - 排序方向（asc / desc）
- `isLearned` - 过滤是否已掌握（true/false/不传则全部）

**POST /api/vocabulary 完整请求体**：
```json
{
  "word": "example",
  "phonetic": "/ɪɡˈzæmpl/",
  "meaning": "例子；范例",
  "part_of_speech": "noun",
  "sentence_context": "This is an example sentence.",
  "notes": "这个词有多个含义"
}
```

---

### 🎴 闪卡 API（需JWT认证）

| 方法 | 端点 | 功能 | 请求体示例 | 成功响应 |
|------|-----|------|-----------|---------|
| **GET** | `/api/flashcards` | 获取闪卡列表 | Query: `?type=all&status=due&page=1` | `{ success, data: [], count }` |
| **GET** | `/api/flashcards/:id` | 获取单张闪卡详情 | - | `{ success, data: { id, front, back, ... } }` |
| **POST** | `/api/flashcards` | 创建闪卡 | 见下方 | `{ success, data: { id, ... } }` |
| **PUT** | `/api/flashcards/:id` | 更新闪卡 | `{ front: "新问题" }` | `{ success, data: { ... } }` |
| **DELETE** | `/api/flashcards/:id` | 删除闪卡 | - | `{ success: true }` |

**查询参数**：
- `type` - 筛选类型：`all`(全部) / `learning`(学习中) / `reviewing`(待复习) / `mastered`(已掌握)
- `status` - 按状态筛选（与type类似但更细粒度）
- `tags` - 按标签筛选（逗号分隔的标签ID）
- `search` - 关键词搜索（front/back字段）
- `page`, `limit` - 分页参数

**POST 创建闪卡完整请求体**：
```json
{
  "front": "Hello",
  "back": "你好（问候语）",
  "type": "sentence",
  "tags": ["greeting", "basic"],
  "metadata": {
    "phonetic": "/həˈloʊ/",
    "example": "Hello, how are you?",
    "difficulty": 1
  }
}
```

**学习/复习交互**：
```javascript
// 学习新卡片（初次）
POST /api/flashcards/:id/learn
{ "quality": 3 }  // 0-4分评分
// → 返回更新后的卡片（interval=1, repetition=1）

// 复习到期卡片
POST /api/flashcards/:id/review
{ "quality": 4 }
// → SM-2算法计算新的 interval 和 nextReviewAt
```

---

### 👨‍💼 管理 API（需管理员权限）

#### 文章管理

| 方法 | 端点 | 功能 | 特殊操作 |
|------|-----|------|---------|
| GET | `/api-admin/articles` | 文章列表 | 支持分页、搜索、筛选 |
| POST | `/api-admin/articles` | 创建文章 | 支持 metadata JSON |
| PUT | `/api-admin/articles/:id` | 更新文章 | 自动更新 updated_at |
| DELETE | `/api-admin/articles/:id` | 删除文章 | 级联删除关联句子 |
| POST | `/api-admin/articles/batch-import` | 批量导入 | 支持 JSON/CSV 格式 |

**批量导入格式（JSON）**：
```json
[
  {
    "title": "新文章标题",
    "description": "描述",
    "source_type": "custom",
    "metadata": { "difficulty": 2, "category": "日常用语" },
    "sentences": [
      { "content": "第一句", "sequence_order": 1 },
      { "content": "第二句", "sequence_order": 2 }
    ],
    "tags": ["日常用语", "简单句"]
  }
]
```

#### 句子管理

| 方法 | 端点 | 功能 |
|------|-----|------|
| GET | `/api-admin/sentences` | 句子列表（支持按article_id筛选） |
| POST | `/api-admin/sentences` | 创建句子（自动维护 total_sentences） |
| PUT | `/api-admin/sentences/:id` | 更新句子（含 extensions JSON） |
| DELETE | `/api-admin/sentences/:id` | 删除句子 |
| PUT | `/api-admin/sentences/reorder` | 批量调整序号 |

**extensions 字段结构**：
```json
{
  "phonetic": "/həˈloʊ haʊ ɑːr juː/",
  "translation": "你好，你好吗？",
  "vocabulary": [...],
  "difficulty": 1,
  "tags": ["问候语"]
}
```

#### 标签管理

| 方法 | 端点 | 功能 |
|------|-----|------|
| GET | `/api-admin/tags` | 标签列表 |
| POST | `/api-admin/tags` | 创建标签（自动查重） |
| PUT | `/api-admin/tags/:id` | 更新标签（名称/颜色） |
| DELETE | `/api-admin/tags/:id` | 删除标签（级联删除 article_tags 关联） |

#### 统计数据

| 方法 | 端点 | 功能 | 返回数据示例 |
|------|-----|------|------------|
| GET | `/api-admin/statistics` | 总览统计 | `{ totalUsers, totalArticles, totalSentences, totalVocab, activeToday }` |
| GET | `/api-admin/statistics/users` | 用户活跃度 | `[{ date, newUsers, activeUsers, practiceCount }]` |
| GET | `/api-admin/statistics/content` | 内容使用情况 | `{ topArticles, topTags, avgDifficulty }` |
| GET | `/api-admin/statistics/progress` | 学习进度分布 | `{ masteryLevels: { beginner: 30%, intermediate: 50%, advanced: 20% } }` |

---

## 附录 C：环境变量说明

> **所有配置项及其用途、默认值和设置位置**

### 必需配置（应用无法启动）

| 变量名 | 用途 | 示例值 | 设置位置 |
|--------|------|--------|---------|
| `SUPABASE_URL` | Supabase项目URL | `https://xyz.supabase.co` | `.env` 或 Netlify Dashboard |
| `SUPABASE_ANON_KEY` | Supabase匿名密钥 | `eyJhbGciOiJIUzI1NiIs...` | `.env` 或 Netlify Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase服务角色密钥（管理员权限） | `eyJhbGciOiJIUzI1NiIs...` | `.env` 或 Netlify Dashboard（仅后台使用） |

### 可选配置（功能增强）

| 变量名 | 用途 | 默认值 | 说明 |
|--------|------|--------|------|
| `NOTION_API_KEY` | Notion集成API密钥 | 空（不启用Notion功能） | 从 [notion.so/my-integrations](https://www.notion.so/my-integrations) 获取 |
| `NOTION_PAGE_ID` | Notion页面ID | 空 | Notion页面URL中的32位字符串 |
| `NETLIFY_SITE_ID` | Netlify站点ID | 自动注入 | Netlify Dashboard → Site settings → General |
| `NETLIFY_AUTH_TOKEN` | Netlify CLI认证Token | 仅CI/CD需要 | User settings → Applications → Personal access tokens |

### 开发环境变量

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 环境标识 | `development` / `production` |
| `PORT` | 开发服务器端口 | `8888`（Netlify Dev默认） |
| `VITE_API_BASE_URL` | API基础URL（开发时可能需要代理） | `http://localhost:8888` |

### .env.example 文件模板

```env
# ============================================
# Supabase 配置（必需）
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Notion 集成（可选）
# ============================================
NOTION_API_KEY=ntn_xxxxxxxxxxxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Netlify 配置（通常自动设置）
# ============================================
# NETLIFY_SITE_ID=your-site-id
# NETLIFY_AUTH_TOKEN=your-netlify-token
```

### 安全注意事项

⚠️ **重要提醒**：

1. **永远不要将 .env 文件提交到 Git**
   - 已在 [.gitignore](../../.gitignore) 中排除
   - 使用 `.env.example` 作为模板分享配置项名称

2. **生产环境密钥管理**
   - Netlify: 通过 Dashboard → Site configuration → Environment variables 设置
   - 不要在前端代码中硬编码任何密钥
   - Server-side only 的密钥（如 SERVICE_ROLE_KEY）仅在后端 Functions 中使用

3. **密钥轮换策略**
   - 定期（每90天）更换 SUPABASE_SERVICE_ROLE_KEY
   - 如果怀疑泄露，立即在 Supabase Dashboard 重置
   - 更换后同步更新 Netlify 环境变量

---

## 附录 D：常用命令速查

> **开发、构建、测试、部署的常用命令**

### 🚀 开发相关

```bash
# 启动 Vite 开发服务器（热更新）
npm run dev
# 访问 http://localhost:5173

# 启动 Netlify 完整开发环境（含 Functions）
npm run netlify-dev
# 访问 http://localhost:8888
# 同时运行 Vite 和 Netlify Functions
```

### 🏗️ 构建相关

```bash
# 生产构建（输出到 dist/ 目录）
npm run build
# 使用 Rollup 打包，代码分割，压缩混淆

# 预览构建结果
npm run preview
# 启动本地静态服务器预览生产版本

# 代码检查
npm run lint
# ESLint 检查所有 .js/.jsx 文件
```

### 🧪 测试相关

```bash
# 单元测试（Vitest）- 监听模式
npm test
# 或 npm run test:dev
# 文件变化时自动重新运行

# 单次运行测试
npm run test:run
# 适合 CI/CD 环境

# 生成覆盖率报告
npm run test:coverage
# 输出到 coverage/ 目录
# 目标阈值：70%（branches/functions/lines/statements）

# Vitest UI 界面（可选）
npm run test:ui
# 可视化浏览测试结果
```

### 🎭 E2E测试（Playwright）

```bash
# 运行所有 E2E 测试
npx playwright test

# 运行特定测试文件
npx playwright test e2e/login.spec.js

# UI 模式运行（可视化调试）
npx playwright test --ui

# 查看测试报告
npx playwright show-report
# 在浏览器中打开 HTML 报告

# 特定浏览器运行
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project=firefox

# 并行运行（加速）
npx playwright test --workers=4
```

### 🐳 Docker 相关

```bash
# 构建镜像
docker build -t sentences-dictation .

# 运行容器
docker-compose up -d
# 访问 http://localhost:3000

# 查看日志
docker-compose logs -f app

# 停止并删除容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### 🚀 部署相关

```bash
# 部署到 Netlify Preview（PR预览）
# 自动由 CI/CD 触发
# 或手动触发
netlify deploy --dir=dist --prod=false

# 部署到 Netlify Production
# 仅 master/main 分支 push 时自动触发
netlify deploy --dir=dist --prod=true

# 通过 Netlify CLI 登录（首次）
netlify login
netlify init
netlify open
```

### 📦 数据抓取脚本

```bash
# 抓取新概念英语第三册数据
npm run scrape:new-concept-3
# 输出到 src/data/new-concept-3.json

# 修复新概念二数据（Python脚本）
python scripts/fix_nce2_data.py
```

### 🔧 其他实用命令

```bash
# 清理缓存
rm -rf .cache/*
# 删除所有缓存的API响应

# 重置本地存储（开发调试用）
# 在浏览器控制台执行：
localStorage.clear()
location.reload()

# 检查依赖安全漏洞
npm audit
npm audit fix  # 自动修复可修复的漏洞

# 查看依赖树
npm list --depth=0

# 更新依赖
npm update
npm outdated  # 检查过时的包
```

### 📊 监控与诊断

```bash
# 测试数据库连接
node supabase/connectivity-test.js

# 诊断 vocabulary 表问题
node supabase/diagnose_vocabulary.js

# 直接测试数据库查询
node test-db-direct.js

# 测试 IPv4 连接（解决某些网络问题）
test-ipv4-connection.js

# 通过 Function 测试 API
node test-function.js

# 检查 Netlify Functions 是否正常运行
check-via-functions.sh
```

---

## 🎯 快速参考卡片

### 最常用命令 Top 10

| # | 命令 | 使用场景 |
|---|------|---------|
| 1 | `npm run netlify-dev` | 日常开发（启动全栈环境） |
| 2 | `npm run build` | 提交前验证构建是否通过 |
| 3 | `npm run lint` | 提交前检查代码规范 |
| 4 | `npm run test:run` | PR前运行单元测试 |
| 5 | `npx playwright test` | PR前运行E2E测试 |
| 6 | `docker-compose up -d` | 本地Docker部署测试 |
| 7 | `npm run scrape:new-concept-3` | 更新教材数据 |
| 8 | `npm audit` | 定期安全检查 |
| 9 | `netlify deploy --prod` | 手动发布生产版本 |
| 10 | `npx playwright show-report` | 查看E2E测试报告 |

### 故障排查速查

| 问题 | 可能原因 | 解决命令 |
|------|---------|---------|
| 端口被占用 | 上次进程未退出 | `lsof -i :5173 \| kill -9 <PID>` |
| 依赖安装失败 | Node版本不兼容 | `node -v` 检查是否 ≥18 |
| Functions报错 | Netlify CLI未运行 | 先执行 `npm run netlify-dev` |
| 样式未生效 | CSS未正确导入 | 检查 import 路径 |
| TTS不工作 | 浏览器不支持Web Speech API | 尝试Chrome或Edge |
| 数据加载失败 | 外部API不可用 | 检查网络，查看 `.cache/` 是否有旧数据 |
| 构建失败 | TypeScript类型错误 | 查看 ESLint 输出的具体错误行号 |
| Docker启动失败 | 端口冲突或环境变量缺失 | `docker-compose down && docker-compose up -d` |

---

**最后更新**：2026-04-05  
**建议**：将此页面加入浏览器书签，方便随时查阅！
