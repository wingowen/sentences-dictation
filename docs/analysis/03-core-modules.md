# 模块 03：核心功能模块详细说明

> **模块标识**：`03-core-modules`  
> **依赖关系**：[02-技术架构设计](./02-technical-architecture.md)（了解技术基础后看功能实现）  
> **相关文件**：[src/App.jsx](../../src/App.jsx)、[src/components/](../../src/components/)、[src/services/](../../src/services/)  
> **阅读时间**：20分钟  
> **最后更新**：2026-04-05

---

## 📌 模块概述

本模块深入剖析项目的**四大核心功能模块**的实现细节，包括：

1. 🎯 **句子听写练习系统**（核心中的核心）
2. 🎴 **闪卡学习系统**（间隔重复算法）
3. 📚 **生词本管理系统**（个性化词汇积累）
4. 👨‍💼 **管理后台系统**（内容管理平台）

每个模块将从**功能定义、用户界面、业务逻辑、数据结构、关键技术点**等维度进行详细说明。

---

## 一、句子听写练习系统（核心功能）

### 1.1 功能定义与目标

#### 产品定位
这是整个项目的**核心功能**和**存在理由**，其他所有功能（闪卡、生词本）都是围绕它展开的扩展。

#### 核心价值主张
> 通过智能化的听写练习体验，帮助用户高效提升英语听力和拼写能力。

#### 功能范围
| 子功能 | 优先级 | 状态 | 说明 |
|--------|--------|------|------|
| 多数据源支持 | P0 | ✅ 完成 | 本地JSON/Notion/新概念1-3/Supabase |
| 语音合成播放 | P0 | ✅ 完成 | Web Speech API + Edge TTS |
| 逐词输入界面 | P0 | ✅ 完成 | 每个单词独立输入框 |
| 实时验证反馈 | P0 | ✅ 完成 | 单词级和句子级双重验证 |
| 音标显示 | P1 | ✅ 完成 | CMU Dictionary 集成 |
| 进度追踪统计 | P1 | ✅ 完成 | localStorage 持久化 |
| 练习模式切换 | P2 | ✅ 完成 | 顺序/随机/听力模式 |
| 设置自定义 | P2 | ✅ 完成 | 语速/自动播放/自动跳转 |

### 1.2 用户界面设计

#### 主界面布局（[PracticeCard.jsx](../../src/components/PracticeCard.jsx)）

```
┌─────────────────────────────────────────────┐
│  Header (顶部导航栏)                         │
│  [← 返回] [📇 闪卡] [📚 生词本] [▼ 数据源]   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │         PracticeCard (练习卡片)        │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  显示区域                        │  │  │
│  │  │  [原文显示开关] [翻译显示开关]    │  │  │
│  │  │  "Hello, how are you?"           │  │  │
│  │  │  "你好，你好吗？"                │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  音标区域 (PhoneticsSection)     │  │  │
│  │  │  /həˈloʊ/ /haʊ/ /ɑːr/ /juː/   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  输入区域 (WordInputs)           │  │  │
│  │  │  [ Hello ] [ how ] [ are ] [you? ]│  │  │
│  │  │  ↑聚焦                            │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  控制区域                        │  │  │
│  │  │  [▶ 播放] [⏭ 下一题] [⚙ 设置]   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  统计区域 (PracticeStats)        │  │  │
│  │  │  第 3 题 / 共 20 题              │  │  │
│  │  │  正确率: 85% | 连续正确: 5       │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ResultModal (结果弹窗 - 触发时显示)          │
│  ┌───────────────────────────────────────┐  │
│  │  ✅ 回答正确！                         │  │
│  │  正确答案: Hello, how are you?        │  │
│  │  用时: 12秒 | 连续正确: 6             │  │
│  │  [继续 →] (3秒后自动跳转)             │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  Footer                                     │
│  Sentence Dictation Practice Tool            │
└─────────────────────────────────────────────┘
```

### 1.3 核心业务逻辑

#### 数据流状态机（位于 [src/App.jsx](../../src/App.jsx)）

```
初始状态 (INITIAL)
    ↓ 用户选择数据源
加载中 (LOADING)
    ↓ 数据加载成功
就绪 (READY)
    ↓↓ 
    ├─→ 练习中 (PRACTICING)
    │      ├─→ 输入中 (INPUTTING)
    │      │    ├─→ 单词正确 → 自动跳下一格
    │      │    └─→ 全部输入 → 验证句子
    │      ├─→ 验证成功 (CORRECT)
    │      │    ├─→ 显示结果弹窗 (SHOW_RESULT)
    │      │    └─→ 3秒后自动下一题 (AUTO_NEXT)
    │      └─→ 验证失败 (INCORRECT)
    │           └─→ 用户可修改重试或手动下一题
    │
    └─→ 错误状态 (ERROR)
          ├─→ 数据源失败 → 自动回退到本地数据源
          └─→ 显示错误提示 → 允许重新选择数据源
```

#### 关键方法详解

**1. 句子加载流程** ([loadSentences()](../../src/App.jsx#L367-L577))

```javascript
const loadSentences = useCallback(async () => {
  // 1. 前置检查
  if (!hasSelectedDataSource) return;  // 未选择数据源则不加载
  if (dataSource === NEW_CONCEPT_3 && !selectedArticleId) return;  // 未选文章
  
  // 2. 根据数据源类型获取数据
  let data;
  switch(dataSource) {
    case NEW_CONCEPT_3:
      // 从本地预打包的 JSON 获取选中文章的句子
      const article = newConcept3Articles.find(a => a.id === selectedArticleId);
      data = article.sentences.map(s => expandContractionsInSentence(s));
      break;
    case LOCAL:
      // 从本地 JSON 文件读取
      data = await getSentencesByLocalResource(localResourceId);
      break;
    case NOTION:
    default:
      // 通过 Netlify Function 获取外部数据
      data = await getSentences(dataSource);
      break;
  }
  
  // 3. 预处理数据
  // 3.1 展开缩写词（I'm → I am）
  data = data.map(s => expandContractionsInSentence(s));
  
  // 3.2 预计算所有句子的音标数据（避免重复计算）
  const cache = {};
  data.forEach((sentence, index) => {
    cache[index] = {
      wordsWithPhonetics: parseSentenceForPhonetics(sentence.text),
      translation: sentence.translation,
    };
  });
  setSentenceCache(cache);  // 存入状态
  
  // 3.3 生成随机顺序（如果启用随机模式）
  randomOrderRef.current = generateRandomOrder(data.length);
  
  // 4. 更新UI状态
  setSentences(data);
  setCurrentIndex(0);  // 重置到第一题
  
  // 5. 恢复上次练习进度（从 localStorage）
  const savedProgress = JSON.parse(localStorage.getItem('practiceProgress'));
  if (savedProgress?.[dataSource]?.lastPracticedIndex >= 0) {
    setCurrentIndex(savedProgress[dataSource].lastPracticedIndex);
  }
}, [dataSource, selectedArticleId, hasSelectedDataSource]);
```

**2. 输入验证逻辑** ([_handleWordInputChange()](../../src/App.jsx#L723-L831))

```javascript
const _handleWordInputChange = (index, value) => {
  // 1. 更新输入状态
  const newWordInputs = [...wordInputs];
  newWordInputs[index] = value;
  setWordInputs(newWordInputs);
  
  // 2. 检查当前单词是否正确
  if (value.trim()) {
    const isCorrect = compareWord(value, currentWords[index].word);
    
    if (isCorrect) {
      // 3. 检查是否所有单词都已填写
      const allFilled = newWordInputs.every(input => input.trim() !== '');
      
      if (allFilled) {
        // 4. 所有单词都填写完毕，检查整体正确性
        const allCorrect = checkAllWordsCorrect(newWordInputs, currentWords);
        
        if (allCorrect) {
          // 5. 更新练习统计
          setPracticeStats(prev => ({
            ...prev,
            totalAttempts: prev.totalAttempts + 1,
            correctAnswers: prev.correctAnswers + 1,
            accuracy: Math.round((prev.correctAnswers + 1) / (prev.totalAttempts + 1) * 100),
            streak: prev.streak + 1,
            longestStreak: Math.max(prev.streak + 1, prev.longestStreak),
          }));
          
          // 6. 更新练习进度
          setPracticeProgress(prev => ({
            ...prev,
            [dataSource]: {
              ...prev[dataSource],
              completedSentences: [...new Set([...prev[dataSource].completedSentences, currentIndex])],
              correctSentences: [...new Set([...prev[dataSource].correctSentences, currentIndex])],
              lastPracticedIndex: currentIndex,
              progressPercentage: Math.round(
                ([...new Set([...prev[dataSource].completedSentences, currentIndex])].length / sentences.length) * 100
              ),
            },
          }));
          
          // 7. 显示成功弹窗
          setResult('correct');
          setShowModal(true);
          
          // 8. 如果启用自动跳转，3秒后进入下一题
          if (autoNext) {
            autoNextTimerRef.current = setTimeout(() => handleCloseModal(), 3000);
          }
        }
      } else {
        // 当前单词正确但未全部填写，自动聚焦下一个输入框
        setTimeout(() => {
          if (inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
          }
        }, 200);
      }
    }
  }
};
```

**3. 智能比对算法** ([normalize()](../../src/App.jsx#L692-L698))

```javascript
// 规范化处理函数：统一比较标准
const normalize = (str) => str
  .toLowerCase()                    // 忽略大小写
  .trim()                          // 去除前后空格
  .replace(/[.,!?;:"'()[]{}_-]/g, '')  // 移除常见标点符号
  .replace(/\s+/g, ' ');              // 合并多余空格为单个空格

// 单词级别比较
const compareWord = (userWord, correctWord) =>
  normalize(userWord) === normalize(correctWord);

// 句子级别比较（按词拼接后再比较）
const compareSentences = (wordInputs, correctSentence) =>
  normalize(wordInputs.join(' ')) === normalize(getExpandedSentence(correctSentence));
```

### 1.4 关键技术点

#### 技术点 1：缩写词智能展开

**问题**：英语中大量使用缩写形式（I'm, don't, can't, it's...），如果标准答案包含缩写而用户输入完整形式（或反之），会导致验证失败。

**解决方案**：基于映射表自动展开缩写词

**实现位置**：
- 映射表：[src/utils/contractionMap.js](../../src/utils/contractionMap.js)
- 检测逻辑：[src/services/pronunciationService.js](../../src/services/pronunciationService.js) 的 `detectAndExpandContractions()` 方法
- 应用时机：数据加载时预处理（[expandContractionsInSentence()](../../src/App.jsx#L41-L61)）

**示例**：
```
原始句子: "I'm fine, and you?"
展开后:   "I am fine, and you?"

用户输入: "I am fine and you?" ✓ 正确
用户输入: "I'm fine, and you?" ✓ 也正确（normalize会忽略标点）
```

#### 技术点 2：多级缓存策略

**目标**：减少重复计算和网络请求，提升用户体验

**缓存层级**：

| 缓存层级 | 存储位置 | 生命周期 | 内容 |
|---------|---------|---------|------|
| L1: 内存缓存 | React State (`sentenceCache`) | 组件存活期 | 句子解析后的音标数据 |
| L2: 浏览器存储 | localStorage | 永久（除非手动清除） | 练习进度、设置偏好 |
| L3: 文件系统 | `.cache/` 目录 | 手动清除或过期 | Netlify Functions API响应 |
| L4: CDN缓存 | Netlify CDN | 按Cache-Control头 | 静态资源（JS/CSS/图片） |

**关键代码**（[src/App.jsx#L477-L494](../../src/App.jsx#L477-L494)）：
```javascript
// 预计算所有句子的音标数据 - 避免切换时重复计算
const cache = {};
data.forEach((sentence, index) => {
  const text = typeof sentence === 'object' ? sentence.text || '' : sentence;
  const translation = typeof sentence === 'object' ? sentence.translation || '' : '';
  const wordsWithPhonetics = parseSentenceForPhonetics(text);
  cache[index] = {
    wordsWithPhonetics,
    translation,
    wordsWithTranslation: wordsWithPhonetics.map(word => ({
      ...word,
      translation: ''
    }))
  };
});
setSentenceCache(cache);  // 存入组件状态
```

#### 技术点 3：音频预加载机制

**问题**：TTS音频生成需要时间（尤其是Edge TTS），用户点击"播放"后可能要等待几百毫秒才能听到声音，影响流畅度。

**解决方案**：在当前句子展示时，后台预加载下一句的音频

**实现位置**：[src/services/speechService.js](../../src/services/speechService.js) 的 `preloadSentence()` 方法

**调用时机**：[src/App.jsx#L1009-L1011](../../src/App.jsx#L1009-L1011)，在 `handleNext()` 中触发

```javascript
// 预加载下一句的音频（优先预生成音频）
if (sentences[nextIndex]) {
  preloadSentence(sentences[nextIndex], speechRate, sentenceIds[nextIndex] || null);
}
```

---

## 二、闪卡学习系统

### 2.1 功能定义

#### 产品定位
基于**间隔重复（Spaced Repetition）** 算法的智能记忆系统，帮助用户长期记忆单词、短语和句子。

#### 核心理论依据
- **艾宾浩斯遗忘曲线**：记忆随时间衰减，需要在特定时间点复习才能巩固
- **SM-2 算法**（SuperMemo-2）：成熟的间隔重复算法，根据用户的掌握程度动态调整复习间隔

#### 功能矩阵

| 子功能 | 优先级 | 状态 | 说明 |
|--------|--------|------|------|
| 闪卡创建/编辑/删除 | P0 | ✅ 完成 | 支持单词/短语/句子类型 |
| 学习模式（Learning） | P0 | ✅ 完成 | 新卡片的初次学习 |
| 复习模式（Review） | P0 | ✅ 完成 | 到期卡片的复习 |
| SM-2 间隔重复算法 | P0 | ✅ 完成 | 动态调整复习间隔 |
| 导入/导出 | P1 | ✅ 完成 | Markdown 格式 |
| 学习统计可视化 | P1 | ⚠️ 85% | 基础图表已完成 |
| 云端同步 | P1 | ✅ 完成 | Supabase 持久化 |

### 2.2 系统架构

```
FlashcardApp (入口组件 - 懒加载)
├── FlashcardLearner (学习/复习引擎)
│   ├── 卡片展示区（正面/反面翻转动画）
│   ├── 评分按钮（0-4分，反映记忆强度）
│   └── 进度指示器（今日待复习/已复习数量）
│
├── FlashcardManager (管理界面)
│   ├── 闪卡列表（表格/卡片视图切换）
│   ├── 搜索/筛选/排序
│   ├── 批量操作（删除/导出）
│   └── 创建/编辑表单
│
└── FlashcardStats (统计面板)
    ├── 今日学习概览
    ├── 历史趋势图
    └── 掌握度分布
```

### 2.3 SM-2 算法实现

**算法核心**（位于 [src/services/spacedRepetitionService.js](../../src/services/spacedRepetitionService.js)）：

```javascript
/**
 * SM-2 算法核心参数
 * @param {Object} card - 闪卡对象
 * @param {number} quality - 用户评分 (0-4)
 *   0 - 完全忘记（重新开始学习）
 *   1 - 记忆模糊（错误回答）
 *   2 - 困难回忆（正确但费力）
 *   3 - 轻松回忆（正确且容易）
 *   4 - 完美回忆（瞬间想起）
 * @returns {Object} 更新后的卡片数据
 */
function calculateNextReview(card, quality) {
  let { easinessFactor, interval, repetition, nextReviewAt } = card;
  
  // 1. 更新易度因子 (EF)
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  // EF 范围限制在 1.3 - 2.5 之间
  easinessFactor = Math.max(1.3, 
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // 2. 如果评分 < 3，重新开始学习
  if (quality < 3) {
    repetition = 0;
    interval = 1;  // 明天再试
  } else {
    // 3. 根据重复次数计算新的间隔
    if (repetition === 0) {
      interval = 1;       // 第一次复习：1天后
    } else if (repetition === 1) {
      interval = 6;       // 第二次复习：6天后
    } else {
      interval = Math.round(interval * easinessFactor);  // 后续：按EF倍增
    }
    repetition++;
  }
  
  // 4. 计算下次复习日期
  nextReviewAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
  
  return { easinessFactor, interval, repetition, nextReviewAt };
}
```

**算法特点**：
- ✅ **自适应性强**：根据每次复习的表现动态调整间隔
- ✅ **科学依据**：基于认知心理学研究
- ✅ **简单高效**：仅需维护少量参数（EF、interval、repetition）
- ⚠️ **冷启动问题**：新卡片需要多次学习才能稳定

### 2.4 数据模型

#### 闪卡数据结构（Supabase `flashcards` 表）

```typescript
interface Flashcard {
  id: string;                    // UUID
  user_id: string;               // 所属用户ID
  front: string;                 // 正面（问题/单词）
  back: string;                  // 反面（答案/释义）
  type: 'word' | 'phrase' | 'sentence';  // 类型
  tags: string[];                // 标签
  metadata: {                    // 扩展信息
    phonetic?: string;           // 音标
    example?: string;            // 例句
    difficulty?: number;         // 难度 (1-5)
  };
  
  // SM-2 算法字段
  easiness_factor: number;       // 易度因子 (默认 2.5)
  interval: number;             // 当前间隔（天）
  repetition: number;           // 重复次数
  next_review_at: Date;         // 下次复习时间
  last_reviewed_at: Date;       // 上次复习时间
  review_count: number;         // 总复习次数
  correct_count: number;        // 正确次数
  
  // 时间戳
  created_at: Date;
  updated_at: Date;
}
```

---

## 三、生词本管理系统

### 3.1 功能定义

#### 产品定位
从听写练习中快速收集生词，建立个人词汇库，并通过科学的复习机制巩固记忆。

#### 与听写系统的关系
```
听写练习 → 遇到生词 → 点击"添加到生词本" → 自动填入单词/音标/例句
                                                    ↓
                                              生词本系统
                                                    ↓
                                            定期复习（间隔重复）
```

#### 功能矩阵

| 子功能 | 优先级 | 状态 | 说明 |
|--------|--------|------|------|
| 一键添加生词 | P0 | ✅ 完成 | 从练习界面快速收集 |
| 生词 CRUD | P0 | ✅ 完成 | 查看/编辑/删除 |
| 复习提醒 | P1 | ✅ 完成 | 基于 next_review_at 字段 |
| 搜索/筛选 | P1 | ✅ 完成 | 按单词/词性/标签筛选 |
| 云端同步 | P1 | ✅ 完成 | 登录用户数据持久化 |
| 导入/导出 | P2 | ⚠️ 待完善 | Anki 兼容格式 |

### 3.2 数据库设计

详见 [模块 04：数据流程与数据库](./04-data-flow-and-database.md) 的 `user_vocabulary` 表设计。

### 3.3 关键交互流程

**添加生词流程**（位于 [src/App.jsx#L1190-L1237](../../src/App.jsx#L1190-L1237)）：

```javascript
const handleAddToVocabulary = useCallback(async (wordData) => {
  // 1. 检查登录状态
  let user = currentUser || JSON.parse(localStorage.getItem('current_user'));
  if (!user) {
    setShowLoginModal(true);  // 未登录则弹出登录框
    return;
  }
  
  try {
    // 2. 调用API添加生词
    const response = await fetch('/api/vocabulary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        word: wordData.word,
        phonetic: wordData.phonetic || '',
        meaning: wordData.translation || '',
        part_of_speech: wordData.partOfSpeech || '',
        sentence_context: sentences[currentIndex]?.text || ''
      })
    });
    
    const data = await response.json();
    
    // 3. 显示结果
    if (data.success) {
      setToast({ show: true, message: `已添加 "${wordData.word}"`, type: 'success' });
    } else {
      setToast({ show: true, message: data.error?.message || '添加失败', type: 'error' });
    }
  } catch (err) {
    console.error('添加生词失败:', err);
    setToast({ show: true, message: '添加失败，请重试', type: 'error' });
  }
}, [currentUser, sentences, currentIndex]);
```

---

## 四、管理后台系统

### 4.1 功能定义

#### 产品定位
面向内容管理员的可视化管理平台，用于管理文章、句子、标签等教学资源，以及查看学习统计数据。

#### 技术独立性
管理后台是一个**完全独立的React应用**（位于 [admin/](../../admin/) 目录），具有自己的：
- 独立的 package.json 和依赖
- TypeScript 类型系统
- Zustand 状态管理
- React Router 路由
- Radix UI + Tailwind CSS 样式体系

**为什么独立？**
1. **用户群体不同**：管理员 vs 普通学习者
2. **技术栈差异**：TypeScript、更复杂的表单和表格操作
3. **迭代节奏不同**：后台更新频率低于主应用
4. **部署可选**：可以单独部署到不同域名或路径

### 4.2 功能模块

| 页面 | 文件路径 | 功能描述 |
|------|---------|---------|
| **Dashboard** | [admin/src/pages/Dashboard.tsx](../../admin/src/pages/Dashboard.tsx) | 数据总览、最近活动、快捷入口 |
| **文章管理** | [admin/src/pages/Articles.tsx](../../admin/src/pages/Articles.tsx) | 文章CRUD、发布/下架、标签关联 |
| **文章编辑器** | [admin/src/pages/ArticleEditor.tsx](../../admin/src/pages/ArticleEditor.tsx) | 富文本编辑、元数据设置、句子排序 |
| **句子管理** | [admin/src/pages/Sentences.tsx](../../admin/src/pages/Sentences.tsx) | 句子CRUD、序号调整、扩展信息编辑 |
| **标签管理** | [admin/src/pages/Tags.tsx](../../admin/src/pages/Tags.tsx) | 标签CRUD、颜色自定义 |
| **统计分析** | [admin/src/pages/Statistics.tsx](../../admin/src/pages/Statistics.tsx) | 学习数据图表、用户活跃度、内容使用情况 |
| **设置** | [admin/src/pages/Settings.tsx](../../admin/src/pages/Settings.tsx) | 系统配置、数据导入/导出 |
| **登录** | [admin/src/pages/Login.tsx](../../admin/src/pages/Login.tsx) | 管理员认证 |

### 4.3 技术架构亮点

#### UI 组件库：Radix UI

**为什么选择 Radix UI？**
- ✅ **无障碍优先（Accessibility First）**：符合 WCAG 标准
- ✅ **非受控模式**：更灵活的状态控制
- ✅ **无样式基础**：完全自定义外观（配合 Tailwind CSS）
- ✅ **完整的组件集**：Dialog、Dropdown、Select、Tabs、Toast 等

示例组件使用（来自 [admin/src/components/ui/dialog.tsx](../../admin/src/components/ui/dialog.tsx)）：
```tsx
import * as Dialog from "@radix-ui/react-dialog";

export function Dialog({ children, ...props }) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="...">
          {children}
          <Dialog.Close className="...">
            <XIcon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

#### 状态管理：Zustand

**为什么选择 Zustand 而非 Redux？**
- ✅ **极简API**：只需一个 `create()` 函数
- ✅ **TypeScript友好**：完善的类型推断
- ✅ **性能优秀**：细粒度订阅，避免不必要的重渲染
- ✅ **轻量级**：gzip 后仅 ~1KB

示例 Store（来自 [admin/src/stores/auth.ts](../../admin/src/stores/auth.ts)）：
```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  
  login: async (email, password) => {
    const response = await fetch('/api-admin/auth', { /* ... */ });
    const { user, token } = await response.json();
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('auth_token', token);
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('auth_token');
  },
}));
```

---

## 五、上下文衔接说明

### 📍 当前位置

你是从 **总览索引** 或 **[模块 02：技术架构设计](./02-technical-architecture.md)** 进入本模块的。

### ➡️ 下一步建议

**如果想了解数据是怎么流转和存储的**：
→ [模块 04：数据流程与数据库](./04-data-flow-and-database.md)  
详细的用户操作流程图、数据流架构、完整的数据库Schema、RLS安全策略

**如果想了解项目目前的完成情况和风险**：
→ [模块 05：实现情况与风险评估](./05-implementation-status.md)  
功能完成度矩阵（93%）、亮点功能汇总、风险等级分析

**如果想了解为什么要这样设计和实现这些功能**：
→ [模块 07：技术决策记录](./07-technical-decisions.md)  
重要技术选型的决策过程和权衡考量

---

## ✅ 模块完成确认

**阅读完本模块后，你应该能够**：

- ✅ 清楚地描述**四大核心功能模块**各自的定位和价值
- ✅ 理解**句子听写系统**的完整业务流程（从数据加载到验证反馈）
- ✅ 掌握**SM-2间隔重复算法**的核心原理和实现方式
- ✅ 了解**生词本系统**如何与听写练习无缝集成
- ✅ 认识**管理后台**的技术独立性和架构特点
- ✅ 能够定位到具体的功能实现代码位置

---

**⏭️ 继续前进**：前往 [模块 04：数据流程与数据库](./04-data-flow-and-database.md) 探索数据的生命周期！

> 💡 **小贴士**：建议结合 IDE 打开对应的源码文件，边阅读本模块边查看实际代码，理解会更深刻。
