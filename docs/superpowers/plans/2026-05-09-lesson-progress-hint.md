# 课程进度提示功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户选择课程时，显示上次学习进度（"上次学到第X句/共Y句"），用户可选择继续或重新开始。

**Architecture:** 使用 localStorage 独立存储每个数据源+课程的进度。在 LessonSelector 选择课程时检测进度，在 AppContext 中保存进度。

**Tech Stack:** React Hooks, localStorage

---

### Task 1: 分析现有代码结构

**Files:**
- Read: `src/hooks/usePracticeProgress.js`
- Read: `src/contexts/AppContext.jsx:140-160`

- [ ] **Step 1: 读取 usePracticeProgress.js 了解现有进度逻辑**

```bash
cat src/hooks/usePracticeProgress.js
```

- [ ] **Step 2: 读取 AppContext 中相关代码**

查找 currentIndex 的使用方式和进度相关的逻辑

---

### Task 2: 在 AppContext 中添加进度保存和获取逻辑

**Files:**
- Modify: `src/contexts/AppContext.jsx`

- [ ] **Step 1: 添加进度存储工具函数**

在 AppContext.jsx 文件顶部添加：

```javascript
// 进度存储工具函数
const getProgressKey = (dataSource, lessonId) => `progress_${dataSource}_${lessonId}`;

const getStoredProgress = (dataSource, lessonId) => {
  try {
    const key = getProgressKey(dataSource, lessonId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('读取进度失败:', e);
    return null;
  }
};

const saveProgress = (dataSource, lessonId, currentIndex, total) => {
  try {
    const key = getProgressKey(dataSource, lessonId);
    localStorage.setItem(key, JSON.stringify({
      currentIndex,
      total,
      lastVisit: new Date().toISOString()
    }));
  } catch (e) {
    console.error('保存进度失败:', e);
  }
};
```

- [ ] **Step 2: 修改 safeSetCurrentIndex 回调，保存进度**

在 AppContext.jsx 的 safeSetCurrentIndex 函数（约第315行）中，添加进度保存逻辑：

```javascript
const safeSetCurrentIndex = useCallback((newIndex) => {
  // ... 原有逻辑 ...

  // 保存进度到 localStorage
  if (selectedLesson && processedSentences) {
    const index = typeof newIndex === 'function' ? newIndex(currentIndex) : newIndex;
    if (index >= 0 && index < processedSentences.length) {
      saveProgress(dataSource, selectedLesson.lesson_id, index, processedSentences.length);
    }
  }
}, [processedSentences, rawArticles, selectedLesson, currentIndex, dataSource]);
```

- [ ] **Step 3: 导出获取进度函数供 LessonSelector 使用**

在 AppContext 的 value 对象中添加：

```javascript
// 进度相关
getStoredProgress,
```

---

### Task 3: 修改 LessonSelector 显示进度提示

**Files:**
- Modify: `src/components/LessonSelector.jsx`

- [ ] **Step 1: 添加状态和 useApp 获取进度函数**

在 LessonSelector.jsx 中：

```javascript
const LessonSelector = ({ onBack }) => {
  const {
    selectedLesson,
    setSelectedLesson,
    setShowLessonSelector,
    dataSource,
    rawArticles,
    sentencesLoading,
    getStoredProgress,  // 新增
    setCurrentIndex      // 新增
  } = useApp() || {};

  const [showProgressHint, setShowProgressHint] = React.useState(false);
  const [progressInfo, setProgressInfo] = React.useState(null);
```

- [ ] **Step 2: 修改 handleSelectLesson 函数，检测进度**

```javascript
const handleSelectLesson = (lesson) => {
  console.log('[LessonSelector] Selecting lesson:', lesson);
  
  // 检测是否有历史进度
  const progress = getStoredProgress ? getStoredProgress(dataSource, lesson.lesson_id) : null;
  
  if (progress && progress.currentIndex > 0) {
    // 有进度，显示提示让用户选择
    setProgressInfo(progress);
    setShowProgressHint(true);
  } else {
    // 无进度，直接设置课程
    if (setSelectedLesson) setSelectedLesson(lesson);
    if (setShowLessonSelector) setShowLessonSelector(false);
  }
};
```

- [ ] **Step 3: 添加继续和重新开始的处理函数**

```javascript
const handleContinue = () => {
  if (setSelectedLesson && progressInfo && setCurrentIndex) {
    setSelectedLesson(progressInfo);  // 设置课程时同时设置进度
    setCurrentIndex(progressInfo.currentIndex);  // 跳转到上次的句子
  }
  if (setShowLessonSelector) setShowLessonSelector(false);
};

const handleRestart = () => {
  if (setSelectedLesson && progressInfo) {
    // 设置课程，但 currentIndex 默认为 0（从头开始）
    setSelectedLesson({ ...progressInfo });
  }
  if (setShowLessonSelector) setShowLessonSelector(false);
};
```

- [ ] **Step 4: 添加进度提示 UI**

在 return 语句中，渲染进度提示（显示在课程列表上方）：

```javascript
return (
  <div className="lesson-selector">
    {/* 进度提示 */}
    {showProgressHint && progressInfo && (
      <div className="progress-hint" style={{
        padding: '12px',
        margin: '12px 0',
        background: '#e8f4fd',
        borderRadius: '8px',
        border: '1px solid #b3d7f5'
      }}>
        <p style={{ margin: '0 0 12px 0', color: '#333' }}>
          上次学到第 {progressInfo.currentIndex + 1} 句/共 {progressInfo.total} 句
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleContinue}
            style={{
              padding: '8px 16px',
              background: '#00247D',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            继续
          </button>
          <button
            onClick={handleRestart}
            style={{
              padding: '8px 16px',
              background: '#fff',
              color: '#00247D',
              border: '1px solid #00247D',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重新开始
          </button>
        </div>
      </div>
    )}

    {/* 原有课程列表 */}
    ...
  </div>
);
```

- [ ] **Step 5: 验证代码无语法错误**

```bash
npm run build 2>&1 | head -20
```

---

### Task 4: 测试验证

**Files:**
- Test: 手动测试

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 测试场景**

1. 选择 "新概念英语第二册"
2. 选择一篇文章，进入练习
3. 做到第5句左右
4. 返回首页
5. 再次选择 "新概念英语第二册"
6. 验证：是否显示 "上次学到第6句/共X句"
7. 点击 "继续" → 验证跳转到第6句
8. 返回，重新选择同一篇文章
9. 点击 "重新开始" → 验证从第1句开始

- [ ] **Step 3: 测试不同数据源隔离**

1. 在新概念二学习到第5句
2. 切换到新概念三
3. 验证：新概念三不显示新概念二的进度

---

### Task 5: 提交代码

- [ ] **Step 1: 提交更改**

```bash
git add src/contexts/AppContext.jsx src/components/LessonSelector.jsx
git commit -m "feat: 添加课程进度提示功能，显示上次学习进度"
```

- [ ] **Step 2: 推送并创建 PR**

```bash
git push origin feature/lesson-progress-hint
gh pr create --title "feat: 添加课程进度提示功能"
```