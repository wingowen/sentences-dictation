# 🧪 Sentences Dictation 项目 - 全面测试指导报告

**文档版本**: v2.0  
**最后更新**: 2026-04-05  
**维护团队**: QA & Development Team  
**状态**: ✅ 生产就绪

---

## 📋 目录

1. [执行摘要](#1-执行摘要)
2. [测试目标与范围](#2-测试目标与范围)
3. [测试架构与方法论](#3-测试架构与方法论)
4. [测试工具与技术栈](#4-测试工具与技术栈)
5. [测试用例组织体系](#5-测试用例组织体系)
6. [执行流程与规范](#6-执行流程与规范)
7. [成功标准与质量门禁](#7-成功标准与质量门禁)
8. [维护协议与最佳实践](#8-维护协议与最佳实践)
9. [问题追踪与报告机制](#9-问题追踪与报告机制)
10. [附录: 快速参考卡片](#10-附录快速参考卡片)

---

## 1. 执行摘要

### 1.1 项目概述

**Sentences Dictation** 是一个基于 React + Vite 的英语句子听写练习平台，集成了以下核心功能：

- 📚 **多数据源支持**: 本地教材、Notion、Supabase、新概念英语
- 🎯 **智能练习系统**: 句子听写、单词输入、发音练习
- 📖 **生词本管理**: 生词添加、复习、间隔重复算法
- 🃏 **闪卡学习**: 创建、导入、学习、统计
- 🔐 **用户认证**: Supabase Auth 集成
- 📱 **响应式设计**: 桌面端/平板/移动端适配

### 1.2 测试覆盖现状

| 测试类型 | 用例数 | 覆盖率 | 状态 |
|---------|--------|--------|------|
| E2E (端到端) | 11个套件, ~60+用例 | 核心用户流程100% | ✅ 通过 |
| 单元测试 | 11个文件, ~80+用例 | 工具函数/服务层90%+ | ✅ 通过 |
| 视觉回归 | 2个套件 | 关键页面UI | ✅ 通过 |
| **总计** | **~140+测试用例** | **综合覆盖率85%+** | **✅ 健康状态** |

### 1.3 最近优化成果 (2026-04-05)

✅ 完成了页面切换过渡优化，新增：
- PageSkeleton骨架屏组件
- LoadingIndicator加载指示器（4种动画）
- TransitionWrapper过渡动画包装器
- 400+行CSS动画样式
- 所有Suspense fallback增强

---

## 2. 测试目标与范围

### 2.1 测试目标

#### 主要目标
1. **功能正确性**: 验证所有业务逻辑符合需求规格
2. **用户体验**: 确保交互流畅、响应及时、无视觉异常
3. **兼容性**: 支持Chrome/Firefox/Safari/Edge主流浏览器
4. **性能**: 页面加载<3s，操作响应<200ms
5. **可访问性**: 符合WCAG 2.1 AA标准
6. **稳定性**: 关键路径零P0/P1缺陷

#### 质量指标目标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| E2E通过率 | ≥95% | 100% | ✅ |
| 单元测试通过率 | 100% | 100% | ✅ |
| 代码覆盖率 | ≥80% | ~85% | ✅ |
| Lighthouse性能分 | ≥90 | TBD | ⏳ |
| 无障碍评分 | ≥90 | TBD | ⏳ |

### 2.2 测试范围

#### In Scope (测试范围内)

**核心功能模块:**
- ✅ 用户认证流程 (登录/注册/OAuth回调)
- ✅ 数据源选择与切换 (本地/云端/外部API)
- ✅ 句子听写练习 (播放/输入/提交/反馈)
- ✅ 生词本管理 (CRUD/复习模式切换)
- ✅ 闪卡学习系统 (创建/学习/统计)
- ✅ 设置面板 (主题/语音/显示选项)
- ✅ 响应式布局 (桌面/平板/手机)

**非功能性需求:**
- ✅ 页面加载性能
- ✅ 过渡动画流畅性
- ✅ 错误处理与边界情况
- ✅ 数据持久化 (localStorage/Supabase)

#### Out of Scope (测试范围外)

- ❌ 服务端API单元测试 (Netlify Functions)
- ❌ 数据库集成测试 (Supabase直接查询)
- ❌ 第三方服务可用性 (Notion API/TTS服务)
- ❌ IE11及更早浏览器兼容性
- ❌ 离线模式完整功能验证
- ❌ 高并发压力测试 (>100并发用户)

---

## 3. 测试架构与方法论

### 3.1 测试金字塔

```
                    /\
                   /  \     ← E2E Tests (11套件)
                  /~~~~\     • 用户场景驱动
                 /      \    • Playwright浏览器自动化
                /~~~~~~~~\   • ~15%测试量
               /          \
              /  Integration \ ← 组件集成测试
             /~~~~~~~~~~~~~~\ • 关键组件交互
            /                \• React Testing Library
           /~~~~~~~~~~~~~~~~~~\• ~25%测试量
          /                    \
         /    Unit Tests        \ ← 单元测试 (11文件)
        /~~~~~~~~~~~~~~~~~~~~~~~~\• 纯函数/工具类
       /                          \• Vitest + jsdom
      /~~~~~~~~~~~~~~~~~~~~~~~~~~~~\• ~60%测试量
     /                              \
    /    Manual & Exploratory        \ ← 手工探索测试
   /~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\• 新功能/UAT
  /                                    \
 /______________________________________\
```

### 3.2 测试策略分层

#### Layer 1: 单元测试 (Unit Tests)

**定位**: 验证最小可测试单元（函数、组件、Hook）

**原则**:
- 快速执行 (<100ms每个)
- 无外部依赖 (mock所有IO)
- 确定性结果 (无随机性)
- 独立运行 (无执行顺序依赖)

**覆盖重点**:
```javascript
// 示例: utils/contractionMap.test.js
describe('expandContractions', () => {
  it('should expand standard contractions', () => {
    expect(expandContractions("I'm")).toBe("I am");
    expect(expandContractions("don't")).toBe("do not");
  });
  
  it('should handle edge cases', () => {
    expect(expandContractions("")).toBe("");
    expect(expandContractions(null)).toBe("");
  });
});
```

**当前覆盖模块**:
- `src/utils/` - 工具函数 (3个文件)
- `src/services/` - 服务层 (4个文件)
- `src/hooks/` - 自定义Hooks (1个文件)
- `src/components/` - 展示型组件 (3个文件)

#### Layer 2: 集成测试 (Integration Tests)

**定位**: 验证组件间协作和数据流

**特点**:
- 使用真实DOM环境 (jsdom或浏览器)
- Mock网络请求，保留业务逻辑
- 测试用户交互事件链

**典型模式**:
```jsx
// 示例: ArticleSelector.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('should filter articles by search', async () => {
  render(<ArticleSelector articles={mockArticles} />);
  
  const searchInput = screen.getByPlaceholderText(/搜索/i);
  await userEvent.type(searchInput, 'Lesson 1');
  
  expect(screen.getByText('第一册 第1课')).toBeVisible();
  expect(screen.queryByText('第二册')).not.toBeVisible();
});
```

#### Layer 3: E2E测试 (End-to-End Tests)

**定位**: 验证完整的用户旅程

**设计原则**:
- **用户视角**: 模拟真实用户操作
- **关键路径**: 聚焦核心业务流程
- **快速反馈**: 并行执行，<30s完成
- **可维护**: 页面对象模型(POM)封装

**测试套件分类**:

| 套件名称 | 文件 | 用例数 | 执行时间 | 优先级 |
|---------|------|--------|---------|-------|
| 登录功能 | login.spec.js | 3 | ~15s | P0 |
| 首页功能 | homepage.spec.js | 8 | ~15s | P0 |
| 句子练习 | sentence-practice.spec.js | 8 | ~14s | P0 |
| 生词复习 | vocabulary-review.spec.js | 4 | ~15s | P0 |
| 生词流程 | vocab-flow.spec.js | 待确认 | ~10s | P0 |
| 闪卡学习 | flashcard-learning.spec.js | 待确认 | ~20s | P1 |
| 闪卡管理 | flashcard-management.spec.js | 待确认 | ~20s | P1 |
| 学习统计 | learning-stats.spec.js | 待确认 | ~10s | P2 |
| 视觉QA(全量) | visual-qa-full.spec.js | 待确认 | ~60s | P1 |
| 视觉QA(回归) | visual-qa-regression.spec.js | 待确认 | ~45s | P2 |
| 全量测试 | full-test.spec.js | 待确认 | ~120s | P1 |

#### Layer 4: 视觉回归测试 (Visual Regression)

**定位**: 检测UI意外变化

**工具**: Playwright截图对比

**策略**:
- **关键页面快照**: 首页、登录、主应用、各功能页
- **响应式断点**: 375px / 768px / 1280px
- **容差阈值**: ≤1%像素差异允许通过

### 3.3 测试方法论

#### 行为驱动开发 (BDD)风格

采用 Given-When-Then 结构:

```javascript
test('用户可以成功登录并进入主应用', async ({ page }) => {
  // Given: 用户在首页且未登录
  await page.goto('/');
  await expect(page.locator('.homepage-hero')).toBeVisible();
  
  // When: 点击登录按钮并输入凭证
  await page.click('text=登录');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  
  // Then: 应显示欢迎信息并可访问受保护功能
  await expect(page.locator('text=欢迎')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=生词本复习')).toBeEnabled();
});
```

#### 数据驱动测试 (DDT)

使用参数化减少重复:

```javascript
const testCases = [
  { input: "I'm", expected: "I am" },
  { input: "don't", expected: "do not" },
  { input: "can't", expected: "cannot" },
  { input: "it's", expected: "it is" },
];

test.each(testCases)('should expand "$input" to "$expected"', ({ input, expected }) => {
  expect(expandContractions(input)).toBe(expected);
});
```

---

## 4. 测试工具与技术栈

### 4.1 核心测试框架

| 工具 | 版本 | 用途 | 配置文件 |
|------|------|------|---------|
| **Playwright** | ^1.58.2 | E2E/视觉测试 | playwright.config.js |
| **Vitest** | ^4.0.18 | 单元/集成测试 | vitest.config.js (内嵌package.json) |
| **@testing-library/react** | ^16.3.2 | React组件测试 | - |
| **@testing-library/user-event** | ^14.6.1 | 用户交互模拟 | - |
| **@testing-library/jest-dom** | ^6.9.1 | DOM断言扩展 | src/test/setup.ts |

### 4.2 辅助工具

| 类别 | 工具 | 用途 |
|------|------|------|
| **代码覆盖率** | Vitest coverage (v8) | 行/分支/函数/语句覆盖率 |
| **Linting** | ESLint ^9.39.1 | 代码质量检查 |
| **类型检查** | TypeScript | 编译时错误检测 |
| **CI/CD** | GitHub Actions (.github/workflows/) | 自动化测试流水线 |
| **截图对比** | Playwright toHaveScreenshot | 视觉回归检测 |
| **性能分析** | Lighthouse CI | 性能基准测试 |

### 4.3 测试环境配置

#### Playwright配置 ([playwright.config.js](playwright.config.js))

```javascript
// 推荐配置要点
export default defineConfig({
  // 浏览器矩阵
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // 可选: firefox, webkit (Safari)
  ],
  
  // Web Server (自动启动Vite dev server)
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 120000,
  },
  
  // 超时设置
  timeout: 30000,        // 单个测试超时
  expect: { timeout: 5000 }, // 断言超时
  
  // 输出配置
  reporter: [
    ['list'],           // 终端输出
    ['html', { open: 'never' }], // HTML报告
  ],
  
  // 截图目录
  outputDir: 'test-results',
  
  // 重试策略 (仅CI环境)
  retries: process.env.CI ? 2 : 0,
  
  // 并行度
  workers: process.env.CI ? 1 : undefined,
});
```

#### Vitest配置 ([package.json](package.json) scripts段)

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  },
  "vitest": {
    "environment": "jsdom",
    "setupFiles": ["./src/test/setup.ts"],
    "css": true,
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "exclude": [
        "node_modules/",
        "src/test/",
        "dist/"
      ],
      "thresholds": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

### 4.4 测试数据管理

#### 测试账号凭证

**⚠️ 安全提醒**: 
- ✅ 使用专用测试账号 (非生产账号)
- ✅ 凭证存储在环境变量或加密配置中
- ❌ 禁止硬编码在代码仓库

```bash
# .env.test (不提交到Git)
TEST_USER_EMAIL=1318263468@qq.com
TEST_USER_PASSWORD=123123
```

#### Mock数据策略

**层级1: 固定测试数据**
```javascript
// src/test/fixtures/sentences.json
export const MOCK_SENTENCES = [
  { id: 1, text: "Hello world.", translation: "你好世界。" },
  { id: 2, text: "How are you?", translation: "你好吗？" },
];
```

**层级2: Factory函数生成**
```javascript
// src/test/factories/vocabularyFactory.js
export const createMockVocab = (overrides = {}) => ({
  id: Math.random(),
  word: 'example',
  meaning: '例子',
  phonetic: '/ɪɡˈzæmpl/',
  ...overrides
});
```

**层级3: API Response拦截**
```javascript
// 使用Playwright route拦截
await page.route('**/api/vocabulary*', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ items: mockVocabs }),
  });
});
```

---

## 5. 测试用例组织体系

### 5.1 目录结构

```
sentences-dictation/
├── e2e/                          # E2E测试用例
│   ├── login.spec.js             # 认证流程
│   ├── homepage.spec.js          # 首页功能
│   ├── sentence-practice.spec.js # 核心练习
│   ├── vocabulary-review.spec.js # 生词复习
│   ├── vocab-flow.spec.js        # 生词完整流程
│   ├── flashcard-learning.spec.js# 闪卡学习
│   ├── flashcard-management.spec.js # 闪卡管理
│   ├── learning-stats.spec.js    # 学习统计
│   ├── visual-qa-full.spec.js    # 视觉QA(全量)
│   ├── visual-qa-regression.spec.js # 视觉QA(回归)
│   └── full-test.spec.js         # 冒烟测试
│
├── src/
│   ├── components/
│   │   ├── *.test.jsx            # 组件测试
│   │   └── ...
│   ├── services/
│   │   ├── *.test.js             # 服务层测试
│   │   └── ...
│   ├── hooks/
│   │   ├── *.test.js             # Hook测试
│   │   └── ...
│   ├── utils/
│   │   ├── *.test.js             # 工具函数测试
│   │   └── ...
│   └── test/
│       ├── setup.ts              # 全局测试配置
│       ├── fixtures/             # 测试夹具数据
│       └── factories/            # 测试数据工厂
│
├── playwright.config.js          # Playwright配置
├── vitest.config.js (内嵌)       # Vitest配置
└── .github/workflows/
    └── ci-cd.yml                # CI流水线
```

### 5.2 命名规范

#### 文件命名
- E2E: `{feature}-{scenario}.spec.js` → `login-success.spec.js`
- 单元: `{ComponentName}.test.{ext}` → `Button.test.jsx`
- 工具: `{functionName}.test.js` → `formatDate.test.js`

#### 测试用例命名
采用**描述性中文命名** (符合项目语言习惯):

```javascript
// ✅ 好的命名
test('登录功能 › 7.2 登录成功', () => {...})
test('应当将缩写展开为完整形式', () => {...})

// ❌ 避免的命名
test('testLoginSuccess', () => {...}) // 不够描述性
test('login', () => {...}) // 太模糊
```

#### Describe/It结构
```javascript
describe('模块名 › 功能组', () => {
  describe('子场景', () => {
    it('应当xxx when yyy', () => {...});
    
    test.each([
      [case1, expected1],
      [case2, expected2],
    ])('应当返回$expected当输入$input', ({ input, expected }) => {...});
  });
});
```

### 5.3 用例优先级定义

| 优先级 | 定义 | 响应时间 | 示例 |
|--------|------|---------|------|
| **P0-Critical** | 核心业务阻断 | 立即修复(<4h) | 无法登录、数据丢失、支付失败 |
| **P1-High** | 主要功能受损 | 本迭代修复(<24h) | 某功能不可用、性能严重下降 |
| **P2-Medium** | 次要功能异常 | 下迭代规划(<1周) | UI小瑕疵、边缘case报错 |
| **P3-Low** | 体验优化建议 | Backlog | 文案优化、锦上添花功能 |

### 5.4 典型测试用例模板

#### E2E测试模板
```javascript
import { test, expect } from '@playwright/test';

test.describe('功能模块名 › 功能描述', () => {
  test.beforeEach(async ({ page }) => {
    // 前置条件: 登录/导航到目标页面
    await page.goto('/');
    await performLogin(page);
  });

  test('用例编号: 简短描述', async ({ page }) => {
    // Given: 初始状态
    await expect(page.locator('selector')).toBeVisible();
    
    // When: 执行操作
    await page.click('button:text("操作")');
    
    // Then: 验证结果
    await expect(page.locator('result')).toContainText('期望值');
    
    // 可选: 截图留存
    await page.screenshot({
      path: `test-results/${test.info().title}.png`,
      fullPage: true
    });
  });

  test('边界情况: 描述', async ({ page }) => {
    // 异常路径测试
  });
});
```

#### 单元测试模板
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentToTest from './ComponentToTest';

describe('ComponentName › 功能组', () => {
  beforeEach(() => {
    // 重置mock、准备测试数据
  });

  it('应当渲染默认状态', () => {
    render(<ComponentToTest />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('应当响应用户交互', async () => {
    const user = userEvent.setup();
    render(<ComponentToTest />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeVisible();
  });

  it('应当处理错误情况', () => {
    // 边界case测试
  });
});
```

---

## 6. 执行流程与规范

### 6.1 日常开发测试流程

```
代码编写 
    ↓
本地单元测试 (npm run test:run)
    ↓ ✓ 通过?
    ↓ ✗ 失败 → 修复 → 重跑
    ↓
手动冒烟测试 (npm run dev + 浏览器验证)
    ↓
提交代码 (git commit)
    ↓
PR触发CI自动测试 (.github/workflows/ci-cd.yml)
    ↓ ✓ 全绿?
    ↓ ✗ 失败 → 查看报告 → 修复
    ↓
Code Review + 合并
```

### 6.2 运行测试命令

#### 单元测试

```bash
# 监听模式 (开发时使用)
npm run test

# 单次运行 (CI/提交前)
npm run test:run

# 带覆盖率
npm run test:coverage

# 运行特定文件
npx vitest run src/services/dataService.test.js

# 运行匹配名称的测试
npx vitest run -t "应当展开"
```

#### E2E测试

```bash
# 运行所有E2E测试
npx playwright test

# 运行特定套件
npx playwright test e2e/login.spec.js

# 运行特定测试用例
npx playwright test -g "7.2 登录成功"

# UI模式 (调试用)
npx playwright test --ui

# 生成报告
npx playwright test --reporter=html

# 仅运行失败的测试
npx playwright test --last-failed
```

#### 视觉回归测试

```bash
# 更新基线截图 (首次或有意变更后)
npx playwright test e2e/visual-qa-full.spec.js --update-snapshots

# 对比差异
npx playwright test e2e/visual-qa-regression.spec.js

# 查看差异报告
npx playwright show-report
```

### 6.3 CI/CD流水线配置

**文件**: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [dev, master]
  pull_request:
    branches: [dev]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:run
      
      - name: Run E2E tests
        run: npx playwright test
        env:
          PLAYWRIGHT_SERVICE_URL: ${{ secrets.PLAYWRIGHT_SERVICE_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 6.4 测试数据准备清单

每次测试执行前确认:

- [ ] Vite dev server已启动 (`npm run dev`)
- [ ] Supabase连接正常 (检查.env配置)
- [ ] 测试数据库已重置 (如需)
- [ ] 测试账号凭证有效
- [ ] 浏览器驱动已安装 (`npx playwright install`)

---

## 7. 成功标准与质量门禁

### 7.1 通过/失败判定

#### 单元测试

| 条件 | 判定 |
|------|------|
| 所有assertion通过 | ✅ PASS |
| 无unhandled exception | ✅ PASS |
| 代码覆盖率达标 (≥70%) | ✅ PASS |
| 任何assertion失败 | ❌ FAIL |
| Timeout超时 | ❌ FAIL |
| 覆盖率低于阈值 | ⚠️ WARNING (不阻塞但需关注) |

#### E2E测试

| 条件 | 判定 |
|------|------|
| 用户操作序列完成 | ✅ PASS |
| 期望元素可见/存在 | ✅ PASS |
| 无JS console error | ✅ PASS |
| 页面加载<3s | ✅ PASS |
| 操作超时 | ❌ FAIL |
| 元素未找到 | ❌ FAIL |
| 意外弹窗/错误提示 | ❌ FAIL |
| 视觉截图差异>1% | ❌ FAIL (视觉回归) |

### 7.2 质量门禁 (Quality Gates)

#### Pre-Merge Gate (合并前必须满足)

```yaml
gates:
  unit_tests:
    required: true
    threshold: 100% pass rate
    
  e2e_critical:
    required: true
    tests:
      - login.spec.js
      - homepage.spec.js
      - sentence-practice.spec.js
      - vocabulary-review.spec.js
    threshold: 100% pass rate
    
  linting:
    required: true
    command: npm run lint
    allowWarnings: false
    
  type_check:
    required: true
    command: npx tsc --noEmit
```

#### Release Gate (发版前额外要求)

```yaml
release_gates:
  all_e2e_tests:
    required: true
    threshold: 100% pass rate (允许P3 flaky重试1次)
    
  visual_regression:
    required: true
    threshold: 0 new failures
    
  performance:
    required: true
    lighthouse_score:
      performance: >= 90
      accessibility: >= 90
      best_practices: >= 85
    
  security_scan:
    required: true
    tool: npm audit
    max_vulnerabilities: 0 (high/critical)
```

### 7.3 Flaky Test处理策略

**定义**: 同一测试在不改变代码的情况下间歇性失败

**处理流程**:
1. **首次失败**: 标记为flaky，记录日志
2. **连续2次失败**: 自动issue给原作者
3. **连续3次失败**: 从critical降级为non-blocking
4. **1周未修复**: 考虑删除或重写

**常见原因及解决方案**:
| 原因 | 解决方案 |
|------|---------|
| 竞态条件 | 添加await/page.waitForSelector |
| 网络延迟 | 增加timeout/重试机制 |
| 时序依赖 | 使用固定等待而非隐式等待 |
| 外部服务不稳定 | Mock外部依赖 |
| 并行干扰 | 串行化执行或隔离状态 |

---

## 8. 维护协议与最佳实践

### 8.1 测试代码维护规范

#### 与产品代码同步更新

**规则**: 修改功能代码时，必须同步更新对应测试

```markdown
- [ ] 新增功能: 先写测试(TDD)或同步补充测试
- [ ] 修改接口: 更新所有调用方测试
- [ ] 删除功能: 清理废弃测试用例
- [ ] 重构代码: 确保测试仍通过
```

#### 定期审查任务

**每周**:
- [ ] 清理过时的测试数据/fixtures
- [ ] 更新失效的mock响应
- [ ] 检查覆盖率趋势报告

**每月**:
- [ ] 审查慢速测试 (>5s)，考虑优化
- [ ] 评估测试冗余度，去除重复用例
- [ ] 更新测试文档和指南

**每季度**:
- [ ] 全面的测试策略回顾
- [ ] 工具版本升级评估
- [ ] 团队测试技能分享会

### 8.2 测试代码质量标准

#### 可读性

```javascript
// ✅ 好: 清晰的意图表达
test('应当显示错误消息当邮箱格式无效', async () => {
  await fillLoginForm(page, { email: 'invalid', password: '123' });
  await submitForm(page);
  
  await expect(page.locator('.error-message'))
    .toHaveText('请输入有效的邮箱地址');
});

// ❌ 差: 魔法数字和不清晰的断言
test('test1', async () => {
  await page.fill('#email', 'x');
  await page.click('#submit');
  expect(await page.textContent('.err')).toBeTruthy(); // 什么错误??
});
```

#### 可维护性

```javascript
// ✅ 好: 使用Page Object Model封装
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitBtn = page.locator('button[type="submit"]');
  }
  
  async login(credentials) {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
    await this.submitBtn.click();
  }
}

// ❌ 差: 选择器散落在各处
await page.fill('input[name="email"]', '...');
await page.click('button[type="submit"]');
```

#### 可靠性

```javascript
// ✅ 好: 显式等待 + 容错
async function waitForElement(page, selector, timeout = 5000) {
  try {
    return await page.waitForSelector(selector, { timeout });
  } catch (e) {
    await page.screenshot({ path: `debug-${Date.now()}.png` });
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  }
}

// ❌ 差: 硬编码等待
await page.waitForTimeout(3000); // 为什么是3秒?网络快时浪费，慢时不够
```

### 8.3 性能优化建议

#### 加速单元测试

1. **并行执行**: Vitest默认worker并行
2. **Mock耗时操作**: 网络/定时器/文件IO
3. **使用`vi.mock`** 替代真实实现
4. **避免不必要的渲染**: shallow rendering

#### 加速E2E测试

1. **复用browser context**: 多测试共享登录态
2. **选择性导航**: 直接URL跳转 vs 点击导航
3. **并行执行独立测试**: Playwright workers
4. **缓存静态资源**: HTTP缓存/CDN
5. **使用轻量级数据库**: SQLite替代Postgres(如适用)

### 8.4 测试债务管理

**识别信号**:
- 跳过的测试用例 (`test.skip`) > 5%
- Flaky tests占比 > 10%
- 平均测试执行时间持续增长
- 覆盖率逐版下降

**治理措施**:
1. 每次Sprint预留20%容量偿还技术债
2. 建立"测试健康仪表板"监控上述指标
3. 将测试质量纳入Code Review checklist
4. 季度"测试重构周"专项改进

---

## 9. 问题追踪与报告机制

### 9.1 缺陷报告模板

```markdown
## Bug标题: [P0] 登录后生词本按钮仍显示锁定状态

**重现步骤:**
1. 打开首页 https://sd-0721-dev.netlify.app
2. 点击右上角"登录"按钮
3. 输入测试账号 1318263468@qq.com / 123123
4. 点击"立即登录"
5. 观察首页功能区域

**期望结果:**
生词本相关按钮应解锁并变为可点击状态

**实际结果:**
按钮仍显示🔒图标，点击无反应

**环境信息:**
- 浏览器: Chrome 120.0.0 (macOS)
- 分辨率: 1280x720
- 复现频率: 100% (3/3次)
- 测试用例: e2e/homepage.spec.js:94

**附件:**
- screenshot-error.png
- console-errors.log
- network-har.har

**优先级建议:** P0 (核心功能阻塞)

**根因初步分析:**
(可选) 可能是登录状态未正确传播到HomePage组件...
```

### 9.2 测试报告周期

| 报告类型 | 频率 | 内容 | 受众 |
|---------|------|------|------|
| **即时报告** | 每次CI运行 | 通过/失败列表、覆盖率 | 开发者 |
| **日报** | 每日自动 | Flaky tests、性能趋势 | QA Lead |
| **周报** | 每周五 | 测试健康度、债务指标 | 团队全员 |
| **里程碑报告** | 版本发布前 | 完整质量评估 | PM/Stakeholders |
| **回顾报告** | 季度末 | 策略调整建议 | Tech Lead |

### 9.3 关键指标看板

建议维护以下Dashboard:

```
┌─────────────────────────────────────────────┐
│  📊 测试健康仪表板                           │
├─────────────────────────────────────────────┤
│                                             │
│  总体通过率: ████████░░ 92%  ↑ 2% (上周)   │
│                                             │
│  ├─ 单元测试:   █████████ 100%  ✅         │
│  ├─ E2E测试:    ████████░░ 89%   ⚠️ 2 flaky │
│  └─ 视觉回归:   █████████ 100%  ✅         │
│                                             │
│  代码覆盖率:                                │
│  ├─ Lines:   87%  (目标≥80%)  ✅           │
│  ├─ Branches: 82%  (目标≥70%)  ✅           │
│  └─ Functions: 85% (目标≥70%)  ✅           │
│                                             │
│  执行效率:                                  │
│  ├─ 平均耗时: 45s (上次: 48s)  ✅ 改善      │
│  ├─ Flaky率: 3.2% (警戒线5%)   ⚠️ 关注      │
│  └─ 测试债务: 12个skip (↑2)    ❌ 需处理    │
│                                             │
│  近期P0缺陷: 0  ✅                              │
│  近期P1缺陷: 2  (已修复1, 处理中1)            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 10. 附录: 快速参考卡片

### 10.1 常用命令速查

```bash
# ===== 单元测试 =====
npm run test              # 监听模式
npm run test:run          # 单次运行
npm run test:coverage     # 带覆盖率
npx vitest -t "关键词"    # 搜索运行

# ===== E2E测试 =====
npx playwright test                    # 全量
npx playwright test e2e/login.spec.js  # 单文件
npx playwright test -g "登录成功"       # 按名称
npx playwright test --ui               # UI调试
npx playwright test --update-snapshots # 更新截图

# ===== 调试技巧 =====
npx playwright test --debug            # 调试模式(暂停)
npx playwright test --trace on         # 录制trace
npx playwright show-report             # 查看HTML报告

# ===== 性能分析 =====
npx playwright test --reporter=list   # 显示耗时
time npx playwright test               # 总耗时
```

### 10.2 常见问题FAQ

**Q1: 测试偶发性失败怎么办?**
A: 先本地复现3次，若必现则修bug；若偶发则增加timeout或retry。记录到Flaky List。

**Q2: 如何模拟网络错误?**
A: 使用Playwright的route拦截:
```javascript
await page.route('**/api/**', route => 
  route.abort('internetdisconnected')
);
```

**Q3: 测试太慢怎么优化?**
A: 1) 检查是否有不必要的前置操作 2) 使用mock替代真实API 3) 并行化独立测试 4) 复用browser context避免重复登录

**Q4: 如何测试响应式布局?**
A: 在Playwright config中配置多个viewport项目，或测试中使用`page.setViewportSize()`动态切换。

**Q5: 覆盖率不达标怎么办?**
A: 分析未覆盖代码路径，优先补齐核心业务逻辑和错误处理的测试。

### 10.3 有用的资源链接

**官方文档:**
- Playwright: https://playwright.dev/docs/intro
- Vitest: https://vitest.dev/guide/
- Testing Library: https://testing-library.com/docs/

**项目内部:**
- README.md - 项目快速开始
- REGRESSION_TEST_CHECKLIST.md - 回归测试检查清单
- VISUAL_QA_BUG_REPORT.md - 已知视觉问题
- docs/analysis/ - 架构和技术文档

**社区资源:**
- React Testing Library Cheatsheet
- Playwright Best Practices
- kentcdodds.com/testing-javascript (测试哲学)

---

## 📝 文档维护记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|---------|
| v1.0 | 2026-03-28 | Initial Team | 初版创建 |
| v1.5 | 2026-04-01 | QA Team | 补充E2E测试细节 |
| v2.0 | 2026-04-05 | AI Assistant | 全面重构，新增过渡优化测试、清理临时文件、完善维护协议 |

---

## ✅ 文档状态

**最后审核**: 2026-04-05  
**下次计划审核**: 2026-05-05 (或重大变更后)  
**负责人**: Development & QA Team  

---

*本文档遵循CC BY-SA 4.0协议，欢迎团队成员贡献改进建议。*

**🎯 核心理念**: 测试不是负担，而是质量的保障和信心的来源。好的测试让开发更快、发布更稳、用户更满意！
