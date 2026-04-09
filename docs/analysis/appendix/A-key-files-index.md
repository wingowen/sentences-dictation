# 附录 A：关键文件索引

> **用途**：快速定位项目中的核心源代码文件  
> **更新频率**：随代码变更同步更新  
> **最后更新**：2026-04-05

---

## 📁 文件分类导航

### 1️⃣ 应用入口与配置

| 文件路径 | 行数（约） | 核心职责 | 关键内容 |
|---------|----------|---------|---------|
| [index.html](../../index.html) | 30 | HTML模板 | React挂载点、meta标签、favicon |
| [src/main.jsx](../../src/main.jsx) | 10 | 应用入口 | createRoot + StrictMode |
| [src/App.jsx](../../src/App.jsx) | 1634 | **主应用组件** | 所有状态管理、业务逻辑、事件处理 |
| [src/App.css](../../src/App.css) | 500+ | 主应用样式 | 响应式布局、组件样式 |
| [src/index.css](../../src/index.css) | 100 | 全局样式 | CSS Reset、基础字体、变量 |
| [package.json](../../package.json) | 80 | 项目依赖和脚本 | 依赖版本、npm scripts |
| [vite.config.js](../../vite.config.js) | 90 | Vite构建配置 | 插件、代码分割、测试配置 |
| [netlify.toml](../../netlify.toml) | 65 | Netlify部署配置 | 构建命令、API路由重定向 |

**快速跳转**：
- 想看应用怎么启动？→ [main.jsx](../../src/main.jsx)
- 想看主要逻辑？→ [App.jsx](../../src/App.jsx)（注意：文件较大，建议使用搜索功能）
- 想改构建配置？→ [vite.config.js](../../vite.config.js)

---

### 2️⃣ 核心组件（Components）

#### 练习相关

| 文件路径 | 组件名 | 职责 | 复杂度 |
|---------|--------|------|--------|
| [PracticeCard.jsx](../../src/components/PracticeCard.jsx) | PracticeCard | **练习卡片容器**，组合所有子组件 | 🟡 中 |
| [WordInputs.jsx](../../src/components/WordInputs.jsx) | WordInputs | 逐词输入框列表，处理焦点和输入事件 | 🟡 中 |
| [WordInputsContext.jsx](../../src/components/WordInputsContext.jsx) | WordInputsContext | WordInputs的Context提供者 | 🟢 低 |
| [PhoneticsSection.jsx](../../src/components/PhoneticsSection.jsx) | PhoneticsSection | 音标展示区域 | 🟢 低 |
| [PhoneticsSectionContext.jsx](../../src/components/PhoneticsSectionContext.jsx) | PhoneticsSectionContext | PhoneticsSection的Context提供者 | 🟢 低 |
| [TranslationDisplay.jsx](../../src/components/TranslationDisplay.jsx) | TranslationDisplay | 翻译文本显示 | 🟢 低 |
| [SpellingInput.jsx](../../src/components/SpellingInput.jsx) | SpellingInput | 单词拼写输入框（带样式） | 🟢 低 |
| [HintButton.jsx](../../src/components/HintButton.jsx) | HintButton | 提示按钮（显示答案） | 🟢 低 |
| [PracticeStats.jsx](../../src/components/PracticeStats.jsx) | PracticeStats | 统计数据显示（进度、正确率等） | 🟢 低 |
| [ResultModal.jsx](../../src/components/ResultModal.jsx) | ResultModal | 结果弹窗（正确/错误提示） | 🟡 中 |
| [SettingsModal.jsx](../../src/components/SettingsModal.jsx) | SettingsModal | 设置弹窗（语速、模式切换等） | 🟡 中 |

#### 数据源选择

| 文件路径 | 组件名 | 职责 | 复杂度 |
|---------|--------|------|------|
| [DataSourceSelection.jsx](../../src/components/DataSourceSelection.jsx) | DataSourceSelection | 数据源下拉选择器（旧版，扁平列表） | 🟡 中 |
| [DataSourceTree.jsx](../../src/components/DataSourceTree.jsx) | DataSourceTree | **数据源树形菜单**（新版，三级结构） | 🟡 中 |
| [ArticleSelector.jsx](../../src/components/ArticleSelector.jsx) | ArticleSelector | 文章选择器（新概念2/3用） | 🟢 低 |
| [ArticleSelectorHint.jsx](../../src/components/ArticleSelectorHint.jsx) | ArticleSelectorHint | 文章选择提示文字 | 🟢 低 |
| [LocalResourceSelector.jsx](../../src/components/LocalResourceSelector.jsx) | LocalResourceSelector | 本地资源选择器 | 🟢 低 |
| [SupabaseSelector.jsx](../../src/components/SupabaseSelector.jsx) | SupabaseSelector | Supabase数据源选择器（需登录） | 🟡 中 |

#### 闪卡系统

| 文件路径 | 组件名 | 职责 | 加载方式 |
|---------|--------|------|---------|
| [FlashcardApp.jsx](../../src/components/FlashcardApp.jsx) | FlashcardApp | 闪卡应用入口（包含学习和管理Tab） | ⚡ 懒加载 |
| [FlashcardLearner.jsx](../../src/components/FlashcardLearner.jsx) | FlashcardLearner | 闪卡学习引擎（SM-2算法交互） | 正常导入 |
| [FlashcardManager.jsx](../../src/components/FlashcardManager.jsx) | FlashcardManager | 闪卡管理界面（CRUD操作） | 正常导入 |
| [FlashcardStats.jsx](../../src/components/FlashcardStats.jsx) | FlashcardStats | 闪卡学习统计面板 | 正常导入 |
| [FlashcardImporter.jsx](../../src/components/FlashcardImporter.jsx) | FlashcardImporter | 闪卡导入功能（Markdown格式） | 正常导入 |

#### 生词本系统

| 文件路径 | 组件名 | 职责 | 加载方式 |
|---------|--------|------|---------|
| [VocabularyApp.jsx](../../src/components/VocabularyApp.jsx) | VocabularyApp | 生词本应用入口（列表+详情） | ⚡ 懒加载 |
| [VocabularyReview.jsx](../../src/components/VocabularyReview.jsx) | VocabularyReview | 生词复习界面（间隔重复） | ⚡ 懒加载 |

#### 其他UI组件

| 文件路径 | 组件名 | 职责 |
|---------|--------|------|
| [LoginModal.jsx](../../src/components/LoginModal.jsx) | LoginModal | 登录注册弹窗 |
| [Toast.jsx](../../src/components/Toast.jsx) | Toast | 轻量级消息提示组件 |

---

### 3️⃣ 服务层（Services）

#### 核心服务

| 文件路径 | 服务名 | 主要方法 | 用途 |
|---------|--------|---------|------|
| [dataService.js](../../src/services/dataService.js) | DataService | `getSentences()`, `getSentencesByLocalResource()`, `getLocalResources()` | **数据源管理核心**（7种数据源的适配和路由） |
| [speechService.js](../../src/services/speechService.js) | SpeechService | `speak()`, `cancelSpeech()`, `isSpeechSupported()`, `preloadSentence()` | **语音合成服务**（Web Speech API + Edge TTS） |
| [pronunciationService.js](../../src/services/pronunciationService.js) | PronunciationService | `parseSentenceForPhonetics()`, `detectAndExpandContractions()` | **音标生成服务**（CMU Dictionary集成） |
| [cacheService.js](../../src/services/cacheService.js) | CacheService | `getCache()`, `setCache()`, `clearCache()` | 缓存管理（.cache目录读写） |

#### 业务服务

| 文件路径 | 服务名 | 主要方法 | 用途 |
|---------|--------|---------|------|
| [flashcardService.js](../../src/services/flashcardService.js) | FlashcardService | `getAllFlashcards()`, `createFlashcard()`, `updateFlashcard()`, `deleteFlashcard()`, `syncLocalToCloud()` | **闪卡CRUD服务**（本地+云端同步） |
| [vocabularyService.js](../../src/services/vocabularyService.js) | VocabularyService | `getVocabulary()`, `addVocabulary()`, `removeVocabulary()`, `markAsReviewed()` | **生词本CRUD服务** |
| [spacedRepetitionService.js](../../src/services/spacedRepetitionService.js) | SpacedRepetitionService | `calculateNextReview()`, `updateCardProgress()`, `getDueCards()` | **SM-2间隔重复算法实现** |
| [translationService.js](../../src/services/translationService.js) | TranslationService | （已移除功能保留接口） | 翻译服务（预留扩展） |

#### 辅助服务

| 文件路径 | 服务名 | 用途 |
|---------|--------|------|
| [edgeTtsService.js](../../src/services/edgeTtsService.js) | EdgeTtsService | Microsoft Edge TTS封装（高质量语音） |
| [externalSpeechService.js](../../src/services/externalSpeechService.js) | ExternalSpeechService | 外部TTS服务抽象层 |
| [kittenTtsService.js](../../src/services/kittenTtsService.js) | KittenTtsService | Kitten TTS备选方案 |
| [preloadedAudioService.js](../../src/services/preloadedAudioService.js) | PreloadedAudioService | 音频预加载管理 |
| [markdownParserService.js](../../src/services/markdownParserService.js) | MarkdownParserService | Markdown解析（用于闪卡导入） |
| [flashcardImportService.js](../../src/services/flashcardImportService.js) | FlashcardImportService | 闪卡导入逻辑（支持多种格式） |
| [vocabToFlashcardService.js](../../src/services/vocabToFlashcardService.js) | VocabToFlashcardService | 生词转闪卡的转换工具 |

---

### 4️⃣ 自定义Hooks（Hooks）

| 文件路径 | Hook名称 | 返回值 | 用途 |
|---------|----------|-------|------|
| [useLocalStorage.js](../../src/hooks/useLocalStorage.js) | useLocalStorage | `[value, setValue, removeValue]` | localStorage读写封装（支持JSON序列化） |
| [usePracticeStats.js](../../src/hooks/usePracticeStats.js) | usePracticeStats | `{ practiceStats, updateStats, resetStats }` | 练习统计状态管理 |
| [usePracticeProgress.js](../../src/hooks/usePracticeProgress.js) | usePracticeProgress | `{ progress, updateProgress, resetProgress }` | 练习进度追踪（按数据源分别记录） |
| [useSentences.js](../../src/hooks/useSentences.js) | useSentences | `{ sentences, loading, error, loadSentences }` | 句子数据获取和状态管理 |
| [useSpeechPlayback.js](../../src/hooks/useSpeechPlayback.js) | useSpeechPlayback | `{ speak, cancel, isSpeaking }` | 语音播放控制 |
| [useSpeechVoices.js](../../src/hooks/useSpeechVoices.js) | useSpeechVoices | `{ voices, loadVoices }` | 可用语音引擎列表 |

---

### 5️⃣ 工具函数（Utils）

| 文件路径 | 导出函数 | 用途 |
|---------|---------|------|
| [contractionMap.js](../../src/utils/contractionMap.js) | `CONTRACTION_MAP` (Object), `expandContractions()` | 英语缩写词映射表（200+条规则）及展开函数 |
| [debounce.js](../../src/utils/debounce.js) | `debounce(fn, delay)` | 防抖函数（限制高频触发） |
| [errors.js](../../src/utils/errors.js) | `AppError`, `NetworkError`, `ValidationError` 等 | 自定义错误类层次结构 |

---

### 6️⃣ 静态数据（Data）

| 文件路径 | 内容描述 | 记录数 |
|---------|---------|--------|
| [简单句.json](../../src/data/简单句.json) | 基础简单句练习数据 | ~20条 |
| [新概念一.json](../../src/data/新概念一.json) | 新概念英语第一册句子 | ~144课 |
| [new-concept-2.json](../../src/data/new-concept-2.json) | 新概念英语第二册文章列表+句子 | ~96课 |
| [new-concept-3.json](../../src/data/new-concept-3.json) | 新概念英语第三册文章列表+句子 | ~60课 |
| [FreeTime_Hobbies_Flashcards.md](../../src/data/FreeTime_Hobbies_Flashcards.md) | 示例闪卡数据（Markdown格式） | ~20张 |

---

### 7️⃣ Context（上下文）

| 文件路径 | Provider名称 | 提供的数据 |
|---------|-------------|-----------|
| [AppContext.jsx](../../src/contexts/AppContext.jsx) | AppProvider | 全局应用状态（用户信息、主题等） |

---

### 8️⃣ Netlify Functions（后端API）

#### 认证与授权

| 文件路径 | 端点 | 方法 | 功能 |
|---------|------|------|------|
| [auth.js](../../netlify/functions/auth.js) | `/api-auth` 或 `/api/auth` | GET/POST | 用户认证（登录/注册/获取当前用户） |

#### 业务API

| 文件路径 | 端点 | 方法 | 功能 |
|---------|------|------|------|
| [api-vocabulary.js](../../netlify/functions/api-vocabulary.js) | `/api/vocabulary` | CRUD | **生词本完整API**（增删改查+搜索+分页+复习标记） |
| [api-flashcards.js](../../netlify/functions/api-flashcards.js) | `/api/flashcards` | CRUD | **闪卡完整API**（增删改查） |
| [api-flashcard-history.js](../../netlify/functions/api-flashcard-history.js) | `/api/flashcard-history` | GET | 闪卡学习历史记录 |

#### 管理后台API

| 文件路径 | 端点 | 方法 | 功能 |
|---------|------|------|------|
| [api-admin-articles.js](../../netlify/functions/api-admin-articles.js) | `/api-admin/articles` | CRUD | **文章管理API**（含批量导入、标签关联） |
| [api-admin-sentences.js](../../netlify/functions/api-admin-sentences.js) | `/api-admin/sentences` | CRUD | **句子管理API**（含序号调整、扩展信息编辑） |
| [api-admin-tags.js](../../netlify/functions/api-admin-tags.js) | `/api-admin/tags` | CRUD | **标签管理API** |
| [api-admin-statistics.js](../../netlify/functions/api-admin-statistics.js) | `/api-admin/statistics` | GET | **统计数据API**（学习分析、内容使用情况） |

#### 数据获取API（公开或半公开）

| 文件路径 | 端点 | 方法 | 功能 |
|---------|------|------|------|
| [get-notion-sentences.js](../../netlify/functions/get-notion-sentences.js) | `/.netlify/functions/get-notion-sentences` | GET | 从Notion页面提取句子（带缓存） |
| [get-new-concept-2.js](../../netlify/functions/get-new-concept-2.js) | `/.netlify/functions/get-new-concept-2` | GET | 获取新概念二文章列表 |
| [get-new-concept-2-lesson.js](../../netlify/functions/get-new-concept-2-lesson.js) | `/.netlify/functions/get-new-concept-2-lesson` | POST | 获取新概念二课程内容 |
| [get-new-concept-3.js](../../netlify/functions/get-new-concept-3.js) | `/.netlify/functions/get-new-concept-3` | GET | 获取新概念三文章列表 |
| [get-new-concept-3-lesson.js](../../netlify/functions/get-new-concept-3-lesson.js) | `/.netlify/functions/get-new-concept-3-lesson` | POST | 获取新概念三课程内容 |
| [get-real-article-link.js](../../netlify/functions/get-real-article-link.js) | `/.netlify/functions/get-real-article-link` | GET | 获取真实文章URL（解决重定向问题） |
| [get-supabase-content.js](../../netlify/functions/get-supabase-content.js) | `/.netlify/functions/get-supabase-content` | GET | 查询Supabase数据库内容（标签+文章+句子） |
| [get-tts-audio.js](../../netlify/functions/get-tts-audio.js) | `/.netlify/functions/get-tts-audio` | GET | **TTS音频生成**（Edge TTS，返回base64音频） |

#### 共享工具

| 文件路径 | 导出函数 | 用途 |
|---------|---------|------|
| [shared/cache.js](../../netlify/shared/cache.js) | `getCache()`, `setCache()` | 服务端缓存（.cache目录） |
| [shared/cors.js](../../netlify/shared/cors.js) | `corsHeaders` | CORS响应头配置 |
| [shared/url-validator.js](../../netlify/shared/url-validator.js) | `isValidUrl()` | URL参数安全校验 |

---

### 9️⃣ 管理后台（Admin - 独立应用）

#### 页面组件

| 文件路径 | 页面 | 路由 | 功能 |
|---------|------|------|------|
| [admin/src/pages/Dashboard.tsx](../../admin/src/pages/Dashboard.tsx) | Dashboard | `/` | 数据总览仪表盘 |
| [admin/src/pages/Login.tsx](../../admin/src/pages/Login.tsx) | Login | `/login` | 管理员登录页 |
| [admin/src/pages/Articles.tsx](../../admin/src/pages/Articles.tsx) | Articles | `/articles` | 文章列表与管理 |
| [admin/src/pages/ArticleEditor.tsx](../../admin/src/pages/ArticleEditor.tsx) | ArticleEditor | `/articles/:id/edit` | 文章编辑器（富文本+元数据） |
| [admin/src/pages/Sentences.tsx](../../admin/src/pages/Sentences.tsx) | Sentences | `/sentences` | 句子列表与管理 |
| [admin/src/pages/Tags.tsx](../../admin/src/pages/Tags.tsx) | Tags | `/tags` | 标签分类管理 |
| [admin/src/pages/Statistics.tsx](../../admin/src/pages/Statistics.tsx) | Statistics | `/statistics` | 学习数据分析图表 |
| [admin/src/pages/Settings.tsx](../../admin/src/pages/Settings.tsx) | Settings | `/settings` | 系统设置与配置 |

#### UI组件库

| 目录路径 | 组件数量 | 说明 |
|---------|---------|------|
| [admin/src/components/ui/](../../admin/src/components/ui/) | 15+ | Radix UI 封装组件（Button, Card, Dialog, Select, Tabs, Toast等） |

#### 布局组件

| 文件路径 | 组件名 | 用途 |
|---------|--------|------|
| [AdminLayout.tsx](../../admin/src/components/layout/AdminLayout.tsx) | AdminLayout | 后台整体布局（侧边栏+顶栏+内容区） |
| [Header.tsx](../../admin/src/components/layout/Header.tsx) | Header | 顶部导航栏 |
| [Sidebar.tsx](../../admin/src/components/layout/Sidebar.tsx) | Sidebar | 侧边导航菜单 |
| [PageHeader.tsx](../../admin/src/components/layout/PageHeader.tsx) | PageHeader | 页面标题和面包屑导航 |

#### Hooks（管理后台专用）

| 文件路径 | Hook名称 | 用途 |
|---------|----------|------|
| [useArticles.ts](../../admin/src/hooks/useArticles.ts) | useArticles | 文章数据的React Query封装 |
| [useSentences.ts](../../admin/src/hooks/useSentences.ts) | useSentences | 句子数据的React Query封装 |
| [useTags.ts](../../admin/src/hooks/useTags.ts) | useTags | 标签数据的React Query封装 |
| [useStatistics.ts](../../admin/src/hooks/useStatistics.ts) | useStatistics | 统计数据的React Query封装 |
| [useAuth.ts](../../admin/src/hooks/useAuth.ts) | useAuth | 认证状态的Zustand Store封装 |

#### Stores（状态管理）

| 文件路径 | Store名称 | 状态内容 |
|---------|----------|---------|
| [auth.ts](../../admin/src/stores/auth.ts) | useAuthStore | user, token, isAuthenticated, login(), logout() |

---

### 🔟 测试文件

#### 单元测试

| 文件路径 | 测试对象 |
|---------|---------|
| [hooks/useLocalStorage.test.js](../../src/hooks/useLocalStorage.test.js) | useLocalStorage Hook |
| [utils/contractionMap.test.js](../../src/utils/contractionMap.test.js) | 缩写映射表 |
| [utils/debounce.test.js](../../src/utils/debounce.test.js) | debounce 函数 |
| [utils/errors.test.js](../../src/utils/errors.test.js) | 错误类体系 |
| [services/cacheService.test.js](../../src/services/cacheService.test.js) | CacheService |
| [services/dataService.test.js](../../src/services/dataService.test.js) | DataService |
| [services/flashcardService.test.js](../../src/services/flashcardService.test.js) | FlashcardService |
| [services/speechService.test.js](../../src/services/speechService.test.js) | SpeechService (Mock) |
| [components/ArticleSelector.test.jsx](../../src/components/ArticleSelector.test.jsx) | ArticleSelector 组件 |
| [components/ArticleSelectorHint.test.jsx](../../src/components/ArticleSelectorHint.test.jsx) | ArticleSelectorHint 组件 |
| [components/LocalResourceSelector.test.jsx](../../src/components/LocalResourceSelector.test.jsx) | LocalResourceSelector 组件 |

#### E2E测试

| 文件路径 | 测试场景 |
|---------|---------|
| [homepage.spec.js](../../e2e/homepage.spec.js) | 首页渲染和数据源选择 |
| [login.spec.js](../../e2e/login.spec.js) | 登录流程 |
| [sentence-practice.spec.js](../../e2e/sentence-practice.spec.js) | 句子听写完整流程 |
| [flashcard-learning.spec.js](../../e2e/flashcard-learning.spec.js) | 闪卡学习流程 |
| [flashcard-management.spec.js](../../e2e/flashcard-management.spec.js) | 闪卡管理CRUD |
| [vocabulary-review.spec.js](../../e2e/vocabulary-review.spec.js) | 生词复习流程 |
| [learning-stats.spec.js](../../e2e/learning-stats.spec.js) | 统计数据显示 |
| [vocab-flow.spec.js](../../e2e/vocab-flow.spec.js) | 生词添加完整流程 |
| [full-test.spec.js](../../e2e/full-test.spec.js) | 全功能冒烟测试 |
| [visual-qa-full.spec.js](../../e2e/visual-qa-full.spec.js) | 视觉完整性检查 |
| [visual-qa-regression.spec.js](../../e2e/visual-qa-regression.spec.js) | 视觉回归对比 |

---

### 📁 配置与基础设施

| 文件路径 | 用途 | 关键配置项 |
|---------|------|-----------|
| [eslint.config.js](../../eslint.config.js) | ESLint代码规范 | React插件、全局变量 |
| [playwright.config.js](../../playwright.config.js) | Playwright E2E配置 | 浏览器、超时、截图 |
| [docker-compose.yml](../../docker-compose.yml) | Docker编排 | 端口映射、环境变量、健康检查 |
| [Dockerfile](../../Dockerfile) | Docker镜像构建 | Node版本、工作目录、启动命令 |
| [.github/workflows/ci-cd.yml](../../.github/workflows/ci-cd.yml) | CI/CD流水线 | 5个Job: test/build/security/deploy |
| [deno.lock](../../deno.lock) | Deno依赖锁（Netlify Functions内部使用） | 版本固定 |

---

## 🔍 快速查找指南

### 按功能查找

**我想找...** | **查看这里**
---|---
**数据源如何切换？** | → [dataService.js#DATA_SOURCE_TYPES](../../src/services/dataService.js) + [DataSourceTree.jsx](../../src/components/DataSourceTree.jsx)
**语音播放怎么实现的？** | → [speechService.js](../../src/services/speechService.js)（Web Speech API）
**音标是怎么生成的？** | → [pronunciationService.js](../../src/services/pronunciationService.js)（CMU Dictionary）
**验证算法在哪里？** | → [App.jsx#normalize()](../../src/App.jsx#L692-L698)
**闪卡SM-2算法？** | → [spacedRepetitionService.js](../../src/services/spacedRepetitionService.js)
**生词添加API？** | → [api-vocabulary.js](../../netlify/functions/api-vocabulary.js) + [App.jsx#handleAddToVocabulary](../../src/App.jsx#L1190)
**管理后台怎么认证？** | → [auth.js](../../netlify/functions/auth.js) + [stores/auth.ts](../../admin/src/stores/auth.ts)
**数据库表结构？** | → [schema.sql](../../supabase/schema.sql)
**CI/CD怎么配置？** | → [ci-cd.yml](../../.github/workflows/ci-cd.yml)

### 按关键词搜索

在IDE中使用 `Ctrl+Shift+F`（全局搜索）：

**常用搜索关键词**：
- `useState` - 找到所有状态定义
- `useEffect` - 找到所有副作用
- `useCallback` - 找到所有回调函数
- `fetch(` 或 `axios.` - 找到所有网络请求
- `console.log` - 找到所有调试日志（生产环境应清理）
- `TODO` / `FIXME` / `HACK` - 找到待办事项和技术债务

---

## 📊 文件统计摘要

| 类别 | 文件数 | 总行数（约） | 平均复杂度 |
|------|-------|------------|-----------|
| **组件（Components）** | 28 | ~8,000 | 🟡 中 |
| **服务（Services）** | 18 | ~4,500 | 🟡 中 |
| **Hooks** | 6 | ~800 | 🟢 低 |
| **工具（Utils）** | 3 | ~300 | 🟢 低 |
| **数据（Data）** | 5 | ~5,000 | 🟢 低 |
| **Netlify Functions** | 18 | ~3,500 | 🟡 中 |
| **管理后台（Admin）** | 25 | ~6,000 | 🟡 中 |
| **测试（Tests）** | 19 | ~2,000 | 🟢 低 |
| **配置（Config）** | 12 | ~1,200 | 🟢 低 |
| **总计** | **~134** | **~31,300** | - |

---

**最后更新**：2026-04-05  
**维护说明**：当新增或删除源文件时，请同步更新本索引。
