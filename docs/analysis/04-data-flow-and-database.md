# 模块 04：数据流程与数据库设计

> **模块标识**：`04-data-flow-and-database`  
> **依赖关系**：[03-核心功能模块](./03-core-modules.md)（理解功能后看数据如何支撑）  
> **相关文件**：[supabase/schema.sql](../../supabase/schema.sql)、[src/App.jsx](../../src/App.jsx)  
> **阅读时间**：15分钟  
> **最后更新**：2026-04-05

---

## 📌 模块概述

本模块详细说明数据的**完整生命周期**——从用户操作触发、经过前端状态管理、通过API层传输、最终持久化到数据库的全过程。同时提供完整的**数据库Schema设计**、**表结构详解**和**安全策略（RLS）**。

### 🎯 本模块将回答的关键问题：

1. ❓ 用户的一个操作会引发怎样的数据流转？
2. ❓ 数据在各个层次是如何被处理和转换的？
3. ❓ 数据库有哪些表？每个表存什么？字段含义是什么？
4. ❓ 如何保证数据安全？（RLS行级策略）
5. ❓ 数据之间是如何关联的？

---

## 一、用户操作到数据持久化的完整流程

### 1.1 场景一：句子听写练习的数据流

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户操作层 (User Actions)                      │
│                                                                     │
│  ① 用户点击"本地数据" → 选择"简单句练习"                             │
│     ↓                                                                │
│ ② 系统加载 sentences.json 文件中的句子数据                            │
│     ↓                                                                │
│ ③ 显示第1题："Hello, how are you?"                                  │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     前端状态管理层 (State Management)                  │
│                                                                     │
│  ④ React State 更新:                                                │
│     - sentences: ["Hello, how are you?", "I am learning...", ...]   │
│     - currentIndex: 0                                               │
│     - sentenceCache: {                                               │
│         0: {                                                         │
│           wordsWithPhonetics: [                                      │
│             { word: "Hello", phonetic: "/həˈloʊ/" },                │
│             { word: "how", phonetic: "/haʊ/" },                     │
│             { word: "are", phonetic: "/ɑːr/" },                    │
│             { word: "you", phonetic: "/juː/" },                     │
│           ],                                                        │
│           translation: "你好，你好吗？"                              │
│         }                                                           │
│       }                                                             │
│     - currentWords: [Hello, how, are, you?]                         │
│     - wordInputs: ["", "", "", ""]  ← 初始为空                       │
│                                                                     │
│  ⑤ useEffect 触发:                                                   │
│     - 解析当前句子的音标                                             │
│     - 初始化输入框引用数组                                            │
│     - 聚焦第一个输入框                                               │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        用户交互层 (User Interaction)                   │
│                                                                     │
│  ⑥ 用户点击"播放"按钮                                               │
│     ↓                                                                │
│  ⑦ 调用 speak("Hello, how are you?", 1.0)                           │
│     └→ Web Speech API 朗读该句子                                     │
│                                                                     │
│  ⑧ 用户在第1个输入框输入 "Hello"                                    │
│     ↓                                                                │
│  ⑨ _handleWordInputChange(0, "Hello") 被调用                        │
│     ├→ compareWord("Hello", "Hello") → true ✓                       │
│     ├→ 自动聚焦第2个输入框 (延迟200ms)                               │
│     └→ 更新 wordInputs: ["Hello", "", "", ""]                       │
│                                                                     │
│  ⑩ 用户依次输入 "how", "are", "you?"                                │
│     ↓                                                                │
│  ⑪ 所有单词填写完毕且全部正确                                        │
│     ├→ 更新 practiceStats:                                           │
│     │   { totalAttempts: 1, correctAnswers: 1, accuracy: 100% }      │
│     ├→ 更新 practiceProgress:                                        │
│     │   { local: { completedSentences: [0], lastPracticedIndex: 0 }} │
│     ├→ setResult('correct'), setShowModal(true)                      │
│     └→ 显示成功弹窗                                                  │
│                                                                     │
│  ⑫ 3秒后自动调用 handleNext()                                       │
│     ├→ 取消当前语音播放                                              │
│     ├→ 预加载下一句音频 preloadSentence(sentences[1])                 │
│     ├→ setCurrentIndex(1) → 切换到第2题                               │
│     └→ 触发 useEffect 重新解析第2题                                   │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    持久化层 (Persistence Layer)                       │
│                                                                     │
│  ⑬ 练习过程中实时保存到 localStorage:                                 │
│     - key: "practiceStats"                                          │
│       value: { totalAttempts, correctAnswers, accuracy, ... }        │
│                                                                     │
│     - key: "practiceProgress"                                       │
│       value: {                                                      │
│           local: { completedSentences: [0, 1], ... },               │
│           notion: { ... },                                          │
│           "new-concept-3": { ... }                                  │
│         }                                                          │
│                                                                     │
│  ⑭ 页面关闭/刷新时 (beforeunload 事件):                              │
│     → 最后一次保存 practiceStats 和 practiceProgress 到 localStorage │
│                                                                     │
│  ⑮ 下次访问时 (组件初始化 useEffect):                                │
│     → 从 localStorage 恢复 practiceStats 和 practiceProgress          │
│     → 如果有保存的进度，恢复到最后练习的位置                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 场景二：添加生词到生词本的数据流

```
用户操作                    前端 (React)              Netlify Function          Supabase DB
   │                            │                         │                      │
   ├─ 点击单词旁的"+生词"图标    │                         │                      │
   │                            │                         │                      │
   ├─ 触发 handleAddToVocabulary │                         │                      │
   │  ({ word: "example",        │                         │                      │
   │    phonetic: "/ɪɡˈzæmpl/", │                         │                      │
   │    translation: "例子" })   │                         │                      │
   │                            │                         │                      │
   ├─ 检查登录状态               │                         │                      │
   │  ├ currentUser 存在?        │                         │                      │
   │  └ 是 → 继续                │                         │                      │
   │                            │                         │                      │
   ├─ 构建请求体                 │                         │                      │
   │  POST /api/vocabulary       │                         │                      │
   │  Headers:                   │                         │                      │
   │    Authorization: Bearer xxx│                         │                      │
   │    Content-Type: json       │                         │                      │
   │  Body:                     │                         │                      │
   │  {                         │                         │                      │
   │    word: "example",        │                         │                      │
   │    phonetic: "/ɪɡˈzæmpl/",│                         │                      │
   │    meaning: "例子",        │                         │                      │
   │    part_of_speech: "noun", │                         │                      │
   │    sentence_context: ...   │                         │                      │
   │  }                         │                         │                      │
   │                            ├─ HTTP请求 ──────────────→│                      │
   │                            │                         │                      │
   │                            │                         ├─ 接收请求            │
   │                            │                         │                      │
   │                            │                         ├─ 验证 JWT Token      │
   │                            │                         │  (auth.js 中间件)    │
   │                            │                         │                      │
   │                            │                         ├─ 提取 user_id        │
   │                            │                         │  (从 Token payload)  │
   │                            │                         │                      │
   │                            │                         ├─ 检查唯一约束        │
   │                            │                         │  (同一用户不能重复    │
   │                            │                         │   添加相同单词)       │
   │                            │                         │                      │
   │                            │                         ├─ 执行 INSERT         │
   │                            │                         │  INSERT INTO          │
   │                            │                         │  user_vocabulary (    │
   │                            │                         │    user_id, word,     │
   │                            │                         │    phonetic, meaning, │
   │                            │                         │    part_of_speech,    │
   │                            │                         │    sentence_context,  │
   │                            │                         │    review_count=0,    │
   │                            │                         │    is_learned=false   │
   │                            │                         │  )                   │
   │                            │                         │                      │
   │                            │                         ├─ RLS 策略验证        │
   │                            │                         │  (确保 user_id 匹配)   │
   │                            │                         │                      │
   │                            │                         ├─ 返回成功响应        │
   │                            │                         │  { success: true,     │
   │                            │                         │    data: { id, ... } }│
   │                            │                         │                      │
   │                            ←── 响应返回 ────────────│                      │
   │                            │                         │                      │
   ├─ 处理响应                   │                         │                      │
   │  ├ data.success === true    │                         │                      │
   │  └→ 显示 Toast: "已添加 example"                       │                      │
   │                            │                         │                      │
   │  ✅ 流程结束                 │                         │                      │
```

---

## 二、数据库 Schema 完整设计

基于 [supabase/schema.sql](../../supabase/schema.sql)，以下是完整的数据库结构。

### 2.1 ER 图（实体关系图）

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   articles   │       │   sentences  │       │     tags     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ PK id        │──┐    │ PK id        │       │ PK id        │
│    title     │  │    │ FK article_id│──┐    │    name (UNIQUE)
│ description │  │    │    content    │  │    │    color      │
│ source_url  │  │    │ sequence_order│  │    └──────┬───────┘
│ source_type │  │    │ extensions   │  │           │
│ metadata    │  │    │ is_active    │  │           │
│ is_published│  │    └──────┬───────┘  │           │
│ created_by  │  │           │          │           │
│ created_at  │  │           │          │           │
│ updated_at  │  │           │          │           │
└──────┬───────┘  │           │          │           │
       │          │           │          │           │
       │          │           │          │           │
       │    ┌─────▼───────────▼──────────▼───────────▼───┐
       │    │            article_tags (关联表)            │
       │    ├───────────────────────────────────────────┤
       │    │ PK/FK article_id  (→ articles.id)         │
       │    │ PK/FK tag_id       (→ tags.id)            │
       │    └───────────────────────────────────────────┘
       │                                                   
       │    ┌──────────────────────────────────────────────┐
       │    │            user_vocabulary (生词本)            │
       │    ├──────────────────────────────────────────────┤
       │    │ PK id                                       │
       │    │    user_id (FK → auth.users, 逻辑外键)       │
       │    │    word                                      │
       │    │    phonetic                                  │
       │    │    meaning                                   │
       │    │    part_of_speech                            │
       │    │    sentence_context                          │
       │    │    source_sentence_id (→ sentences.id)       │
       │    │    source_article_id (→ articles.id)         │
       │    │    notes                                     │
       │    │    review_count                              │
       │    │    next_review_at                            │
       │    │    is_learned                                │
       │    │    created_at / updated_at                   │
       │    └──────────────────────────────────────────────┘
       │                                                   
       │    ┌──────────────────────────────────────────────┐
       │    │          sentence_audios (可选)              │
       │    ├──────────────────────────────────────────────┤
       │    │ PK id                                       │
       │    │    sentence_id (FK → sentences.id)           │
       │    │    audio_url                                 │
       │    │    speaker / speed / duration_ms             │
       │    │    created_at                                │
       │    └──────────────────────────────────────────────┘
```

### 2.2 表结构详解

#### 表 1：articles（文章/课程表）

```sql
CREATE TABLE articles (
    -- 主键：自增BIGINT
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    
    -- 基本信息
    title VARCHAR(255) NOT NULL,              -- 文章标题（如"简单句练习"、"新概念英语第一册"）
    description TEXT,                         -- 描述文字
    source_url VARCHAR(500),                  -- 原始来源URL
    
    -- 来源类型枚举
    source_type VARCHAR(50) DEFAULT 'local',  -- 'local' | 'notion' | 'new-concept' | 'custom'
    
    -- 封面和元数据
    cover_image VARCHAR(500),                 -- 封面图片URL
    total_sentences INT DEFAULT 0,            -- 句子总数（由触发器自动维护）
    metadata JSONB DEFAULT '{}'::jsonb,      -- 扩展JSON字段：
                                             --   { difficulty: 1-5, category: 'xxx', tags: [] }
    
    -- 发布控制
    is_published BOOLEAN DEFAULT TRUE,       -- 是否已发布（未发布的文章对普通用户不可见）
    
    -- 审计字段
    created_by VARCHAR(100) DEFAULT 'system',-- 创建者（system 或 user_id）
    created_at TIMESTAMPTZ DEFAULT NOW(),   -- 创建时间
    updated_at TIMESTAMPTZ DEFAULT NOW()     -- 最后更新时间（由触发器自动更新）
);

-- 索引优化查询性能
CREATE INDEX idx_articles_source_type ON articles(source_type);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
```

**使用示例**：
| id | title | source_type | is_published | total_sentences |
|----|-------|-------------|--------------|-----------------|
| 1 | 简单句练习 | local | true | 20 |
| 2 | 新概念英语第一册 | new-concept | true | 144 |
| 3 | 日常对话 | custom | true | 50 |

---

#### 表 2：sentences（句子表）

```sql
CREATE TABLE sentences (
    -- 主键
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    
    -- 关联文章
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    
    -- 句子内容
    content TEXT NOT NULL,                    -- 原始文本（如 "Hello, how are you?"）
    sequence_order INT NOT NULL,               -- 在文章中的序号（从1开始）
    
    -- 扩展信息（JSONB，避免频繁修改表结构）
    extensions JSONB DEFAULT '{}'::jsonb,     -- 详细结构见下方说明
    
    -- 状态管理
    is_active BOOLEAN DEFAULT TRUE,           -- 是否启用（软删除）
    
    -- 审计字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_sentences_article_id ON sentences(article_id);
CREATE INDEX idx_sentences_sequence_order ON sentences(article_id, sequence_order);
CREATE INDEX idx_sentences_is_active ON sentences(is_active);
CREATE INDEX idx_sentences_content ON sentences USING gin(to_tsvector('english', content));

-- 唯一约束：同一文章内序号唯一
CREATE UNIQUE INDEX idx_sentences_article_order_unique 
    ON sentences(article_id, sequence_order) WHERE is_active = TRUE;
```

**extensions JSONB 字段完整结构**：

```json
{
  "phonetic": "/həˈloʊ haʊ ɑːr juː/",
  "phonetic_uk": "/həˈləʊ haʊ ɑː juː/",
  "phonetic_us": "/həˈloʊ haʊ ɑːr juː/",
  
  "translation": "你好，你好吗？",
  "translation_en": "Hello, how are you?",
  
  "audio_url": "https://storage.example.com/audio/sentence_1.mp3",
  "audio_speed": 1.0,
  
  "analysis": {
    "grammar_point": "主谓宾结构 + 疑问词",
    "structure": "Hello (问候语) + how (疑问副词) + are (系动词) + you (代词)",
    "notes": [
      "how 用于询问状态或方式",
      "are 与 you 连用表示第二人称"
    ]
  },
  
  "vocabulary": [
    {
      "word": "hello",
      "phonetic": "/həˈloʊ/",
      "meaning": "你好（问候语）",
      "pos": "interj.",
      "examples": ["Hello, how are you?", "Hello, world!"]
    },
    {
      "word": "how",
      "phonetic": "/haʊ/",
      "meaning": "怎样；如何",
      "pos": "adv.",
      "examples": ["How are you?", "How do you do?"]
    }
  ],
  
  "tags": ["问候语", "日常用语", "疑问句"],
  "difficulty": 1,
  
  "notes": "这是最基础的英语问候句型",
  "memorization_tip": "可以联想打电话时的开场白",
  
  "related_sentences": [2, 5, 10],
  
  "statistics": {
    "practice_count": 150,
    "correct_count": 120,
    "last_practiced_at": "2026-04-05T10:30:00Z"
  }
}
```

**为什么使用 JSONB 而不是独立表？**

| 方案 | 优点 | 缺点 |
|------|------|------|
| **JSONB（当前选择）** | ✅ 灵活、无需迁移Schema、减少JOIN | ⚠️ 无法直接索引内部字段、数据一致性靠应用层保证 |
| **规范化表（多表）** | ✅ 强一致性、可索引、符合范式 | ⚠️ 需要大量JOIN、Schema变更成本高 |

**权衡决策**：对于教育内容这种**读多写少、结构灵活多变**的场景，JSONB是更实用的选择。

---

#### 表 3 & 4：tags 和 article_tags（标签系统）

```sql
-- 标签定义表
CREATE TABLE tags (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,       -- 标签名称（唯一）
    color VARCHAR(20) DEFAULT '#3B82F6',     -- 显示颜色（十六进制）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文章-标签多对多关联表
CREATE TABLE article_tags (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)          -- 联合主键，防止重复关联
);
```

**预置标签数据**（来自 schema.sql 初始化脚本）：

| id | name | color | 用途 |
|----|------|-------|------|
| 1 | 简单句 | #10B981 | 基础句型 |
| 2 | 复合句 | #F59E0B | 复杂句型 |
| 3 | 日常用语 | #3B82F6 | 生活场景 |
| 4 | 商务英语 | #6366F1 | 职场场景 |
| 5 | 新概念 | #EC4899 | 教材分类 |

---

#### 表 5：user_vocabulary（用户生词本）

```sql
CREATE TABLE user_vocabulary (
    -- 主键
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    
    -- 用户归属
    user_id VARCHAR(100) NOT NULL,            -- 用户ID（来自 Supabase Auth）
    
    -- 单词信息
    word VARCHAR(255) NOT NULL,               -- 单词（如 "example"）
    phonetic VARCHAR(255),                    -- 音标（如 "/ɪɡˈzæmpl/"）
    meaning TEXT,                             -- 含义/翻译（如 "例子；范例"）
    part_of_speech VARCHAR(50),               -- 词性（noun/verb/adj/adv 等）
    
    -- 上下文信息
    sentence_context TEXT,                    -- 例句（从听写练习中自动提取）
    source_sentence_id BIGINT,                -- 来源句子ID（关联 sentences 表）
    source_article_id BIGINT,                 -- 来源文章ID（关联 articles 表）
    
    -- 用户自定义
    notes TEXT,                              -- 个人笔记（如 "注意这个词有多个含义"）
    
    -- 复习系统字段
    review_count INT DEFAULT 0,              -- 已复习次数
    next_review_at TIMESTAMPTZ,              -- 下次复习时间（NULL 表示不需要复习）
    is_learned BOOLEAN DEFAULT FALSE,        -- 是否已掌握
    
    -- 审计字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一约束：同一用户不能重复添加相同单词
    CONSTRAINT uk_user_word UNIQUE (user_id, LOWER(word))
);

-- 索引优化常用查询
CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_word ON user_vocabulary(word);
CREATE INDEX idx_user_vocabulary_next_review ON user_vocabulary(next_review_at) 
    WHERE next_review_at IS NOT NULL;  -- 部分索引，只索引需要复习的记录
CREATE INDEX idx_user_vocabulary_created_at ON user_vocabulary(created_at DESC);
```

**数据示例**：

| id | user_id | word | phonetic | meaning | part_of_speech | review_count | next_review_at | is_learned |
|----|---------|------|----------|---------|---------------|--------------|---------------|------------|
| 1 | abc123 | example | /ɪɡˈzæmpl/ | 例子 | noun | 3 | 2026-04-08 | false |
| 2 | abc123 | beautiful | /ˈbjuːtɪfl/ | 美丽的 | adj | 7 | 2026-04-15 | false |
| 3 | def456 | hello | /həˈloʊ/ | 你好 | interj | 15 | NULL | true |

---

#### 表 6：sentence_audios（句子音频表 - 可选）

```sql
CREATE TABLE sentence_audios (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    sentence_id BIGINT NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
    audio_url VARCHAR(500) NOT NULL,           -- 音频文件URL（支持外部CDN或Supabase Storage）
    speaker VARCHAR(100),                     -- 朗读人标识（如 "Microsoft Zira"）
    speed DECIMAL(3,2) DEFAULT 1.00,          -- 录制速度（1.0 = 正常速度）
    duration_ms INT,                         -- 音频时长（毫秒）
    file_size BIGINT,                         // 文件大小（字节）
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sentence_audios_sentence_id ON sentence_audios(sentence_id);
```

**使用场景**：
- 预生成高质量TTS音频并缓存，避免每次请求都实时生成
- 支持多种语音和语速变体
- 减少Edge TTS API调用次数和延迟

---

## 三、RLS（Row Level Security）策略详解

### 3.1 什么是 RLS？

**RLS（Row-Level Security，行级安全策略）** 是 PostgreSQL 的特性，允许在**数据库层面**控制用户只能访问特定的数据行，而无需在应用层编写复杂的权限检查逻辑。

**类比**：
- 传统方式：应用层检查 `if (currentUser.id === row.user_id)` 
- RLS方式：数据库自动过滤 `WHERE auth.uid() = user_id`

### 3.2 本项目的 RLS 策略配置

#### 启用 RLS

```sql
-- 对需要保护的表启用 RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentence_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
```

#### 策略 1：公开读取（Public Read）

适用于**文章、句子、标签**等内容数据：

```sql
-- 任何人都可以读取已发布的文章
CREATE POLICY "Public can read articles" ON articles
    FOR SELECT USING (is_published = TRUE);

-- 任何人都可以读取启用的句子
CREATE POLICY "Public can read sentences" ON sentences
    FOR SELECT USING (is_active = TRUE);

-- 任何人都可以读取标签（用于筛选功能）
CREATE POLICY "Public can read tags" ON tags
    FOR SELECT USING (true);  -- 无限制

-- 关联表也开放读取
CREATE POLICY "Public can read article_tags" ON article_tags
    FOR SELECT USING (true);

CREATE POLICY "Public can read sentence_audios" ON sentence_audios
    FOR SELECT USING (true);
```

**效果**：
- ✅ 未登录用户也能浏览已发布的内容
- ✅ 登录用户同样可见
- ❌ 未发布的文章对普通用户不可见

#### 策略 2：管理员完全控制（Admin Full Access）

适用于**所有表**的写操作：

```sql
-- 只有认证用户才能写入/修改/删除
CREATE POLICY "Admin can manage articles" ON articles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage sentences" ON sentences
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can manage tags" ON tags
    FOR ALL USING (auth.role() = 'authenticated');

-- 其他表类似...
```

**⚠️ 注意**：当前策略较为宽松（所有认证用户都能管理），生产环境应细化为**角色-based**（admin/editor/viewer）。

#### 策略 3：用户私有数据（User-Specific Data）

专门用于**生词本**表：

```sql
-- 用户只能查看和管理自己的生词
CREATE POLICY "Users can manage own vocabulary" ON user_vocabulary
    FOR ALL USING (auth.role() = 'authenticated');
    -- 注意：实际应在应用层确保 user_id 匹配，
    -- 或者使用更严格的策略：
    -- USING (user_id = auth.uid())
```

**安全性保障链**：

```
用户请求 → Netlify Function
              ↓
         验证 JWT Token → 提取 user_id
              ↓
         构造 SQL 查询时强制添加 WHERE user_id = '<extracted_user_id>'
              ↓
         Supabase 执行查询时 RLS 策略二次验证
              ↓
         返回结果（确保只有该用户的数据）
```

### 3.3 触发器与自动化

#### 自动更新时间戳

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到所有包含 updated_at 字段的表
CREATE TRIGGER trigger_articles_updated_at
    BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_sentences_updated_at
    BEFORE UPDATE ON sentences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_vocabulary_updated_at
    BEFORE UPDATE ON user_vocabulary FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**效果**：任何 UPDATE 操作都会自动将 `updated_at` 设置为当前时间，无需应用层手动维护。

#### 自动维护文章的句子总数

```sql
CREATE OR REPLACE FUNCTION update_article_sentence_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- 删除句子时，对应文章的总数减1
        UPDATE articles SET total_sentences = total_sentences - 1 
        WHERE id = OLD.article_id;
        RETURN OLD;
    ELSE
        -- 插入或更新句子时，重新统计该文章的活跃句子数
        UPDATE articles SET total_sentences = (
            SELECT COUNT(*) FROM sentences 
            WHERE article_id = NEW.article_id AND is_active = TRUE
        )
        WHERE id = NEW.article_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sentence_count
    AFTER INSERT OR UPDATE OR DELETE ON sentences
    FOR EACH ROW EXECUTE FUNCTION update_article_sentence_count();
```

**效果**：当句子发生增删改时，`articles.total_sentences` 字段会自动保持准确，无需手动同步。

---

## 四、数据完整性约束总结

| 约束类型 | 应用位置 | 具体规则 | 目的 |
|---------|---------|---------|------|
| **主键 (PK)** | 所有表 | `id BIGINT PRIMARY KEY` | 唯一标识每条记录 |
| **外键 (FK)** | sentences, article_tags, user_vocabulary, sentence_audios | `REFERENCES parent_table(id) ON DELETE CASCADE` | 保证引用完整性，级联删除 |
| **唯一约束 (UNIQUE)** | tags.name, user_vocabulary.(user_id, word), sentences.(article_id, sequence_order) | 防止重复数据 |
| **非空约束 (NOT NULL)** | 必填字段 | 保证关键字段不为空 |
| **默认值 (DEFAULT)** | is_published, is_active, review_count, etc. | 为新记录提供合理初始值 |
| **检查约束 (CHECK)** | （可扩展） | 自定义业务规则验证 |
| **RLS 策略** | 所有表 | 行级访问控制 |
| **触发器** | articles, sentences, user_vocabulary | 自动化维护派生字段 |

---

## 五、上下文衔接说明

### 📍 当前位置

你是从 **[模块 03：核心功能模块](./03-core-modules.md)** 进入本模块的。

### ➡️ 下一步建议

**如果想了解项目的完成情况和潜在风险**：
→ [模块 05：实现情况与风险评估](./05-implementation-status.md)  
功能完成度矩阵（93%）、亮点功能、风险等级分析

**如果想了解未来的规划方向和团队分工**：
→ [模块 06：项目规划与团队](./06-project-planning.md)  
里程碑路线图、Phase 1-4 迭代计划、角色配置

**如果想了解技术选型的决策过程**：
→ [模块 07：技术决策记录](./07-technical-decisions.md)  
5个关键 ADR 文档（React 19 / Netlify / Supabase / Vite / Playwright）

---

## ✅ 模块完成确认

**阅读完本模块后，你应该能够**：

- ✅ 清楚地画出**用户操作到数据持久化的完整数据流**
- ✅ 理解**6张数据库表**的结构、字段含义和关联关系
- ✅ 掌握 **JSONB 字段的扩展性设计思路**
- ✅ 了解 **RLS 行级安全策略**如何保护数据
- ✅ 认识**触发器自动化机制**的价值
- ✅ 能够根据业务需求**设计新的表或字段**

---

**⏭️ 继续前进**：前往 [模块 05：实现情况与风险评估](./05-implementation-status.md) 评估项目现状！

> 💡 **小贴士**：建议结合 [supabase/schema.sql](../../supabase/schema.sql) 源码一起阅读，可以看到完整的 SQL 创建语句和初始化数据。
