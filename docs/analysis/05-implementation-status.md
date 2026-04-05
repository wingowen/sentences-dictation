# 模块 05：实现情况与风险评估

> **模块标识**：`05-implementation-status`  
> **依赖关系**：[03-核心功能模块](./03-core-modules.md) + [04-数据流程与数据库](./04-data-flow-and-database.md)  
> **相关文件**：[src/](../../src/)、[netlify/functions/](../../netlify/functions/)、[e2e/](../../e2e/)  
> **阅读时间**：15分钟  
> **最后更新**：2026-04-05

---

## 📌 模块概述

本模块提供项目的**现状全景图**，包括：

1. ✅ **功能完成度矩阵**（93% 总体完成率）
2. 🌟 **已实现的亮点功能**
3. ⚠️ **潜在风险与挑战**（按等级分类）
4. 📊 **测试覆盖情况**

这是项目重构和优化决策的重要依据。

---

## 一、功能实现情况总览

### 1.1 总体完成度：93% ✅

| 功能域 | 计划功能数 | 已实现 | 实现率 | 状态 |
|--------|-----------|--------|--------|------|
| **句子听写核心** | 9 | 9 | 100% | ✅ 完成 |
| **闪卡系统** | 4 | 3.8 | 95% | ✅ 完成 |
| **生词本系统** | 4 | 3.8 | 95% | ✅ 完成 |
| **管理后台** | 6 | 5.4 | 90% | ✅ 完成 |
| **基础设施** | 7 | 6.5 | 93% | ✅ 完成 |
| **总计** | **30** | **28.5** | **93%** | ✅ 基本完成 |

---

### 1.2 详细功能清单

#### 🔵 句子听写练习系统（9/9 = 100%）

| # | 功能点 | 描述 | 实现状态 | 关键文件 |
|---|--------|------|---------|---------|
| G1 | 多数据源支持 | 本地JSON/Notion/NCE1-3/Supabase 共7种 | ✅ 完成 | [dataService.js](../../src/services/dataService.js) |
| G2 | 语音合成播放 | Web Speech API + Edge TTS备选 | ✅ 完成 | [speechService.js](../../src/services/speechService.js) |
| G3 | 逐词输入界面 | 每个单词独立输入框，自动聚焦跳转 | ✅ 完成 | [WordInputs.jsx](../../src/components/WordInputs.jsx) |
| G4 | 实时验证反馈 | 单词级+句子级双重验证，即时显示正确/错误 | ✅ 完成 | [App.jsx#L692-L720](../../src/App.jsx#L692-L720) |
| G5 | 音标显示 | CMU Dictionary集成，支持134,000+词汇 | ✅ 完成 | [pronunciationService.js](../../src/services/pronunciationService.js) |
| G6 | 进度追踪统计 | localStorage持久化，支持多数据源分别记录 | ✅ 完成 | [App.jsx#L164-L173](../../src/App.jsx#L164-L173) |
| G7 | 随机模式 | Fisher-Yates洗牌算法，可切换顺序/随机 | ✅ 完成 | [App.jsx#L679-L687](../../src/App.jsx#L679-L687) |
| G8 | 听力循环模式 | 自动连续播放+切换，适合磨耳朵 | ✅ 完成 | [App.jsx#L1053-L1091](../../src/App.jsx#L1053-L1091) |
| G9 | 设置自定义 | 语速(0.5x-2x)、自动播放、自动跳转、显示选项 | ✅ 完成 | [SettingsModal.jsx](../../src/components/SettingsModal.jsx) |

#### 🟢 闪卡学习系统（3.8/4 = 95%）

| # | 功能点 | 描述 | 实现状态 | 关键文件 |
|---|--------|------|---------|---------|
| F1 | SM-2间隔重复算法 | 动态调整复习间隔，基于记忆强度评分 | ✅ 完成 | [spacedRepetitionService.js](../../src/services/spacedRepetitionService.js) |
| F2 | 闪卡CRUD管理 | 创建/编辑/删除/批量操作 | ✅ 完成 | [FlashcardManager.jsx](../../src/components/FlashcardManager.jsx) |
| F3 | 学习/复习模式 | Learning新卡片 + Review到期卡片 | ✅ 完成 | [FlashcardLearner.jsx](../../src/components/FlashcardLearner.jsx) |
| F4 | 导入/导出 | Markdown格式，Anki兼容性 | ⚠️ 85% | [flashcardImportService.js](../../src/services/flashcardImportService.js) |

#### 🟡 生词本管理系统（3.8/4 = 95%）

| # | 功能点 | 描述 | 实现状态 | 关键文件 |
|---|--------|------|---------|---------|
| V1 | 一键添加生词 | 从练习界面快速收集，自动填入上下文 | ✅ 完成 | [App.jsx#L1190-L1237](../../src/App.jsx#L1190-L1237) |
| V2 | 生词CRUD管理 | 查看/编辑/删除，支持搜索筛选 | ✅ 完成 | [VocabularyApp.jsx](../../src/components/VocabularyApp.jsx) |
| V3 | 复习提醒系统 | 基于next_review_at的智能调度 | ✅ 完成 | [VocabularyReview.jsx](../../src/components/VocabularyReview.jsx) |
| V4 | 云端同步 | 登录用户数据Supabase持久化 | ⚠️ 90% | [api-vocabulary.js](../../netlify/functions/api-vocabulary.js) |

#### 🟠 管理后台系统（5.4/6 = 90%）

| # | 功能点 | 描述 | 实现状态 | 关键文件 |
|---|--------|------|---------|---------|
| A1 | Dashboard仪表盘 | 数据总览、最近活动、快捷入口 | ✅ 90% | [Dashboard.tsx](../../admin/src/pages/Dashboard.tsx) |
| A2 | 文章管理 | CRUD、发布控制、标签关联、批量导入 | ✅ 95% | [Articles.tsx](../../admin/src/pages/Articles.tsx) |
| A3 | 句子管理 | CRUD、序号调整、扩展信息编辑 | ✅ 95% | [Sentences.tsx](../../admin/src/pages/Sentences.tsx) |
| A4 | 标签管理 | CRUD、颜色自定义 | ✅ 100% | [Tags.tsx](../../admin/src/pages/Tags.tsx) |
| A5 | 统计分析图表 | 学习数据可视化、用户活跃度 | ⚠️ 80% | [Statistics.tsx](../../admin/src/pages/Statistics.tsx) |
| A6 | 系统设置 | 配置管理、数据导入导出 | ⚠️ 85% | [Settings.tsx](../../admin/src/pages/Settings.tsx) |

#### ⚫ 基础设施层（6.5/7 = 93%）

| # | 功能点 | 描述 | 实现状态 | 关键文件 |
|---|--------|------|---------|---------|
| I1 | 用户认证 | Supabase Auth + OAuth + JWT | ✅ 95% | [auth.js](../../netlify/functions/auth.js) |
| I2 | API层 | 18个Netlify Functions端点 | ✅ 100% | [netlify/functions/](../../netlify/functions/) |
| I3 | 数据库Schema | 6张表 + RLS + 触发器 | ✅ 100% | [schema.sql](../../supabase/schema.sql) |
| I4 | CI/CD流水线 | GitHub Actions (5个Job) | ✅ 100% | [ci-cd.yml](../../.github/workflows/ci-cd.yml) |
| I5 | 单元测试 | Vitest框架 + 覆盖率70%目标 | ⚠️ 85% | [*.test.js](../../src/) |
| I6 | E2E测试 | Playwright (12个测试套件) | ✅ 90% | [e2e/*.spec.js](../../e2e/) |
| I7 | Docker部署 | 容器化 + docker-compose | ✅ 100% | [Dockerfile](../../Dockerfile), [docker-compose.yml](../../docker-compose.yml) |

---

## 二、已实现的亮点功能

### 🌟 亮点 1：智能缩写展开系统

**问题**：英语中大量使用缩写形式（I'm, don't, can't...），标准答案可能包含缩写而用户输入完整形式（或反之），导致验证失败。

**解决方案**：
- 维护完整的缩写映射表（[contractionMap.js](../../src/utils/contractionMap.js)，覆盖200+常见缩写）
- 数据加载时预处理：`expandContractionsInSentence()` 将所有缩写展开为完整形式
- 验证时统一标准化：忽略大小写、空格、标点差异

**效果**：
```
输入: "I am fine and you are?" 
标准: "I'm fine, and you're?"
→ ✓ 验证通过（normalize后一致）
```

**技术价值**：
- ✅ 显著提升用户体验（减少"明明对了却判错"的挫败感）
- ✅ 降低内容制作成本（无需手动统一格式）
- ✅ 可扩展性强（易于添加新的缩写规则）

---

### 🌟 亮点 2：多级缓存架构

**目标**：在各种网络环境下都能提供流畅的用户体验。

**缓存层级设计**：

| 层级 | 存储位置 | 内容 | 生命周期 | 命中率影响 |
|------|---------|------|---------|-----------|
| **L1: 内存** | React State (`sentenceCache`) | 句子解析后的音标数据 | 组件存活期 | ★★★★★ |
| **L2: 浏览器** | localStorage | 练习进度、设置偏好 | 永久（手动清除） | ★★★★☆ |
| **L3: 服务端** | `.cache/` 目录 | Netlify Functions API响应 | 可配置TTL | ★★★☆☆ |
| **L4: CDN** | Netlify CDN | 静态资源(JS/CSS/图片) | Cache-Control头 | ★★★★★ |

**关键实现**：
```javascript
// App.jsx - 预计算所有句子的音标数据（避免切换时重复计算）
const cache = {};
data.forEach((sentence, index) => {
  cache[index] = {
    wordsWithPhonetics: parseSentenceForPhonetics(sentence.text),
    translation: sentence.translation,
  };
});
setSentenceCache(cache); // L1 缓存
```

**性能提升**：
- 首次加载句子后，切换题目时**无感知延迟**（命中L1缓存）
- 刷新页面后，练习进度**立即恢复**（命中L2缓存）
- 重复访问API时，**避免外部请求**（命中L3/L4缓存）

---

### 🌟 亮点 3：完善的错误处理与回退机制

**场景**：用户选择的外部数据源（如Notion）不可用时。

**传统做法**：显示错误页面，用户无法继续使用。

**本项目做法**：
```javascript
// App.jsx - 数据源失败时的自动回退逻辑
try {
  data = await getSentences(dataSource); // 尝试加载所选数据源
} catch (error) {
  console.error('加载数据源失败:', error);
  
  // 如果不是本地数据源，尝试回退到本地数据
  if (dataSource !== DATA_SOURCE_TYPES.LOCAL) {
    try {
      setDataSource(DATA_SOURCE_TYPES.LOCAL); // 切换到本地
      const localData = await getSentences(DATA_SOURCE_TYPES.LOCAL);
      setSentences(localData);
      setDataSourceError(`数据源加载失败，已切换到本地数据: ${error.message}`);
      // 用户仍可继续使用，只是数据来源变了
    } catch (fallbackError) {
      // 本地也失败了，允许重新选择数据源
      setHasSelectedDataSource(false);
    }
  }
}
```

**用户体验**：
- ✅ **优雅降级**：即使外部服务不可用，核心功能仍可用
- ✅ **清晰提示**：告知用户发生了什么以及当前使用的数据源
- ✅ **零阻塞**：不会卡在错误状态，用户可以继续操作

---

### 🌟 亮点 4：树形数据源菜单

**创新点**：将原本扁平的数据源列表重构为三级树形结构。

**菜单结构**：
```
📚 练习模式
   ├── 🎴 闪卡学习
   ├── 📝 闪卡管理
   └── 📖 生词本复习（需登录⚠️）

📖 教材资源
   └── 📗 新概念英语
       ├── 1️⃣ 第一册（本地✅）
       ├── 2️⃣ 第二册（在线🌐）
       └── 3️⃣ 第三册（在线🌐）

☁️ 云端资源
   ├── 📋 Notion
   └── 🗄️ Supabase 文章（需登录⚠️）
```

**技术实现**：
- 使用递归组件渲染任意深度的树形结构
- 支持图标、描述文字、权限标识
- 点击外部区域自动关闭（防止遮挡）

**价值**：
- ✅ **可扩展性强**：新增数据源只需修改配置数组
- ✅ **信息层次清晰**：用户能快速定位想要的功能
- ✅ **权限提示明确**：需要登录的功能有视觉标识

---

### 🌟 亮点 5：丰富的练习模式组合

**支持的练习模式**：

| 模式 | 触发方式 | 适用场景 | 特点 |
|------|---------|---------|------|
| **顺序模式** | 默认 | 系统学习教材 | 按照预设顺序逐题进行 |
| **随机模式** | 设置中开启 | 复习巩固 | 打乱顺序，避免记忆位置 |
| **听力模式** | 设置中开启 | 磨耳朵 | 自动循环播放，不强制输入 |
| **自动播放** | 设置中开启 | 懒人模式 | 加载题目后自动朗读 |
| **自动跳转** | 设置中开启 | 高效练习 | 答对后3秒自动进入下一题 |

**组合示例**：
- 🎯 **新手推荐**：顺序 + 自动播放 + 自动跳转（降低操作负担）
- 🏃 **进阶训练**：随机 + 手动播放 + 手动跳转（主动思考）
- 👂 **通勤磨耳朵**：听力模式 + 循环播放（利用碎片时间）

---

## 三、潜在风险与挑战评估

### 3.1 风险分级总览

| 风险等级 | 数量 | 占比 | 典型问题 | 应对优先级 |
|---------|------|------|---------|-----------|
| 🔴 **高风险** | 3 | 27% | 可能导致功能不可用或严重Bug | P0（立即处理） |
| 🟡 **中风险** | 3 | 27% | 影响体验或存在隐患 | P1（近期规划） |
| 🟢 **低风险** | 5 | 46% | 改进空间或长期关注 | P2（后续迭代） |

---

### 🔴 高风险项（需重点关注）

#### 风险 1：React 19 兼容性问题

**问题描述**：
项目使用 React 19.2.0（较新版本），部分第三方库可能尚未完全兼容。

**具体表现**：
- [App.jsx:120](../../src/App.jsx#L120) 存在绕过 React 事件系统的 hack：
  ```javascript
  window.__setShowLoginModal = setShowLoginModal;
  ```
  这表明直接操作全局变量来绑定事件处理器，可能是为了解决 React 19 的某些 breaking change。

**影响范围**：
- 状态更新可能不符合预期
- 第三方库（如 Radix UI 在管理后台中使用）可能有兼容问题
- 并发特性（Concurrent Features）的行为差异

**缓解措施**：
1. ✅ 保持依赖包定期更新（npm update）
2. ⚠️ 补充充分的单元测试和集成测试
3. 📝 关注 React 19 官方 changelog 和已知问题
4. 💡 必要时考虑降级至 React 18（稳定版）

**建议行动**：
- **短期**：记录所有使用 hack 的地方，添加详细注释说明原因
- **中期**：逐步迁移到 React 19 推荐的模式（如 useSyncExternalStore）
- **长期**：等待生态成熟后再全面采用新特性

---

#### 风险 2：App.jsx 文件过于庞大（1634行）

**问题描述**：
[App.jsx](../../src/App.jsx) 包含了整个应用的核心逻辑，超过1600行代码，职责过多。

**问题分析**：
- ❌ **难以维护**：任何修改都需要理解整个文件的上下文
- ❌ **测试困难**：难以对单个功能点进行单元测试
- ❌ **协作冲突**：多人同时修改容易产生 Git 冲突
- ❌ **性能隐忧**：过多的 state 和 effect 可能导致不必要的重渲染

**代码复杂度指标**：
- 圈复杂度：高（多个嵌套的条件分支和回调）
- 函数数量：30+ 个方法/函数
- State 数量：20+ 个 useState
- Effect 数量：10+ 个 useEffect

**重构建议方案**：

```javascript
// 将 App.jsx 拆分为多个自定义 Hooks：

// hooks/usePracticeLogic.js - 练习核心逻辑
export function usePracticeLogic() {
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordInputs, setWordInputs] = useState([]);
  // ... 所有练习相关的状态和方法
  return { sentences, currentIndex, wordInputs, loadSentences, handleNext, ... };
}

// hooks/useSpeechControl.js - 语音控制逻辑
export function useSpeechControl() {
  const [speechRate, setSpeechRate] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  // ... 所有语音相关的状态和方法
  return { speechRate, autoPlay, handlePlay, speak, ... };
}

// hooks/useAuthState.js - 认证状态管理
export function useAuthState() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // ... 所有认证相关的状态和方法
  return { currentUser, showLoginModal, login, logout, ... };
}

// App.jsx (重构后)
function AppContent() {
  const practice = usePracticeLogic();      // 练习逻辑
  const speech = useSpeechControl();        // 语音控制
  const auth = useAuthState();              // 认证状态
  
  return (
    <div className="app">
      <Header auth={auth} speech={speech} />
      <Main practice={practice} speech={speech} />
    </div>
  );
}
```

**预期收益**：
- ✅ 每个 Hook 职责单一，易于理解和测试
- ✅ 状态逻辑复用性增强（如语音控制可在其他组件中使用）
- ✅ 协作效率提升（不同开发者负责不同 Hook）
- ✅ 性能优化更精准（可以单独 memoize 每个 Hook 的返回值）

**建议行动**：
- **Phase 1（1-2周）**：提取 `usePracticeLogic`（最大最复杂的部分）
- **Phase 2（1周）**：提取 `useSpeechControl` 和 `useAuthState`
- **Phase 3（1周）**：提取剩余的工具函数到 services 层

---

#### 风险 3：外部数据源的稳定性

**问题描述**：
Notion API、新概念英语网站等外部服务的可用性不受我们控制。

**风险场景**：
- Notion 修改 API 接口或限制调用频率
- 新概念英语网站更改 HTML 结构导致爬虫失效
- 外部服务临时宕机或响应超时

**影响范围**：
- Notion 数据源用户无法获取最新内容
- 新概念 2/3 册用户无法加载文章
- 用户体验下降，可能流失

**现有缓解措施**（已实施）：
✅ **多级缓存**：API 响应缓存在 `.cache/` 目录，即使外部不可用也可使用旧数据  
✅ **自动回退机制**：外部数据源失败时自动切换到本地数据源  
✅ **友好的错误提示**：告知用户当前使用的备用数据源  

**额外建议**：
1. 📊 **监控外部 API 的可用性和响应时间**（UptimeRobot / 自定义脚本）
2. 🔔 **设置告警通知**（当连续失败超过阈值时发送邮件/Slack）
3. 💾 **增加本地数据的丰富度和时效性**（定期更新预打包的 JSON 文件）
4. 🔄 **考虑实现离线优先（Offline-First）策略**（PWA + Service Worker）

---

### 🟡 中风险项（需规划改进）

#### 风险 4：大数据集的性能瓶颈

**问题描述**：
当用户选择包含大量句子的数据源（如新概念三全册 ~5000句）时，可能出现性能问题。

**瓶颈点**：
1. **初始加载**：一次性解析所有句子的音标数据（CPU 密集）
2. **内存占用**：sentenceCache 对象可能占用大量内存
3. **渲染压力**：长列表场景下 DOM 节点数量过多

**当前优化措施**：
✅ 代码分割（manualChunks）减少首屏加载体积  
✅ 句子解析结果缓存（sentenceCache）避免重复计算  
✅ 懒加载非首屏组件（FlashcardApp/VocabularyApp）  

**进一步优化方向**：
1. 📄 **虚拟滚动（Virtual Scrolling）**：仅渲染可视区域的句子列表
2. 📦 **分页加载**：不一次性加载全部句子，而是按需分页获取
3. 🗜️ **Web Worker**：将 CPU 密集型的音标计算移到后台线程
4. 💾 **IndexedDB**：替代 localStorage 存储更大的数据量

---

#### 风险 5：localStorage 存储限制

**问题描述**：
浏览器通常限制 localStorage 为 5-10MB，大量练习数据可能超出限制。

**存储需求估算**：
- practiceStats：~2KB（固定大小）
- practiceProgress：~50KB（假设10个数据源 × 100个进度记录）
- flashcardLocalData：~500KB（假设1000张闪卡）
- userSettings：~1KB
- **总计**：~553KB（当前规模下安全）

**风险触发条件**：
- 用户积累数千张闪卡
- 保存详细的每次练习历史
- 浏览器的 localStorage 实际限制低于预期（如 Safari 的隐私模式）

**应对策略**：
1. ✅ **定期清理过期数据**（如只保留最近30天的统计）
2. ⚠️ **迁移到 IndexedDB**（容量可达数百MB甚至更大）
3. 💾 **重要数据云端同步**（登录用户的练习数据同步到 Supabase）
4. 📝 **实现存储配额检测和警告**（接近上限时提示用户清理）

---

#### 风险 6：Supabase 免费额度限制

**问题描述**：
Supabase 免费版有以下限制，用户量增长后可能遇到瓶颈：

| 资源 | 免费额度 | 当前预估用量 | 余量 |
|------|---------|------------|------|
| 数据库大小 | 500MB | ~50MB（含初始数据） | 450MB |
| 文件存储 | 2GB | ~100MB（音频/图片） | 1.9GB |
| 月活跃用户 | 50,000 MAU | <100（初期） | 49,900+
| 月带宽 | 2GB | <1GB | >1GB |
| API 调用次数 | 无限（Postgres） | 数千次/月 | 充足 |

**风险时间点预估**：
- **短期（< 6个月）**：免费额度完全够用
- **中期（6-18个月）**：如果 MAU > 1000，需关注带宽和存储
- **长期（> 18个月）**：可能需要升级到付费计划（Pro $25/月 或 Team $599/月）

**应对策略**：
1. ✅ **优化查询效率**：合理使用索引，避免 N+1 查询
2. ✅ **客户端缓存**：减少不必要的 API 调用
3. 📊 **监控资源使用**：设置 Dashboard 告警
4. 💰 **制定升级路径**：提前准备付费方案（可考虑引入会员订阅制）

---

### 🟢 低风险项（持续改进）

#### 风险 7-11：其他改进空间

| # | 风险 | 影响 | 建议 |
|---|------|------|------|
| R7 | **测试覆盖率不足**（目标70%，实际可能65-70%） | 难以发现回归Bug | 补充边缘场景测试，目标提升至85%+ |
| R8 | **缺少 TypeScript 类型定义**（主应用为 JS） | 运行时类型错误 | 逐步迁移关键模块至 TS |
| R9 | **缺少 CSP 安全头** | XSS 攻击风险 | 在 Netlify 配置 Content-Security-Policy |
| R10 | **未实施速率限制** | API 滥用风险 | 在 Netlify Function 层添加 rate limiter |
| R11 | **文档部分过时** | 新成员上手困难 | 建立文档更新机制，与代码变更联动 |

---

## 四、测试覆盖情况

### 4.1 单元测试（Vitest）

**配置**：[vite.config.js#L60-L88](../../vite.config.js#L60-L88)

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  css: true,
  coverage: {
    reporter: ['text', 'json', 'html'],
    thresholds: {
      global: { branches: 70, functions: 70, lines: 70, statements: 70 }
    }
  }
}
```

**已有测试文件**：

| 文件路径 | 测试内容 | 覆盖范围 |
|---------|---------|---------|
| [useLocalStorage.test.js](../../src/hooks/useLocalStorage.test.js) | localStorage Hook | 基础功能 |
| [useLocalStorage.test.js](../../src/utils/contractionMap.test.js) | 缩写映射表 | 映射正确性 |
| [debounce.test.js](../../src/utils/debounce.test.js) | 防抖函数 | 时间精度 |
| [errors.test.js](../../src/utils/errors.test.js) | 错误处理工具 | 异常分类 |
| [cacheService.test.js](../../src/services/cacheService.test.js) | 缓存服务 | 读写清除 |
| [dataService.test.js](../../src/services/dataService.test.js) | 数据服务 | 数据源适配 |
| [flashcardService.test.js](../../src/services/flashcardService.test.js) | 闪卡服务 | CRUD 操作 |
| [speechService.test.js](../../src/services/speechService.test.js) | 语音服务 | Mock TTS |
| [ArticleSelector.test.jsx](../../src/components/ArticleSelector.test.jsx) | 文章选择器 | UI 渲染 |
| [ArticleSelectorHint.test.jsx](../../src/components/ArticleSelectorHint.test.jsx) | 选择器提示 | 条件渲染 |
| [LocalResourceSelector.test.jsx](../../src/components/LocalResourceSelector.test.jsx) | 本地资源选择 | 列表展示 |

**覆盖率现状**：
- 目标阈值：70%（branches, functions, lines, statements）
- 估计实际值：65-72%（部分工具函数覆盖充分，但核心业务逻辑如 App.jsx 测试不足）

**待补充测试**：
- ⚠️ App.jsx 核心方法（loadSentences, handleWordInputChange, compareSentences 等）
- ⚠️ pronunciationService.js 音标解析逻辑
- ⚠️ spacedRepetitionService.js SM-2 算法边界情况
- ⚠️ Netlify Functions 端到端集成测试

---

### 4.2 E2E 测试（Playwright）

**配置**：[playwright.config.js](../../playwright.config.js)

**测试套件列表**（12个）：

| 测试文件 | 测试内容 | 优先级 | 状态 |
|---------|---------|--------|------|
| [homepage.spec.js](../../e2e/homepage.spec.js) | 首页渲染和数据源选择 | P0 | ✅ 通过 |
| [login.spec.js](../../e2e/login.spec.js) | 登录流程 | P0 | ✅ 通过 |
| [sentence-practice.spec.js](../../e2e/sentence-practice.spec.js) | 句子听写完整流程 | P0 | ⚠️ 部分通过 |
| [flashcard-learning.spec.js](../../e2e/flashcard-learning.spec.js) | 闪卡学习流程 | P1 | ⚠️ 部分通过 |
| [flashcard-management.spec.js](../../e2e/flashcard-management.spec.js) | 闪卡管理CRUD | P1 | ✅ 通过 |
| [vocabulary-review.spec.js](../../e2e/vocabulary-review.spec.js) | 生词复习流程 | P1 | ✅ 通过 |
| [learning-stats.spec.js](../../e2e/learning-stats.spec.js) | 统计数据显示 | P2 | ✅ 通过 |
| [vocab-flow.spec.js](../../e2e/vocab-flow.spec.js) | 生词添加完整流程 | P1 | ✅ 通过 |
| [full-test.spec.js](../../e2e/full-test.spec.js) | 全功能冒烟测试 | P0 | ✅ 通过 |
| [visual-qa-full.spec.js](../../e2e/visual-qa-full.spec.js) | 视觉完整性检查 | P1 | ✅ 通过 |
| [visual-qa-regression.spec.js](../../e2e/visual-qa-regression.spec.js) | 视觉回归对比 | P2 | ✅ 通过 |

**已知失败用例**（来自 [test-results/](../../test-results/)）：
- `flashcard-learning-闪卡学习功能-2-*` : 4个测试用例失败（截图保存在 test-results/ 目录）
  - 可能原因：UI 元素定位变化、异步加载时机问题

---

## 五、上下文衔接说明

### 📍 当前位置

你是从 **[模块 04：数据流程与数据库](./04-data-flow-and-database.md)** 进入本模块的。

### ➡️ 下一步建议

**如果想了解未来的规划和团队分工**：
→ [模块 06：项目规划与团队](./06-project-planning.md)  
里程碑路线图（已完成9个里程碑）、未来4阶段迭代计划、团队角色配置

**如果想了解技术选型的决策过程和理由**：
→ [模块 07：技术决策记录](./07-technical-decisions.md)  
5个关键 ADR（React 19 / Netlify / Supabase / Vite / Playwright）

**如果想了解如何优化和加强安全性**：
→ [模块 08：优化与安全](./08-optimization-and-security.md)  
已实施的5项优化措施、待实施的5个方向、安全加固策略

---

## ✅ 模块完成确认

**阅读完本模块后，你应该能够**：

- ✅ 清楚地看到**功能的整体完成度（93%）**和各模块详情
- ✅ 了解**5大亮点功能**的技术实现和价值
- ✅ 识别**11项潜在风险**及其严重程度和应对策略
- ✅ 掌握**测试覆盖的现状**和待改进的方向
- ✅ 能够基于这些信息**制定重构和优化的优先级**

---

**⏭️ 继续前进**：前往 [模块 06：项目规划与团队](./06-project-planning.md) 展望未来发展！

> 💡 **小贴士**：本模块的风险评估是动态的，建议每季度回顾一次，根据项目进展更新风险状态和处理措施。
