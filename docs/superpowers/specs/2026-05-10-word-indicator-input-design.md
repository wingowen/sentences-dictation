# WordIndicator 输入显示优化设计

**日期**: 2026-05-10
**状态**: 已批准

## 问题描述

当前 SentenceInput 组件（整行输入模式）中，用户输入任意字符时，下方的 WordIndicator 会立即显示完整的单词答案（如 "Pardon?"），而非用户正在输入的内容。

这让练习失去了意义——用户可以直接看到答案，而不需要自己回忆和拼写。

## 期望行为

1. **输入中**：显示用户输入的内容（如 "P"），而非完整答案
2. **完成后（按空格）**：显示完整单词 + 颜色变化，无 ✓ 符号

## 修改范围

### 1. WordIndicator.jsx

**文件**: `src/components/WordIndicator.jsx`

**修改点**:
- 第 24 行：`displayWord` 逻辑改为：完成时显示 `word`，输入中显示 `input`
- 去掉第 51 行的 `✓` 符号
- 确保颜色 class（`.correct`）正常应用

**新逻辑**:
```javascript
const displayWord = shouldDisplay ? (isCorrect ? word : (input || '\u00A0')) : '\u00A0';
```

### 2. SentenceInput.jsx

**文件**: `src/components/SentenceInput.jsx`

**修改点**:
- 确认 `isVisible` 逻辑正确（当前实现已正确，只显示当前和已完成的单词）
- 不需要修改 visibility 逻辑，因为已完成单词的 `isCorrect` 会是 true

### 3. CSS（如需要）

**文件**: `src/App.css` 或相关样式文件

检查 `.correct` class 是否已定义背景色或样式，确保颜色变化可见。

## 实现步骤

1. 修改 `WordIndicator.jsx`：
   - 调整 `displayWord` 计算逻辑
   - 移除 ✓ 符号显示

2. 验证：确保输入时显示用户内容，完成后显示完整单词

3. 测试：手动测试输入流程，确认行为符合预期

## 验收标准

- [ ] 输入字母时，WordIndicator 显示用户输入的内容
- [ ] 按空格完成后，WordIndicator 显示完整单词
- [ ] 完成时有颜色变化（无 ✓ 符号）
- [ ] 其他 WordIndicator 使用场景不受影响