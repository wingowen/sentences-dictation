# 句子听写练习工具重构实施计划

## 项目概述
**项目名称**: sentences-dictation
**分析日期**: 2026-01-22
**架构质量评分**: 4.3/10
**计划周期**: 8周
**目标评分**: 8.5/10

## 重构目标

### 主要目标
1. 提升代码质量和可维护性
2. 修复安全漏洞和性能问题
3. 改善组件架构和状态管理
4. 建立完善的测试体系

### 量化目标
| 指标 | 当前 | 目标 | 改进 |
|--------|------|------|--------|
| App.jsx行数 | 1362 | <400 | -70% |
| Bundle大小 (gzip) | 1,107KB | <600KB | -45% |
| 代码重复行数 | ~150 | <20 | -87% |
| useEffect数量 | 12 | <5 | -58% |
| useState数量 | 26 | <8 | -69% |
| 安全漏洞数 | 3+ | 0 | -100% |
| 测试覆盖率 | 0% | >70% | +70% |

## 问题优先级矩阵

| 问题类别 | 严重性 | 紧急性 | 优先级 | 处理顺序 |
|---------|---------|---------|----------|----------|
| .env文件泄露 | 🔴 严重 | 🔴 紧急 | P0 | 阶段1 |
| SSRF安全漏洞 | 🔴 严重 | 🔴 紧急 | P0 | 阶段1 |
| 数据拼写错误 | 🟡 中等 | 🔴 紧急 | P1 | 阶段1 |
| 代码重复(84行缩略词) | 🟡 中等 | 🟡 高 | P1 | 阶段2 |
| God组件反模式 | 🔴 严重 | 🟡 高 | P1 | 阶段2-3 |
| 属性透传(21个props) | 🟡 中等 | 🟡 高 | P1 | 阶段2-3 |
| localStorage频繁写入 | 🟡 中等 | 🟡 高 | P1 | 阶段3 |
| 缺失useCallback | 🟡 中等 | 🟡 高 | P2 | 阶段3 |
| Bundle过大(4.4MB) | 🟡 中等 | 🟢 中 | P2 | 阶段5 |
| CORS不一致 | 🟢 低 | 🟢 中 | P2 | 阶段2 |
| 缺少单元测试 | 🟢 低 | 🟢 中 | P3 | 阶段6 |

## 阶段1：安全修复和代码清理 (第1周)

### 任务列表

#### 1.1 从Git历史中移除敏感文件
**优先级**: P0 | **时间**: 30分钟 | **风险**: 低

**步骤**:
```bash
# 1. 从Git历史中移除.history目录
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch -r .history' \
  --prune-empty HEAD

# 2. 清理引用
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin

# 3. 验证.gitignore包含.history
echo ".history" >> .gitignore
echo ".netlify" >> .gitignore

# 4. 强制推送(谨慎！)
# git push origin --force --all
```

**验收标准**:
- [ ] `.history`目录不再存在于Git中
- [ ] `.gitignore`包含`.history`和`.netlify`
- [ ] 历史提交中无.env文件

#### 1.2 修复SSRF安全漏洞
**优先级**: P0 | **时间**: 2小时 | **风险**: 中

**影响文件**:
- `netlify/functions/get-new-concept-3-lesson.js`
- `netlify/functions/get-real-article-link.js`

**实施**: 在 `netlify/functions/shared/url-validator.js` 创建URL白名单验证

**验收标准**:
- [ ] URL验证模块创建
- [ ] 两个受影响函数都使用验证
- [ ] 测试验证: `http://169.254.169.254/`返回403

#### 1.3 修复数据拼写错误
**优先级**: P1 | **时间**: 5分钟 | **风险**: 低

**影响文件**: `src/data/简单句.json`

**修改**: 第20行从 "I don't want to miss train." 改为 "I don't want to miss the train."

#### 1.4 统一CORS配置
**优先级**: P2 | **时间**: 1小时 | **风险**: 低

**实施**: 在 `netlify/functions/shared/cors.js` 创建共享CORS中间件

**验收标准**:
- [ ] 所有函数都使用共享CORS模块
- [ ] OPTIONS请求返回200状态码

## 阶段2：服务层重构 (第2-3周)

### 2.1 提取共享缩略词映射
**优先级**: P1 | **时间**: 1小时 | **风险**: 低

创建 `src/utils/contractionMap.js` - 统一的缩略词映射表
减少 ~84 行重复代码

### 2.2 提取防抖工具
**优先级**: P1 | **时间**: 30分钟 | **风险**: 低

创建 `src/utils/debounce.js` - 防抖和节流工具
减少 ~10 行重复代码

### 2.3 创建错误处理标准
**优先级**: P2 | **时间**: 2小时 | **风险**: 低

创建 `src/utils/errors.js` - 标准化错误类和错误码

### 2.4 提取Netlify公共代码
**优先级**: P2 | **时间**: 3小时 | **风险**: 中

创建 `netlify/functions/shared/cache.js` - 共享缓存逻辑
减少 ~240 行重复代码

## 阶段3：React状态管理重构 (第4-5周)

### 3.1 创建自定义Hooks
- `src/hooks/useLocalStorage.js`
- `src/hooks/usePracticeStats.js`
- `src/hooks/usePracticeProgress.js`
- `src/hooks/useSpeechVoices.js`
- `src/hooks/useSpeechPlayback.js`
- `src/hooks/useSentences.js`

### 3.2 创建Context API
创建 `src/context/AppContext.jsx` - 替换prop drilling

### 3.3 重构App.jsx
从1362行减少到<400行，使用自定义hooks

## 阶段4：组件拆分 (第6-7周)

### 4.1 拆分FlashcardManager
创建子组件:
- FlashcardList
- FlashcardForm
- FlashcardFilter

### 4.2 拆分FlashcardLearner
创建子组件:
- FlashcardView
- LearningStats
- ResponseButtons

### 4.3 拆分WordInputs
创建子组件:
- WordInput
- InputControls
- AutoFocusManager
将props从21个减少到<10个

## 阶段5：性能优化 (第7周)

### 5.1 实现代码分割
使用React.lazy懒加载大型组件

### 5.2 配置Vite代码分割
在vite.config.js配置manualChunks

### 5.3 添加React.memo优化
对纯展示组件使用React.memo

### 5.4 添加useCallback到处理函数
对所有事件处理函数使用useCallback

## 阶段6：测试和质量保证 (第8周)

### 6.1 设置测试框架
安装Jest和React Testing Library

### 6.2 编写Hooks单元测试
测试覆盖率 > 70%

### 6.3 编写组件测试
测试覆盖率 > 70%

### 6.4 配置GitHub Actions CI
设置CI/CD pipeline

## 风险管理

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Git filter-branch失败 | 中 | 高 | 备份仓库，先在测试分支执行 |
| 重构引入新bug | 高 | 高 | 每个阶段完成后测试 |

## 成功指标

### 量化目标

| 指标 | 当前 | 最终目标 |
|--------|------|---------|
| 安全漏洞数 | 3+ | 0 |
| 代码重复行数 | ~150 | <20 |
| App.jsx行数 | 1362 | <400 |
| useState数量 | 26 | <8 |
| useEffect数量 | 12 | <5 |
| WordInputs props | 21 | <10 |
| Bundle大小(gzip) | 1,107KB | <600KB |
| 测试覆盖率 | 0% | >70% |
| 架构评分 | 4.3/10 | 8.5/10 |

## 实施时间表

| 周 | 阶段 | 主要任务 |
|----|------|---------|
| 第1周 | 阶段1 | 安全修复和代码清理 |
| 第2-3周 | 阶段2 | 服务层重构 |
| 第4-5周 | 阶段3 | React状态管理重构 |
| 第6-7周 | 阶段4 | 组件拆分 |
| 第7周 | 阶段5 | 性能优化 |
| 第8周 | 阶段6 | 测试和质量保证 |

---

**文档版本**: 1.0
**创建日期**: 2026-01-22
**状态**: 待执行
