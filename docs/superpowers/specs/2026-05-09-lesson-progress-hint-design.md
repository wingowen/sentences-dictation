# 课程进度提示功能设计

## 概述

在用户选择课程时，显示上次学习进度，用户可选择继续或重新开始。

## 需求

- 每个数据源（new-concept-1/2/3、supabase等）进度独立存储
- 切换数据源后不显示其他数据源的进度
- "继续"：跳转到上次学习的句子
- "重新开始"：从第一句开始学习（保留进度记录）

## 设计

### 数据存储

使用 localStorage，key 格式：`progress_${dataSource}_${lessonId}`

```javascript
// 示例：new-concept-2 的第5课进度
localStorage.setItem('progress_new-concept-2_2-005', JSON.stringify({
  currentIndex: 5,      // 当前学习到第5句
  total: 20,            // 共20句
  lastVisit: '2026-05-09T10:00:00Z'
}));
```

### 组件修改

修改 `LessonSelector.jsx`：
- 新增 `useEffect` 监听课程选择，保存进度
- 新增进度检测逻辑，判断是否有历史进度
- 显示进度提示 UI：显示 "上次学到第X句/共Y句"
- 提供两个按钮："继续" 和 "重新开始"

### 行为

1. 用户选择数据源 → 进入 LessonSelector
2. 用户选择课程 → 检测该课程是否有历史进度
3. **有进度**：显示提示 + 按钮，用户选择后设置 currentIndex
4. **无进度**：正常进入练习

## 实现

1. 修改 `LessonSelector.jsx`：添加进度检测和提示 UI
2. 修改 `AppContext.jsx`：添加进度保存逻辑
3. 测试验证

## 风险

- localStorage 有容量限制（通常 5MB），但存储简单 JSON 足够
- 清除浏览器数据会丢失进度（可接受）