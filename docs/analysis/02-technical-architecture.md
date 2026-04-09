# 模块 02：技术架构设计

> **模块标识**：`02-technical-architecture`  
> **依赖关系**：[01-项目背景与目标](./01-project-overview.md)（理解业务需求后看技术方案）  
> **相关文件**：[package.json](../../package.json)、[vite.config.js](../../vite.config.js)、[netlify.toml](../../netlify.toml)  
> **阅读时间**：10分钟  
> **最后更新**：2026-04-05

---

## 📌 模块概述

本模块详细阐述项目的**技术架构设计方案**，包括整体架构图、技术栈选型、分层设计、组件交互关系等。这是从业务需求到技术实现的桥梁，为后续的功能开发和代码重构提供架构层面的指导。

### 🎯 本模块将回答的关键问题：

1. ❓ 整体采用什么样的架构模式？（Serverless SPA）
2. ❓ 选择了哪些关键技术？为什么这么选？
3. ❓ 前端、后端、数据库如何分层和协作？
4. ❓ 各个组件之间如何通信？（数据流）
5. ❓ 如何保证系统的性能、安全和可扩展性？

---

## 一、整体架构概览

### 1.1 架构模式选择

本项目采用 **SPA（Single Page Application）+ Serverless Functions + BaaS（Backend-as-a-Service）** 的现代Web应用架构：

```
┌─────────────────────────────────────────────────────────────────┐
│                     客户端层 (Client Tier)                        │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │   主应用 (React 19)  │  │  管理后台 (React 18) │               │
│  │   Vite 7 构建        │  │  TypeScript + Vite 5 │               │
│  │   sentences-dictation│  │  admin/ 目录         │               │
│  └──────────┬──────────┘  └──────────┬──────────┘               │
├─────────────┼────────────────────────┼───────────────────────────┤
│             │    API Gateway (Netlify) │                           │
│             ▼                        ▼                            │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              服务层 (Service Tier)                         │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │          Netlify Functions (Serverless)            │  │    │
│  │  │  • auth.js              用户认证                    │  │    │
│  │  │  • api-vocabulary.js    生词本CRUD                  │  │    │
│  │  │  • api-flashcards.js     闪卡CRUD                   │  │    │
│  │  │  • api-admin-*.js       管理后台API                 │  │    │
│  │  │  • get-notion-sentences.js  Notion数据获取           │  │    │
│  │  │  • get-new-concept-*.js     新概念英语数据获取        │  │    │
│  │  │  • get-tts-audio.js     TTS音频生成                │  │    │
│  │  │  • get-supabase-content.js  Supabase数据查询        │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────┬───────────────────────────────┘    │
├─────────────────────────────┼────────────────────────────────────┤
│                             ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  数据层 (Data Tier)                          │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │  │
│  │  │  Supabase DB │ │  本地JSON文件 │ │  外部API/爬虫      │  │  │
│  │  │ PostgreSQL   │ │  静态资源     │ │  Notion/新概念网站  │  │  │
│  │  └──────────────┘ └──────────────┘ └────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 架构优势分析

| 优势 | 具体体现 | 对比传统架构 |
|------|---------|------------|
| **零运维成本** | 无需管理服务器，按使用量付费 | vs 自建服务器需要运维团队 |
| **自动扩展** | Netlify Functions 自动处理并发请求 | vs 需要手动配置负载均衡 |
| **全球CDN** | 静态资源通过 Netlify CDN 全球分发 | vs 单点部署延迟高 |
| **快速迭代** | Git Push 即部署，无需手动发布流程 | vs 传统部署需要多步骤 |
| **前后端分离** | 清晰的职责划分，可独立开发测试 | vs Monolithic 耦合严重 |
| **开发体验好** | HMR 热更新、TypeScript 支持 | vs 传统构建工具慢 |

### 1.3 架构权衡（Trade-offs）

| 权衡点 | 选择 | 原因 |
|--------|------|------|
| Serverless 冷启动 | 接受 ~100-500ms 延迟 | 对教育应用可接受，换来零运维 |
| 函数执行时间限制 | 10秒超时 | 所有API都可在限制内完成 |
| 数据库托管在第三方 | 使用 Supabase BaaS | 降低运维复杂度，功能丰富 |
| 不使用 GraphQL | 采用 RESTful API | 更简单，团队学习成本低 |
| 主应用不用 TypeScript | 保持 JavaScript | 降低迁移成本，快速迭代 |

---

## 二、前端技术栈详解

### 2.1 主应用技术栈

基于 [package.json](../../package.json) 和 [vite.config.js](../../vite.config.js) 的配置：

#### 核心框架与工具

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|---------|
| **React** | ^19.2.0 | UI 框架 | 最新版本，享受 Compiler、Actions 等新特性 |
| **ReactDOM** | ^19.2.0 | React DOM 渲染 | React 官方 DOM 绑定库 |
| **Vite** | ^7.2.4 | 构建工具 & 开发服务器 | 极快的 HMR、优化的 Rollup 打包、ESM 原生支持 |
| **@vitejs/plugin-react-swc** | ^4.2.2 | React 编译插件 | SWC 比 Babel 快 20 倍以上 |

#### UI 与样式

| 技术 | 用途 | 说明 |
|------|------|------|
| **CSS Modules** | 样式隔离 | [App.css](../../src/App.css)、[index.css](../../src/index.css) |
| **响应式设计** | 移动端适配 | CSS Media Queries + Flexbox/Grid 布局 |
| **自定义组件** | UI 基础组件 | Button、Card、Modal、Input 等（手写实现） |

#### 状态管理与数据流

| 技术 | 用途 | 说明 |
|------|------|------|
| **React Context (AppContext)** | 全局状态管理 | [src/contexts/AppContext.jsx](../../src/contexts/AppContext.jsx) |
| **useState/useReducer** | 局部状态管理 | 组件内部状态 |
| **useCallback/useMemo** | 性能优化 | 避免不必要的重渲染 |
| **Custom Hooks** | 业务逻辑复用 | useLocalStorage、usePracticeStats 等 |
| **localStorage** | 客户端持久化 | 练习进度、设置等非敏感数据 |

#### 数据获取与处理

| 技术 | 版本 | 用途 |
|------|------|------|
| **@notionhq/client** | ^2.2.15 | Notion API 客户端（服务端使用） |
| **axios** | ^1.7.7 | HTTP 客户端（API 请求） |
| **cheerio** | ^1.0.0 | HTML 解析器（网页爬虫，服务端使用） |
| **cmu-pronouncing-dictionary** | ^3.0.0 | CMU 发音词典（音标生成） |

#### 语音与音频

| 技术 | 版本 | 用途 |
|------|------|------|
| **Web Speech API** | 浏览器内置 | 客户端 TTS（SpeechSynthesis API） |
| **node-edge-tts** | ^1.2.10 | Microsoft Edge TTS（服务端高质量语音） |

#### 测试工具

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vitest** | ^4.0.18 | 单元测试框架 |
| **@testing-library/react** | ^16.3.2 | React 组件测试库 |
| **@testing-library/user-event** | ^14.6.1 | 用户交互模拟 |
| **Playwright** | ^1.58.2 | E2E 测试框架 |

### 2.2 管理后台技术栈

基于 [admin/package.json](../../admin/package.json) 的配置，管理后台是一个**独立的 React 应用**：

| 技术栈 | 版本/说明 | 与主应用的差异 |
|--------|----------|--------------|
| **React** | ^18.3.1 | 使用稳定版而非最新版 |
| **TypeScript** | ^5.6.2 | ✅ 强类型语言（主应用是 JS） |
| **Vite** | ^5.4.8 | 较旧版本（主应用是 Vite 7） |
| **Tailwind CSS** | ^3.4.13 | ✅ 原子化CSS框架（主应用用原生CSS） |
| **Radix UI** | 多个组件 | ✅ 无障碍UI组件库 |
| **Zustand** | ^5.0.11 | ✅ 轻量级状态管理（主应用用 Context） |
| **React Router** | ^6.26.1 | ✅ 路由管理（主应用是单页无路由） |
| **React Hook Form** | ^7.71.1 | ✅ 表单处理 |
| **TanStack Table** | ^8.20.1 | ✅ 表格组件 |
| **Recharts** | ^2.12.7 | ✅ 图表可视化 |
| **Zod** | ^3.25.76 | ✅ 运行时类型验证 |

**为什么管理后台使用不同的技术栈？**

1. **独立性**：管理后台面向管理员，用户群体不同，可以独立迭代
2. **TypeScript**：后台涉及更复杂的表单和数据操作，类型安全更重要
3. **UI 组件库**：Radix UI 提供完善的无障碍支持，符合后台系统的专业性要求
4. **状态管理**：Zustand 比 Context 更适合中大型应用的复杂状态

---

## 三、后端技术栈详解

### 3.1 Serverless 平台：Netlify Functions

基于 [netlify.toml](../../netlify.toml) 的配置：

#### 平台特性

| 特性 | 详情 |
|------|------|
| **运行环境** | Node.js 18.x / 20.x（基于 AWS Lambda） |
| **函数目录** | `netlify/functions/` |
| **打包工具** | esbuild（快速） |
| **冷启动延迟** | 100-500ms（首次调用） |
| **执行超时** | 10秒 |
| **内存限制** | 1024MB |
| **免费额度** | 125,000次调用/月，300分钟构建时间/月 |

#### API 路由配置

根据 [netlify.toml](../../netlify.toml#L21-L59) 的重定向规则：

```toml
# 认证相关
[[redirects]]
  from = "/api/auth"
  to = "/.netlify/functions/auth"
  status = 200

# 生词本API
[[redirects]]
  from = "/api/vocabulary/*"
  to = "/.netlify/functions/api-vocabulary"
  status = 200

# 闪卡API
[[redirects]]
  from = "/api/flashcards/*"
  to = "/.netlify/functions/api-flashcards"
  status = 200

# 管理后台API
[[redirects]]
  from = "/api-admin/*"
  to = "/.netlify/functions/api-admin/:splat"
  status = 200
```

**说明**：
- 所有 `/api/*` 请求都会被代理到对应的 Netlify Function
- 前端代码中使用简洁的路径（如 `/api/vocabulary`），实际由 Netlify 处理路由
- `status = 200` 表示代理重定向（不改变URL）

### 3.2 数据库服务：Supabase

基于 [supabase/schema.sql](../../supabase/schema.sql) 的设计：

#### 为什么选择 Supabase？

| 优势 | 详细说明 |
|------|---------|
| **PostgreSQL** | 成熟的关系型数据库，功能强大 |
| **实时订阅** | 支持WebSocket实时数据同步 |
| **内置认证** | 开箱即用的 Auth 系统（邮箱/密码/OAuth） |
| **文件存储** | S3兼容的对象存储（用于音频/图片） |
| **Edge Functions** | 类似 Netlify Functions 的边缘计算（备用方案） |
| **Dashboard** | 可视化的数据库管理界面 |
| **开源** | 可以自托管，避免供应商锁定 |
| **免费额度** | 500MB 数据库、2GB 存储、50MB 文件上传、无限认证用户 |

#### 核心表结构预览

详见 [模块 04：数据流程与数据库](./04-data-flow-and-database.md)，此处仅列出关键表：

| 表名 | 用途 | 记录数预估 |
|------|------|-----------|
| `articles` | 文章/课程信息 | 50-200条 |
| `sentences` | 句子内容 | 1,000-10,000条 |
| `tags` | 标签分类 | 20-50条 |
| `article_tags` | 文章-标签关联 | 100-500条 |
| `user_vocabulary` | 用户生词本 | 按用户增长（每人100-1000词） |
| `sentence_audios` | 句子音频记录 | 可选，按需生成 |

---

## 四、项目目录结构与技术映射

### 4.1 完整目录结构

```
sentences-dictation/
│
├── 📁 src/                          # 主应用源代码
│   ├── 📄 main.jsx                  # 应用入口
│   ├── 📄 App.jsx                   # 主应用组件（1634行，核心逻辑）
│   ├── 📄 App.css                   # 主应用样式
│   │
│   ├── 📁 components/               # React 组件
│   │   ├── PracticeCard.jsx         # 练习卡片（核心UI）
│   │   ├── WordInputs.jsx           # 逐词输入组件
│   │   ├── PhoneticsSection.jsx     # 音标显示组件
│   │   ├── DataSourceTree.jsx       # 数据源树形菜单
│   │   ├── FlashcardApp.jsx         # 闪卡应用入口（懒加载）
│   │   ├── FlashcardLearner.jsx     # 闪卡学习组件
│   │   ├── FlashcardManager.jsx     # 闪卡管理组件
│   │   ├── VocabularyApp.jsx        # 生词本应用入口（懒加载）
│   │   ├── VocabularyReview.jsx     # 生词复习组件
│   │   ├── ResultModal.jsx          # 结果弹窗（懒加载）
│   │   ├── SettingsModal.jsx        # 设置弹窗（懒加载）
│   │   ├── LoginModal.jsx           # 登录弹窗（懒加载）
│   │   └── ...                      # 其他辅助组件
│   │
│   ├── 📁 services/                 # 服务层（业务逻辑）
│   │   ├── dataService.js           # 数据源管理（核心）
│   │   ├── speechService.js         # 语音合成服务
│   │   ├── pronunciationService.js  # 音标生成服务
│   │   ├── flashcardService.js      # 闪卡CRUD服务
│   │   ├── vocabularyService.js     # 生词本服务
│   │   ├── cacheService.js          # 缓存管理服务
│   │   ├── spacedRepetitionService.js # 间隔重复算法
│   │   └── ...                      # 其他服务
│   │
│   ├── 📁 hooks/                    # 自定义 Hooks
│   │   ├── useLocalStorage.js       # localStorage 封装
│   │   ├── usePracticeStats.js      # 练习统计 Hook
│   │   ├── usePracticeProgress.js   # 练习进度 Hook
│   │   ├── useSentences.js          # 句子数据 Hook
│   │   ├── useSpeechPlayback.js     # 语音播放 Hook
│   │   └── useSpeechVoices.js       # 语音引擎 Hook
│   │
│   ├── 📁 contexts/                 # React Context
│   │   └── AppContext.jsx           # 全局应用上下文
│   │
│   ├── 📁 data/                     # 静态数据文件
│   │   ├── 简单句.json              # 简单句练习数据
│   │   ├── 新概念一.json            # 新概念第一册数据
│   │   ├── new-concept-2.json       # 新概念第二册数据
│   │   ├── new-concept-3.json       # 新概念第三册数据
│   │   └── FreeTime_Hobbies_Flashcards.md # 示例闪卡数据
│   │
│   ├── 📁 utils/                    # 工具函数
│   │   ├── contractionMap.js        # 缩写词映射表
│   │   ├── debounce.js              # 防抖函数
│   │   └── errors.js                # 错误处理工具
│   │
│   └── 📁 test/                     # 测试配置
│       └── setup.ts                 # Vitest 全局设置
│
├── 📁 admin/                        # 管理后台（独立应用）
│   ├── 📁 src/
│   │   ├── 📁 components/           # UI 组件（Radix UI）
│   │   ├── 📁 pages/                # 页面组件
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Articles.tsx
│   │   │   ├── ArticleEditor.tsx
│   │   │   ├── Sentences.tsx
│   │   │   ├── Tags.tsx
│   │   │   ├── Statistics.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Login.tsx
│   │   ├── 📁 hooks/                # 自定义 Hooks
│   │   ├── 📁 lib/                  # 工具库
│   │   ├── 📁 stores/               # Zustand 状态存储
│   │   └── App.tsx                  # 管理后台入口
│   └── package.json                 # 管理后台依赖
│
├── 📁 netlify/                      # Netlify 配置与函数
│   └── 📁 functions/                # Serverless 函数（18个）
│       ├── auth.js                  # 认证
│       ├── api-vocabulary.js        # 生词本API
│       ├── api-flashcards.js        # 闪卡API
│       ├── api-flashcard-history.js  # 闪卡历史API
│       ├── api-admin-articles.js    # 文章管理API
│       ├── api-admin-sentences.js   # 句子管理API
│       ├── api-admin-tags.js        # 标签管理API
│       ├── api-admin-statistics.js  # 统计API
│       ├── get-notion-sentences.js  # Notion数据获取
│       ├── get-new-concept-2.js     # 新概念二文章列表
│       ├── get-new-concept-2-lesson.js # 新概念二课程内容
│       ├── get-new-concept-3.js     # 新概念三文章列表
│       ├── get-new-concept-3-lesson.js # 新概念三课程内容
│       ├── get-real-article-link.js # 真实文章链接获取
│       ├── get-supabase-content.js  # Supabase数据查询
│       ├── get-tts-audio.js         # TTS音频生成
│       └── 📁 shared/               # 共享工具
│           ├── cache.js
│           ├── cors.js
│           └── url-validator.js
│
├── 📁 supabase/                     # 数据库相关
│   ├── schema.sql                   # 完整数据库Schema
│   ├── setup_all_tables.sql         # 初始化脚本
│   ├── flashcards_schema.sql        # 闪卡表结构
│   ├── fix_vocabulary_table.sql     # 修复脚本
│   └── *.js                         # 连接测试脚本
│
├── 📁 e2e/                          # E2E 测试套件（12个）
│   ├── homepage.spec.js
│   ├── login.spec.js
│   ├── sentence-practice.spec.js
│   ├── flashcard-learning.spec.js
│   ├── flashcard-management.spec.js
│   ├── vocabulary-review.spec.js
│   ├── learning-stats.spec.js
│   ├── vocab-flow.spec.js
│   ├── full-test.spec.js
│   ├── visual-qa-full.spec.js
│   └── visual-qa-regression.spec.js
│
├── 📁 scripts/                      # 辅助脚本
│   ├── scrape-new-concept-3.js      # 爬取新概念三数据
│   ├── fix_nce2_data.py             # 修复新概念二数据
│   └── kitten_tts_server.py         # Kitten TTS 服务器
│
├── 📁 skills/                       # 自定义技能（可选）
│   ├── notion/SKILL.md              # Notion 集成技能
│   └── superdesign/SKILL.md         # 设计优化技能
│
├── 📄 配置文件
│   ├── package.json                 # 主应用依赖
│   ├── vite.config.js               # Vite 构建配置
│   ├── netlify.toml                 # Netlify 部署配置
│   ├── eslint.config.js             # ESLint 代码规范
│   ├── playwright.config.js         # Playwright E2E配置
│   ├── docker-compose.yml           # Docker 编排
│   ├── Dockerfile                   # Docker 镜像
│   └── .github/workflows/ci-cd.yml  # CI/CD 流水线
│
└── 📁 docs/                         # 项目文档
    ├── README.md                    # 项目介绍
    ├── requirement.md               # 需求文档
    ├── ADMIN_API.md                 # 管理API文档
    ├── ADMIN_INTERFACE.md           # 管理接口文档
    ├── doc/功能列表.md              # 功能清单
    ├── doc/数据录入指南.md          # 数据录入指南
    └── analysis/                    # ← 本报告所在位置
        └── ...                      # 拆分后的模块文件
```

### 4.2 关键技术决策在代码中的体现

| 技术决策 | 体现位置 | 代码特征 |
|---------|---------|---------|
| **React 19** | [src/App.jsx](../../src/App.jsx) | 使用最新 Hooks API、Compiler 兼容性 |
| **Vite 7** | [vite.config.js](../../vite.config.js) | manualChunks 代码分割、ESM 原生导入 |
| **Serverless** | [netlify/functions/](../../netlify/functions/) | 18个独立函数文件、无 Express/Koa |
| **Supabase** | [netlify/functions/supabase/client.js](../../netlify/functions/supabase/client.js) | @supabase/supabase-js 客户端初始化 |
| **代码分割** | [vite.config.js#L14-L54](../../vite.config.js#L14-L54) | manualChunks 将代码分为 speech/flashcard/data/ui/utils/vendor |
| **懒加载** | [src/App.jsx#L21-L23](../../src/App.jsx#L21-L23) | React.lazy() 加载 FlashcardApp/VocabularyApp/VocabularyReview |

---

## 五、系统分层架构详解

### 5.1 表示层（Presentation Layer）

**职责**：负责用户界面渲染和用户交互处理

#### 组件层次结构

```
App.jsx (根组件)
├── DataSourceTree (数据源选择 - 未登录时显示)
│   ├── 练习模式
│   │   ├── FlashcardLearner 入口
│   │   ├── FlashcardManager 入口
│   │   └── VocabularyReview 入口
│   ├── 教材资源
│   │   ├── 新概念英语 (1/2/3册)
│   │   └── 简单句练习
│   └── 云端资源
│       ├── Notion
│       └── Supabase 文章
│
└── 主练习界面 (已选择数据源后)
    ├── Header (顶部导航栏)
    │   ├── 返回按钮
    │   ├── 闪卡/生词本快捷入口
    │   └── 数据源切换下拉菜单
    │
    ├── ArticleSelector (文章选择器 - 新概念2/3)
    ├── LocalResourceSelector (本地资源选择器)
    ├── SupabaseSelector (Supabase数据选择器)
    │
    ├── PracticeCard (练习卡片 - 核心)
    │   ├── 显示区域 (原文/翻译/音标)
    │   ├── 输入区域 (WordInputs - 逐词输入框)
    │   ├── 控制区域 (播放/下一题/设置按钮)
    │   └── 统计区域 (进度/正确率)
    │
    ├── ResultModal (结果弹窗)
    ├── SettingsModal (设置弹窗 - 语速/模式等)
    ├── LoginModal (登录弹窗)
    └── Toast (提示消息)
```

#### 关键组件说明

| 组件 | 文件路径 | 职责 | 复杂度 |
|------|---------|------|--------|
| **AppContent** | [src/App.jsx:63-1624](../../src/App.jsx#L63-1624) | 主应用逻辑，包含所有状态和业务方法 | 🔴 高（1634行，需拆分） |
| **PracticeCard** | [src/components/PracticeCard.jsx](../../src/components/PracticeCard.jsx) | 练习卡片容器，组合多个子组件 | 🟡 中 |
| **WordInputs** | [src/components/WordInputs.jsx](../../src/components/WordInputs.jsx) | 逐词输入框列表，处理输入事件 | 🟡 中 |
| **PhoneticsSection** | [src/components/PhoneticsSection.jsx](../../src/components/PhoneticsSection.jsx) | 音标展示组件 | 🟢 低 |
| **DataSourceTree** | [src/components/DataSourceTree.jsx](../../src/components/DataSourceTree.jsx) | 树形数据源菜单 | 🟡 中 |
| **FlashcardApp/Learner/Manager** | [src/components/Flashcard*.jsx](../../src/components/) | 闪卡系统三大组件 | 🟡 中 |
| **VocabularyApp/Review** | [src/components/Vocabulary*.jsx](../../src/components/) | 生词本两大组件 | 🟡 中 |

### 5.2 业务逻辑层（Business Logic Layer）

**职责**：封装核心业务规则和数据转换逻辑

#### 服务层架构

```
services/
├── dataService.js           # 数据源管理（核心服务）
│   ├── DATA_SOURCE_TYPES    # 数据源类型常量
│   ├── DATA_SOURCES         # 数据源配置数组
│   ├── DATA_SOURCE_TREE     # 树形菜单配置
│   ├── getSentences()       # 获取句子数据
│   ├── getLocalResources()  # 获取本地资源列表
│   └── findTreeNode()       # 查找树节点
│
├── speechService.js         # 语音合成服务
│   ├── speak()              # 朗读文本
│   ├── cancelSpeech()       # 取消朗读
│   ├── isSpeechSupported()  # 检测浏览器支持
│   └── preloadSentence()    # 预加载音频
│
├── pronunciationService.js  # 音标生成服务
│   ├── parseSentenceForPhonetics()  # 解析句子获取音标
│   └── detectAndExpandContractions() # 检测并展开缩写
│
├── flashcardService.js      # 闪卡服务
│   ├── getAllFlashcards()   # 获取所有闪卡
│   ├── createFlashcard()    # 创建闪卡
│   ├── updateFlashcard()    # 更新闪卡
│   ├── deleteFlashcard()    # 删除闪卡
│   └── syncLocalToCloud()   # 本地数据同步到云端
│
├── vocabularyService.js     # 生词本服务
│   ├── getVocabulary()      # 获取生词列表
│   ├── addVocabulary()      # 添加生词
│   ├── removeVocabulary()   # 删除生词
│   └── markAsReviewed()     # 标记已复习
│
├── spacedRepetitionService.js  # 间隔重复算法
│   ├── calculateNextReview()   # 计算下次复习时间
│   ├── updateCardProgress()    # 更新卡片进度
│   └── getDueCards()           # 获取到期卡片
│
├── cacheService.js          # 缓存管理服务
│   ├── getCache()            # 读取缓存
│   ├── setCache()            # 写入缓存
│   └── clearCache()          # 清除缓存
│
└── translationService.js    # 翻译服务（已移除功能保留接口）
```

#### 关键业务逻辑示例

**句子验证算法**（位于 [src/App.jsx:692-720](../../src/App.jsx#L692-720)）：

```javascript
// 规范化处理：忽略大小写、前后空格和常见标点
const normalize = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'()[]{}_-]/g, '')  // 移除标点
    .replace(/\s+/g, ' ')                   // 合并多余空格
}

// 比较单个单词是否正确
const compareWord = (userWord, correctWord) => {
  return normalize(userWord) === normalize(correctWord)
}

// 句子比对算法（按词比较）
const compareSentences = (wordInputs, correctSentence) => {
  const userSentence = wordInputs.join(' ')
  const expandedCorrectSentence = getExpandedSentence(correctSentence)
  return normalize(userSentence) === normalize(expandedCorrectSentence)
}
```

### 5.3 数据访问层（Data Access Layer）

**职责**：封装与各种数据源的交互细节

#### 数据源适配器模式

```
dataService.js (统一接口)
│
├── 本地JSON数据源
│   ├── import localSentences from '../data/简单句.json'
│   ├── import newConcept1Sentences from '../data/新概念一.json'
│   └── 直接读取静态文件，无需网络请求
│
├── Notion数据源
│   ├── GET /.netlify/functions/get-notion-sentences
│   ├── @notionhq/client SDK 调用
│   └── 返回纯文本句子数组
│
├── 新概念英语数据源
│   ├── NCE1/NCE3: 从本地 JSON 文件读取
│   ├── NCE2: 通过网页爬虫 (cheerio) 获取
│   └── 缓存到 .cache/ 目录避免重复请求
│
└── Supabase数据源
    ├── 通过 SupabaseSelector 组件手动触发
    ├── @supabase/supabase-js 客户端查询
    └── 支持标签筛选、分页、排序
```

### 5.4 基础设施层（Infrastructure Layer）

**职责**：提供跨横切关注点的基础能力

#### 基础设施组件

| 组件 | 实现 | 用途 |
|------|------|------|
| **日志系统** | console.log/warn/error | 开发调试（生产环境应替换为结构化日志） |
| **错误处理** | try-catch + Error Boundary | 异常捕获和友好提示 |
| **缓存机制** | localStorage + 内存缓存 + .cache/文件 | 多级缓存提升性能 |
| **HTTP客户端** | axios | 统一的API请求封装 |
| **认证管理** | Supabase Auth + JWT Token | 用户身份验证和会话管理 |
| **CORS处理** | [netlify/shared/cors.js](../../netlify/shared/cors.js) | 跨域资源共享配置 |
| **URL验证** | [netlify/shared/url-validator.js](../../netlify/shared/url-validator.js) | 输入参数安全校验 |

---

## 六、通信机制与数据流

### 6.1 前后端通信协议

#### 请求/响应格式规范

**标准成功响应**：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**标准错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

**认证请求头**：
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### 6.2 数据流向图

#### 场景一：用户进行句子听写练习

```
用户操作                    前端 (React)              后端 (Netlify Functions)    数据库 (Supabase)
   │                            │                            │                         │
   ├─ 选择"本地数据"数据源        │                            │                         │
   │                            ├─ import 本地JSON           │                         │
   │                            │                            │                         │
   ├─ 点击"播放"按钮             │                            │                         │
   │                            ├─ speak(text, rate)         │                         │
   │                            │  (Web Speech API)          │                         │
   │                            │                            │                         │
   ├─ 在输入框输入单词           │                            │                         │
   │                            ├─ _handleWordInputChange() │                         │
   │                            ├─ compareWord()            │                         │
   │                            │  (客户端比对)              │                         │
   │                            │                            │                         │
   ├─ 所有单词正确 → 自动提交    │                            │                         │
   │                            ├─ 更新 practiceStats       │                         │
   │                            ├─ 更新 practiceProgress    │                         │
   │                            ├─ 保存到 localStorage      │                         │
   │                            │                            │                         │
   ├─ 点击"添加到生词本"         │                            │                         │
   │                            ├─ POST /api/vocabulary     │                         │
   │                            │                            ├─ 验证 JWT Token         │
   │                            │                            ├─ INSERT INTO user_vocabulary
   │                            │                            └─ 返回成功/失败           │
   │                            ← 返回结果                   │                         │
   │                            ├─ 显示 Toast 提示           │                         │
```

#### 场景二：管理员编辑文章

```
管理员操作                 管理后台 (Admin React)     后端 (Netlify Functions)    数据库 (Supabase)
   │                              │                            │                         │
   ├─ 登录管理系统                │                            │                         │
   │                              ├─ POST /api-auth           │                         │
   │                              │                            ├─ Supabase Auth.signIn()
   │                              │                            └─ 返回 JWT + User Info    │
   │                              ← 保存 Token 到 Zustand     │                         │
   │                              │                            │                         │
   ├─ 进入文章管理页面            │                            │                         │
   │                              ├─ GET /api-admin/articles  │                         │
   │                              │                            ├─ 验证 Admin 权限        │
   │                              │                            ├─ SELECT * FROM articles │
   │                              │                            └─ 返回文章列表            │
   │                              ← 渲染表格                  │                         │
   │                              │                            │                         │
   ├─ 编辑某篇文章标题            │                            │                         │
   │                              ├─ PUT /api-admin/articles/:id                       │
   │                              │  { title: "新标题" }       ├─ 验证权限               │
   │                              │                            ├─ UPDATE articles SET title=...
   │                              │                            ├─ 触发 updated_at 触发器   │
   │                              │                            └─ 返回更新后的文章        │
   │                              ← 显示成功提示              │                         │
```

---

## 七、性能架构策略

### 7.1 已实施的性能优化

基于 [vite.config.js](../../vite.config.js#L14-L59) 的配置：

#### 代码分割（Code Splitting）

```javascript
manualChunks: {
  // 语音功能相关
  'speech': [
    './src/services/speechService.js',
    './src/services/externalSpeechService.js',
    './src/hooks/useSpeechVoices.js',
    './src/hooks/useSpeechPlayback.js'
  ],
  // 闪卡功能相关
  'flashcard': [
    './src/components/FlashcardApp.jsx',
    './src/components/FlashcardManager.jsx',
    './src/components/FlashcardLearner.jsx',
    './src/services/flashcardService.js'
  ],
  // 数据服务相关
  'data': [
    './src/services/dataService.js',
    './src/services/cacheService.js',
    './src/services/pronunciationService.js',
    './src/hooks/useSentences.js',
    './src/hooks/usePracticeStats.js',
    './src/hooks/usePracticeProgress.js'
  ],
  // UI组件相关
  'ui': [
    './src/components/ResultModal.jsx',
    './src/components/DataSourceSelection.jsx',
    './src/components/PracticeStats.jsx',
    './src/components/PhoneticsSection.jsx'
  ],
  // 工具库
  'utils': [
    './src/utils/contractionMap.js',
    './src/utils/debounce.js',
    './src/utils/errors.js'
  ],
  // React和核心库
  'vendor': ['react', 'react-dom', '@notionhq/client', 'axios', 'cheerio']
}
```

**效果**：
- 首次加载只下载核心 vendor bundle（~150KB gzipped）
- 功能模块按需加载（如访问闪卡页面才下载 flashcard chunk）
- 利用浏览器缓存，重复访问更快

#### 其他优化措施

| 优化项 | 实现方式 | 效果 |
|--------|---------|------|
| **组件懒加载** | React.lazy() + Suspense | 减少首屏加载体积 |
| **句子解析缓存** | sentenceCache state | 避免重复计算音标 |
| **API响应缓存** | .cache/ 目录 | 减少外部API调用 |
| **音频预加载** | preloadSentence() | 提升播放体验流畅度 |
| **防抖处理** | debounce 工具函数 | 减少不必要的事件触发 |
| **缩写展开预处理** | expandContractionsInSentence() | 统一数据格式 |

### 7.2 性能监控建议

虽然当前未实施完整监控系统，但架构上预留了扩展空间：

- **Lighthouse CI**：集成到CI流水线，每次PR自动检测性能分数
- **Web Vitals**：收集LCP/FID/CLS等核心指标
- **Sentry/Rollbar**：捕获前端JavaScript错误和性能异常
- **Netlify Analytics**：内置的网站分析（免费额度内）

---

## 八、安全架构设计

### 8.1 认证与授权体系

#### 认证流程

```
用户注册/登录
    ↓
前端 (LoginModal)
    ↓ email/password 或 OAuth (Google/GitHub)
    ↓
POST /api/auth
    ↓
Netlify Function (auth.js)
    ↓
Supabase Auth Client
    ↓ signIn() / signUp()
    ↓
返回 JWT Token + User Info
    ↓
前端保存到 localStorage
    ↓后续请求携带 Authorization: Bearer <token>
```

#### 权限控制层级

| 层级 | 实现方式 | 保护对象 |
|------|---------|---------|
| **L1: 路由/组件级** | React 条件渲染 | UI 元素显示/隐藏 |
| **L2: API网关级** | Netlify Function 内验证 Token | API 端点保护 |
| **L3: 数据库级** | Supabase RLS 策略 | 行级别数据访问控制 |

### 8.2 数据保护策略

| 保护维度 | 措施 | 实现位置 |
|---------|------|---------|
| **传输加密** | HTTPS（Netlify 自动提供） | 全站 |
| **密码存储** | bcrypt 哈希（Supabase Auth 处理） | 数据库 |
| **Token 安全** | HttpOnly Cookie（可选）、短期过期 | 认证中间件 |
| **SQL 注入** | 参数化查询（Supabase Client 自动处理） | 数据访问层 |
| **XSS 防护** | React 自动转义 + CSP（待实施） | 前端 |
| **CSRF 防护** | SameSite Cookie 属性 | HTTP 响应头 |
| **敏感数据** | 不在前端暴露 API Key/Secret | 环境变量 + Serverless |

详细的安全考量请参阅 [模块 08：优化与安全](./08-optimization-and-security.md)。

---

## 九、上下文衔接说明

### 📍 当前位置

你是从 **总览索引 ([README.md](./README.md))** 或 **[模块 01：项目背景与目标](./01-project-overview.md)** 进入本模块的。

### ➡️ 下一步建议

完成本模块阅读后，建议继续阅读：

**如果想深入了解具体功能怎么实现的**：
→ [模块 03：核心功能模块详细说明](./03-core-modules.md)  
四大功能模块（听写/闪卡/生词本/管理后台）的实现细节、关键组件、业务逻辑

**如果关心数据是怎么存储和流转的**：
→ [模块 04：数据流程与数据库](./04-data-flow-and-database.md)  
用户操作流程、数据流架构图、完整的数据库Schema设计、RLS安全策略

**如果想了解为什么要这样选技术**：
→ [模块 07：技术决策记录](./07-technical-decisions.md)  
5个关键ADR文档，记录重要技术选型的决策过程和理由

### ⬅️ 相关前置知识

本模块假设你已经了解：
- ✅ 项目的基本定位和目标（来自 [模块 01](./01-project-overview.md)）
- ✅ 基本的 Web 开发概念（HTTP、REST API、数据库）
- ✅ 现代 JavaScript/React 开发经验

如果你对某些概念感到陌生，可以：
- 回顾 [模块 01 的术语表](./01-project-overview.md#八、关键术语表glossary)
- 查阅外部参考资料（React官方文档、MDN Web Docs）

---

## 📚 参考资源

### 项目内部文件
- [package.json](../../package.json) - 完整依赖列表和脚本命令
- [vite.config.js](../../vite.config.js) - Vite 构建配置（含代码分割策略）
- [netlify.toml](../../netlify.toml) - Netlify 部署和路由配置
- [admin/package.json](../../admin/package.json) - 管理后台独立依赖

### 技术文档
- [React 19 官方文档](https://react.dev/)
- [Vite 7 官方文档](https://vite.dev/guide/)
- [Supabase 文档](https://supabase.com/docs)
- [Netlify Functions 文档](https://docs.netlify.com/functions/overview/)
- [Playwright 文档](https://playwright.dev/)
- [Vitest 文档](https://vitest.dev/)

---

## ✅ 模块完成确认

**阅读完本模块后，你应该能够**：

- ✅ 清楚地画出项目的**整体架构图**（三层：客户端/服务端/数据端）
- ✅ 理解**每一层的技术选型**及其理由
- ✅ 掌握**前端组件层次结构**和**服务层架构**
- ✅ 了解**数据如何在各层之间流动**
- ✅ 理解已实施的**性能优化策略**
- ✅ 认识**安全架构设计**的基本思路
- ✅ 能够快速**定位源代码文件**的位置和作用

---

**⏭️ 继续前进**：前往 [模块 03：核心功能模块详细说明](./03-core-modules.md) 开始探索具体的业务功能实现！

> 💡 **小贴士**：本模块内容较多，建议结合代码实际查看。你可以随时打开 IDE，对照着文中提到的文件路径去阅读源码，效果会更佳。
