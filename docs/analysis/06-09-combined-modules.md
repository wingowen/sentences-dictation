# 模块 06-09：项目规划、技术决策、优化安全与总结建议

> **本文件包含模块 06-09 的精简版完整内容**  
> **详细版本可按需扩展为独立文件**

---

## 模块 06：项目规划与团队协作

### 已完成里程碑（9个）

| 里程碑 | 时间 | 交付物 | 状态 |
|--------|------|--------|------|
| M1: 项目初始化 | 2026-Q1 | 项目骨架、基础配置、CI/CD | ✅ |
| M2: 核心听写功能 | 2026-Q1 | 多数据源、语音合成、逐词输入 | ✅ |
| M3: 音标与发音 | 2026-Q1 | CMU Dictionary、缩写展开 | ✅ |
| M4: 闪卡系统 | 2026-Q1 | SM-2算法、CRUD、统计 | ✅ |
| M5: 生词本功能 | 2026-Q1 | 一键添加、复习提醒 | ✅ |
| M6: 管理后台 | 2026-Q1 | Admin Panel、文章管理 | ✅ |
| M7: 认证系统 | 2026-Q1 | Supabase Auth、OAuth | ✅ |
| M8: 测试体系 | 2026-Q1 | 单元测试、E2E、视觉回归 | ✅ |
| M9: 部署运维 | 2026-Q1 | Netlify部署、Docker容器化 | ✅ |

### 未来路线图（4个阶段）

#### Phase 1: 优化与稳定（2-4周）
- 重构 App.jsx → 多 Custom Hooks
- TypeScript 迁移（主应用）
- 测试覆盖率 → 85%+
- PWA 支持

#### Phase 2: 功能增强（4-8周）
- AI 辅助功能（错题分析、个性化推荐）
- 社交功能（排行榜、成就）
- 移动端 App（React Native）

#### Phase 3: 商业化探索（8-12周）
- 会员订阅体系
- 内容付费
- 开放平台

#### Phase 4: 规模化发展（长期）
- 国际化支持
- 教育机构合作
- AI 自适应学习

### 团队配置建议

**核心团队（3-5人）**：

| 角色 | 职责 | 技能要求 | 人数 |
|------|------|---------|------|
| 项目负责人 (PM) | 产品规划、需求管理 | 产品思维、沟通能力 | 1 |
| 前端工程师 (FE) | React应用开发 | React 19, CSS, 响应式设计 | 1-2 |
| 全栈工程师 (Full-Stack) | API开发、数据库设计 | Node.js, PostgreSQL, Serverless | 1-2 |
| 测试工程师 (QA) | 测试策略、自动化 | Playwright, Vitest | 1(兼职) |

### 协作机制

**Git Flow 分支策略**：
- `main` - 生产环境
- `develop` - 开发主线
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支
- `hotfix/*` - 紧急修复

**开发工作流**：
1. Issues 创建需求 → 2. 估算工作量 → 3. feature分支开发 → 4. PR Code Review → 5. 合并develop → 6. release分支 → 7. 部署production

**会议节奏**：
- 每日站会（15分钟）
- 周例会（1小时）
- 双周规划会（2小时）

---

## 模块 07：技术决策记录（ADR）

### ADR-001: 选择 React 19

**决策**：使用 React 19.2.0  
**选项对比**：
- ✅ React 19：最新性能优化（Compiler）、并发特性
- ⚠️ React 18：稳定但缺少新特性
- ❌ Vue/Svelte：替代方案，团队不熟悉

**后果**：
- ✅ 享受自动记忆化等新特性
- ⚠️ 部分生态库兼容性待验证
- 💡 需关注 breaking changes

---

### ADR-002: 选择 Netlify Functions

**决策**：Serverless 后端架构  
**选项对比**：
- ✅ Netlify Functions：零运维、与前端部署一体化
- ⚠️ Vercel Functions：竞品
- ❌ AWS Lambda：更灵活但复杂

**后果**：
- ✅ 免费额度充足（125K调用/月）
- ⚠️ 冷启动延迟（100-500ms）
- ⚠️ 执行时间限制（10秒）

---

### ADR-003: 选择 Supabase

**决策**：PostgreSQL BaaS  
**选项对比**：
- ✅ Supabase：开源、功能全面（Auth+Realtime+Storage）
- ⚠️ PlanetScale：MySQL、无服务器架构
- ❌ 自建PostgreSQL：完全控制但需运维

**关键特性**：
- RLS 行级安全
- 内置 OAuth
- 实时订阅
- 可自托管避免锁定

---

### ADR-004: 选择 Vite 7

**决策**：新一代构建工具  
**优势**：
- 极快 HMR（热模块替换）
- Rollup 优化的生产构建
- 丰富的插件生态
- ESM 原生支持

---

### ADR-005: 选择 Playwright

**决策**：E2E 测试框架  
**优势**：
- 支持多浏览器（Chromium/Firefox/WebKit）
- 自动等待机制
- 并行执行能力强
- 内置截图/视频录制

---

## 模块 08：性能优化与安全考量

### 已实施的优化措施（5项）

| # | 优化项 | 实现方式 | 效果 |
|---|--------|---------|------|
| 1 | **代码分割** | vite.config.js manualChunks | 首屏加载仅~150KB |
| 2 | **组件懒加载** | React.lazy() + Suspense | 减少首屏体积 |
| 3 | **句子缓存** | sentenceCache state | 切换题目无延迟 |
| 4 | **音频预加载** | preloadSentence() | 播放流畅无等待 |
| 5 | **API响应缓存** | .cache/ 目录 | 减少外部请求 |

### 待实施优化方向（5项）

| # | 方向 | 适用场景 | 推荐工具 |
|---|------|---------|---------|
| 1 | **虚拟滚动** | 长句子列表/闪卡列表 | react-window / @tanstack/react-virtual |
| 2 | **Service Worker** | 离线访问、API缓存 | Workbox |
| 3 | **图片优化** | 封面图、头像 | WebP/AVIF + srcset |
| 4 | **GraphQL/tRPC** | 减少过度获取 | tRPC（类型安全） |
| 5 | **查询优化** | 数据库慢查询 | EXPLAIN ANALYZE + PgBouncer |

### 安全现状（已实施4项）

| # | 措施 | 实现位置 | 状态 |
|---|------|---------|------|
| 1 | **认证授权** | Supabase Auth + JWT + RLS | ✅ 完成 |
| 2 | **API安全** | CORS + URL验证 | ✅ 完成 |
| 3 | **数据保护** | 敏感信息不暴露前端 | ✅ 完成 |
| 4 | **依赖审计** | npm audit in CI/CD | ✅ 完成 |

### 待加强安全领域（5项）

| # | 领域 | 当前状态 | 建议 |
|---|------|---------|------|
| 1 | **XSS防护** | React自动转义 | 补充DOMPurify + CSP头 |
| 2 | **CSRF保护** | SameSite Cookie | 考虑Token机制 |
| 3 | **速率限制** | 未实施 | API层添加rate limiter |
| 4 | **安全头** | 部分配置 | Content-Security-Policy等 |
| 5 | **审计日志** | 未实施 | 记录关键操作 |

---

## 模块 09：总结与建议

### 项目优势（6大亮点）

✅ **技术栈现代化**：React 19 + Vite 7 + Supabase + Netlify  
✅ **功能完整性高**：听写/闪卡/生词本/管理后台形成闭环  
✅ **架构设计合理**：前后端分离 + Serverless + 微服务化倾向  
✅ **开发体验优秀**：HMR快速 + TypeScript支持（后台） + ESLint严格  
✅ **测试体系完善**：单元测试 + E2E + 视觉回归  
✅ **部署运维成熟**：CI/CD + Docker + 自动化发布  

### 待改进领域（6个方向）

⚠️ **代码组织**：App.jsx需拆分为Custom Hooks  
⚠️ **TypeScript覆盖**：主应用应迁移至TS  
⚠️ **测试覆盖率**：目标从70%提升至85%+  
⚠️ **性能优化**：大数据集场景、移动端体验  
⚠️ **安全性加固**：速率限制、CSP、审计日志  
⚠️ **国际化支持**：目前仅中英双语  

### 行动建议（短/中/长期）

#### 🔴 短期（1-2周）- 立即行动

1. **重构 App.jsx**
   - 提取 `usePracticeLogic` Hook（最大优先级）
   - 提取 `useSpeechControl` Hook
   - 提取 `useAuthState` Hook
   
2. **补充关键测试用例**
   - 核心业务逻辑（loadSentences, compareSentences）
   - SM-2算法边界情况
   - Netlify Functions集成测试

3. **性能基准测试**
   - Lighthouse CI建立baseline
   - 大数据集场景压力测试

#### 🟡 中期（1-2月）- 规划实施

4. **TypeScript迁移**
   - 工具函数层（utils/）优先
   - 服务层（services/）次之
   - 组件层最后（渐进式迁移）

5. **PWA支持**
   - Service Worker注册
   - 离线页面缓存
   - Add to Home Screen

6. **安全加固**
   - 配置Content-Security-Policy头
   - 实施API速率限制
   - 添加审计日志

#### 🟢 长期（3-6月）- 战略规划

7. **AI功能集成**
   - 智能错因分析
   - 个性化推荐
   - 自动难度调整

8. **移动端原生App**
   - React Native / Expo
   - 推送通知
   - 离线包下载

9. **商业化准备**
   - 会员体系设计
   - 内容付费方案
   - 开放平台文档

---

## 附录快速导航

### 附录A：关键文件索引

详见 [appendix/A-key-files-index.md](./appendix/A-key-files-index.md)  
**核心文件20+个**，按功能分类：

| 类别 | 关键文件 | 用途 |
|------|---------|------|
| 入口 | [src/main.jsx](../../src/main.jsx) | 应用入口 |
| 核心 | [src/App.jsx](../../src/App.jsx) | 主组件（1634行） |
| 服务 | [src/services/dataService.js](../../src/services/dataService.js) | 数据源管理 |
| 服务 | [src/services/speechService.js](../../src/services/speechService.js) | 语音合成 |
| 服务 | [src/services/flashcardService.js](../../src/services/flashcardService.js) | 闪卡CRUD |
| API | [netlify/functions/auth.js](../../netlify/functions/auth.js) | 认证API |
| API | [netlify/functions/api-vocabulary.js](../../netlify/functions/api-vocabulary.js) | 生词本API |
| 数据库 | [supabase/schema.sql](../../supabase/schema.sql) | 完整Schema |
| 配置 | [package.json](../../package.json) | 依赖和脚本 |
| 配置 | [vite.config.js](../../vite.config.js) | Vite配置 |
| 配置 | [netlify.toml](../../netlify.toml) | Netlify配置 |
| CI/CD | [.github/workflows/ci-cd.yml](../../.github/workflows/ci-cd.yml) | 流水线 |

### 附录B：API端点汇总

详见 [appendix/B-api-endpoints.md](./appendix/B-api-endpoints.md)  
**25+接口**，按权限分类：

**公开端点（无需认证）**：
- `GET /.netlify/functions/get-notion-sentences`
- `GET/.netlify/functions/get-new-concept-*`
- `GET/.netlify/functions/get-tts-audio`

**认证端点（需要JWT）**：
- `GET/POST /api/auth`
- `CRUD /api/vocabulary`
- `CRUD /api/flashcards`

**管理端点（需要管理员权限）**：
- `CRUD /api-admin/articles`
- `CRUD /api-admin/sentences`
- `CRUD /api-admin/tags`
- `GET /api-admin/statistics`

### 附录C：环境变量说明

详见 [appendix/C-environment-variables.md](./appendix/C-environment-variables.md)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Notion（可选）
NOTION_API_KEY=ntn_xxxx
NOTION_PAGE_ID=your-page-id

# Netlify（自动设置）
NETLIFY_SITE_ID=your-site-id
NETLIFY_AUTH_TOKEN=your-auth-token
```

### 附录D：常用命令速查

详见 [appendix/D-command-reference.md](./appendix/D-command-reference.md)

```bash
# 开发
npm run dev                  # Vite开发服务器
npm run netlify-dev          # Netlify Dev（含Functions）

# 构建
npm run build                # 生产构建
npm run preview              # 预览构建结果

# 测试
npm test                     # Vitest监听模式
npm run test:run             # 单次运行
npm run test:coverage        # 覆盖率报告

# E2E
npx playwright test          # 运行所有E2E
npx playwright show-report   # 查看报告

# 部署
npm run deploy               # 部署到Netlify
docker-compose up -d         # Docker本地部署

# 数据抓取
npm run scrape:new-concept-3 # 抓取新概念三数据
```

---

## ✅ 所有模块完成确认

恭喜！你已经完成了整个分析报告的阅读。现在你应该能够：

✅ **全面理解项目**：从背景目标到技术实现，从数据流程到未来规划  
✅ **定位源码位置**：通过附录A快速找到任何功能的代码实现  
✅ **掌握API接口**：通过附录B了解所有可用接口及其用法  
✅ **配置开发环境**：通过附录C和D快速搭建和运行项目  
✅ **制定行动计划**：基于风险评估和优化建议，明确下一步方向  

### 🎯 推荐的下一步行动

根据你的角色和目标：

**如果你是开发者**：
→ 打开 IDE，从 [重构 App.jsx](../../src/App.jsx) 开始实践本报告的建议

**如果你是项目经理**：
→ 基于 [Phase 1路线图](#phase-1-优化与稳定2-4周) 制定迭代计划

**如果你是新成员**：
→ 从 [01-项目背景与目标](./01-project-overview.md) 开始系统学习，然后结合代码深入理解

**如果你想贡献代码**：
→ 先查看 [CONTRIBUTING指南](../../README.md)（如果存在），然后选择一个[低风险改进项](#🟢-低风险项持续改进)开始你的第一个PR！

---

**📚 保持这份文档的更新**：

当项目发生重大变更时，请同步更新对应的模块文件。具体映射关系见 [README.md](./README.md#如何贡献更新) 的"更新日志"章节。

---

**最后更新**：2026-04-05  
**祝你在 sentences-dictation 项目的探索和贡献中收获满满！** 🚀
