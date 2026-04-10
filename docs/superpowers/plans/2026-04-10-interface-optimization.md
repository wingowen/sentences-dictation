# 界面设计优化执行计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化界面设计，提升用户体验和代码可维护性

**Architecture:** 采用模块化设计，逐步优化CSS管理、响应式设计、可访问性、性能和交互体验

**Tech Stack:** React, CSS, JavaScript

---

## 第一阶段：CSS管理优化

### 任务1: 模块化CSS文件

**文件：**
- 创建：`/workspace/src/styles/` 目录
- 创建：`/workspace/src/styles/layout.css`
- 创建：`/workspace/src/styles/components.css`
- 创建：`/workspace/src/styles/theme.css`
- 修改：`/workspace/src/App.css`

- [ ] **步骤1: 创建styles目录结构**

```bash
mkdir -p /workspace/src/styles
```

- [ ] **步骤2: 提取主题相关样式到theme.css**

```css
/* theme.css */
:root {
  /* === Core Colors (oklch modern) === */
  --apple-blue: oklch(0.65 0.2 250);
  --apple-blue-dark: oklch(0.55 0.2 250);
  --apple-blue-light: oklch(0.75 0.15 250);
  --apple-purple: oklch(0.6 0.2 300);
  --apple-pink: oklch(0.65 0.25 10);
  --apple-red: oklch(0.65 0.25 25);
  --apple-orange: oklch(0.75 0.18 70);
  --apple-yellow: oklch(0.85 0.15 95);
  --apple-green: oklch(0.7 0.2 145);
  --apple-teal: oklch(0.75 0.15 200);
  --apple-indigo: oklch(0.55 0.2 280);

  /* Semantic Colors */
  --primary-color: oklch(0.65 0.2 250);
  --primary-hover: oklch(0.55 0.2 250);
  --primary-gradient: linear-gradient(135deg, oklch(0.65 0.2 250) 0%, oklch(0.55 0.2 280) 100%);
  --primary-gradient-hover: linear-gradient(135deg, oklch(0.55 0.2 250) 0%, oklch(0.45 0.2 280) 100%);
  --secondary-color: oklch(0.75 0.18 70);
  --secondary-hover: oklch(0.65 0.18 70);
  --success-color: oklch(0.7 0.2 145);
  --success-bg: oklch(0.7 0.2 145 / 0.1);
  --danger-color: oklch(0.65 0.25 25);
  --danger-hover: oklch(0.55 0.25 25);
  --danger-bg: oklch(0.65 0.25 25 / 0.1);
  --warning-color: oklch(0.85 0.15 95);
  --warning-bg: oklch(0.85 0.15 95 / 0.1);
  --info-color: oklch(0.75 0.15 200);
  --info-bg: oklch(0.75 0.15 200 / 0.1);

  /* Gray Scale (oklch) */
  --gray-50: oklch(0.97 0 0);
  --gray-100: oklch(0.93 0 0);
  --gray-200: oklch(0.88 0 0);
  --gray-300: oklch(0.82 0 0);
  --gray-400: oklch(0.7 0 0);
  --gray-500: oklch(0.55 0 0);
  --gray-600: oklch(0.45 0 0);
  --gray-700: oklch(0.35 0 0);
  --gray-800: oklch(0.28 0 0);
  --gray-900: oklch(0.22 0 0);
  --gray-950: oklch(0.15 0 0);

  /* Extended Colors */
  --light-color: oklch(0.97 0 0);
  --light-border: oklch(0.93 0 0);
  --dark-color: oklch(0.15 0 0);
  --text-color: oklch(0.15 0 0);
  --text-muted: oklch(0.55 0 0);
  --bg-color: oklch(0.97 0 0);
  --white: oklch(1 0 0);

  /* === Glassmorphism (enhanced) === */
  --glass-bg: oklch(1 0 0 / 0.7);
  --glass-bg-dark: oklch(1 0 0 / 0.9);
  --glass-border: oklch(1 0 0 / 0.5);
  --glass-blur: blur(20px);
  --glass-shadow: 0 8px 32px oklch(0 0 0 / 0.08);
  --glass-overlay: oklch(0 0 0 / 0.3);

  /* === Typography (SuperDesign: Inter, Outfit, DM Sans) === */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* Type Scale */
  --text-large-title: 2.125rem;
  --text-title-1: 1.75rem;
  --text-title-2: 1.375rem;
  --text-title-3: 1.25rem;
  --text-headline: 1.0625rem;
  --text-body: 1.0625rem;
  --text-callout: 1rem;
  --text-subhead: 0.9375rem;
  --text-footnote: 0.8125rem;
  --text-caption-1: 0.75rem;
  --text-caption-2: 0.6875rem;

  /* Font Weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  /* Letter Spacing */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: -0.015em;
  --letter-spacing-wide: 0;

  /* === Spacing (SuperDesign: 4px base) === */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 2.5rem;
  --spacing-3xl: 3rem;

  /* === Border Radius (SuperDesign: 0.5-1rem) === */
  --radius-xs: 0.375rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --radius-3xl: 2rem;
  --radius-full: 9999px;

  /* Preserve compatibility */
  --border-radius-sm: 0.5rem;
  --border-radius-md: 0.75rem;
  --border-radius-lg: 1rem;
  --border-radius-xl: 9999px;

  /* === Shadows (SuperDesign: subtle, 1-2 layers) === */
  --shadow-xs: 0 1px 2px oklch(0 0 0 / 0.04);
  --shadow-sm: 0 2px 4px oklch(0 0 0 / 0.06);
  --shadow-md: 0 4px 8px oklch(0 0 0 / 0.08);
  --shadow-lg: 0 8px 16px oklch(0 0 0 / 0.1);
  --shadow-xl: 0 12px 24px oklch(0 0 0 / 0.12);
  --shadow-2xl: 0 16px 32px oklch(0 0 0 / 0.14);

  /* Colored Shadows */
  --shadow-blue: 0 4px 20px oklch(0.65 0.2 250 / 0.25);
  --shadow-green: 0 4px 20px oklch(0.7 0.2 145 / 0.25);
  --shadow-red: 0 4px 20px oklch(0.65 0.25 25 / 0.25);
  --shadow-orange: 0 4px 20px oklch(0.75 0.18 70 / 0.25);
  --shadow-purple: 0 4px 20px oklch(0.6 0.2 300 / 0.25);

  /* === Easing Functions (SuperDesign: 150-400ms) === */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-spring-gentle: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* === Transitions === */
  --transition-instant: 0.15s var(--ease-out);
  --transition-fast: 0.2s var(--ease-out);
  --transition-normal: 0.3s var(--ease-out-expo);
  --transition-slow: 0.4s var(--ease-out-expo);
  --transition-spring: 0.4s var(--ease-spring);

  /* Preserve compatibility */
  --transition-fast: 0.2s var(--ease-out);
  --transition-normal: 0.3s var(--ease-out-expo);

  /* === Gradients === */
  --gradient-primary: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  --gradient-secondary: linear-gradient(135deg, #FF9500 0%, #FFCC00 100%);
  --gradient-success: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  --gradient-danger: linear-gradient(135deg, #FF3B30 0%, #FF453A 100%);
  --gradient-subtle: linear-gradient(180deg, #ffffff 0%, #F2F2F7 100%);
  --gradient-card: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
  --gradient-surface: linear-gradient(180deg, #ffffff 0%, #FAFAFC 100%);

  /* === Z-index Layers === */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-overlay: 1000;
  --z-modal-content: 1010;
  --z-popover: 1100;
  --z-tooltip: 1200;

  /* === Responsive Breakpoints === */
  --breakpoint-xs: 480px;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-2xl: 1400px;
}

/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  line-height: var(--line-height-normal);
  color: var(--text-color);
  background-color: var(--bg-color);
  letter-spacing: var(--letter-spacing-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  min-height: 100vh;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Selection styling */
::selection {
  background-color: var(--apple-blue);
  color: var(--white);
}

::-moz-selection {
  background-color: var(--apple-blue);
  color: var(--white);
}
```

- [ ] **步骤3: 提取布局相关样式到layout.css**

```css
/* layout.css */
/* App Container */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: var(--gradient-surface);
  box-shadow: none;
  position: relative;
  z-index: 1;
}

/* Data Source Selection Page */
.data-source-selection-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--gradient-subtle);
  padding: var(--spacing-xl) var(--spacing-md);
  position: relative;
}

/* Main Content */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 0;
}

/* 当数据源下拉框打开时，防止内容遮挡下拉框 */
.app-main.with-dropdown-open {
  padding-top: var(--spacing-xl);
}

/* App Layout */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content-area {
  flex: 1;
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.app-content-area.app-content-loading {
  opacity: 0.7;
  pointer-events: none;
}

.view-enter {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **步骤4: 提取组件相关样式到components.css**

```css
/* components.css */
/* Auth Button */
.auth-floating-btn {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 100;
}

.auth-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.2);
  border-color: var(--apple-blue);
}

.auth-btn.logged-in {
  border-color: rgba(52, 199, 89, 0.5);
}

.auth-btn.logged-in:hover {
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.2);
  border-color: var(--apple-green);
}

.auth-btn-icon {
  font-size: 18px;
}

.auth-btn-text {
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--text-color);
}

.auth-btn.logged-in .auth-btn-text {
  color: var(--apple-green);
}

/* Selection Container */
.selection-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.selection-container h1 {
  font-size: var(--text-title-1);
  font-weight: var(--font-semibold);
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  letter-spacing: var(--letter-spacing-tight);
}

.selection-container > p {
  font-size: var(--text-body);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

/* Data Source Cards */
.data-source-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

.data-source-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-spring);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.data-source-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.data-source-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-blue);
  border-color: var(--apple-blue);
}

.data-source-card:hover::before {
  opacity: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.card-content h3 {
  font-size: var(--text-headline);
  font-weight: var(--font-semibold);
  color: var(--text-color);
  margin: 0;
  letter-spacing: var(--letter-spacing-tight);
}

.card-content p {
  font-size: var(--text-subhead);
  color: var(--text-muted);
  margin: 0;
  line-height: var(--line-height-normal);
}

/* Header */
.app-header {
  text-align: center;
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-md);
}

.header-left {
  flex-shrink: 0;
  align-self: center;
}

.back-button {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--apple-blue);
  background-color: var(--white);
  border: 1.5px solid var(--apple-blue);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-spring);
}

.back-button:hover {
  background-color: var(--apple-blue);
  color: var(--white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-blue);
}

.app-header h1 {
  font-size: var(--text-title-2);
  font-weight: var(--font-semibold);
  color: var(--text-color);
  margin: 0;
  letter-spacing: var(--letter-spacing-tight);
}

/* Data Source Controls */
.data-source-controls {
  position: relative;
  display: inline-block;
  z-index: var(--z-popover);
}

.data-source-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--apple-blue);
  background-color: var(--white);
  border: 1.5px solid var(--apple-blue);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-spring);
}

.data-source-button:hover {
  background: var(--gradient-primary);
  color: var(--white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-blue);
  border-color: transparent;
}

.dropdown-arrow {
  font-size: 0.8rem;
  margin-left: 0.3rem;
}

.data-source-selector {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--spacing-sm);
  background: var(--glass-bg-dark);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  z-index: 9999;
  min-width: 280px;
  animation: slideDown var(--transition-spring);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.data-source-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  text-align: left;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.data-source-option:last-child {
  border-bottom: none;
}

.data-source-option:hover {
  background-color: var(--gray-50);
}

.data-source-option.active {
  background-color: rgba(0, 122, 255, 0.08);
  color: var(--apple-blue);
}

.data-source-option.active .source-name {
  color: var(--apple-blue);
}

.source-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  opacity: 0.9;
}

.source-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.source-name {
  font-weight: var(--font-semibold);
  color: var(--text-color);
  font-size: var(--text-callout);
}

.source-description {
  font-size: var(--text-caption-1);
  color: var(--text-muted);
}

.check-mark {
  color: var(--success-color);
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
}

/* Progress Bar */
.progress {
  text-align: center;
  font-size: var(--text-body);
  color: var(--gray-500);
  margin-bottom: var(--spacing-sm);
}

.progress.small {
  text-align: left;
  font-size: var(--text-caption-1);
  color: var(--gray-400);
  margin-bottom: 0.8rem;
  font-weight: var(--font-medium);
}

/* Sentence Section */
.sentence-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gradient-card);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}

/* Input Form */
.input-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gradient-card);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}

.input-with-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: var(--text-headline);
  font-weight: var(--font-semibold);
  color: var(--text-color);
}

.input-controls {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

/* 统一按钮样式 - 简约风格 */
.btn {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: auto;
  box-shadow: var(--shadow-xs);
}

.btn:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  background: var(--gray-100);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 主要按钮 */
.btn-primary {
  color: var(--white);
  background: var(--apple-blue);
  border-color: var(--apple-blue);
}

.btn-primary:hover:not(:disabled) {
  background: var(--apple-blue-dark);
  border-color: var(--apple-blue-dark);
}

/* 成功按钮 */
.btn-success {
  color: var(--white);
  background: var(--apple-green);
  border-color: var(--apple-green);
}

.btn-success:hover:not(:disabled) {
  background: #2DB14C;
  border-color: #2DB14C;
}

/* Play Button */
.play-button {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--text-headline);
  font-weight: var(--font-semibold);
  color: var(--white);
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-spring);
  min-width: 200px;
  box-shadow: var(--shadow-blue);
  letter-spacing: var(--letter-spacing-normal);
}

.play-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
}

.play-button:active:not(:disabled) {
  transform: translateY(-1px) scale(0.98);
}

.play-button:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.play-button.small {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--white);
  background: var(--apple-blue);
  border: 1px solid var(--apple-blue);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: auto;
  box-shadow: var(--shadow-xs);
}

.play-button.small:hover:not(:disabled) {
  background: var(--apple-blue-dark);
  border-color: var(--apple-blue-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.play-button.small:active:not(:disabled) {
  transform: translateY(0);
}

.play-button.small:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
  box-shadow: var(--shadow-blue);
}

/* Auto Play Toggle */
.auto-play-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  font-size: var(--text-body);
  color: var(--text-color);
}

.auto-play-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--apple-blue);
  border-radius: 4px;
}

.auto-play-toggle:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-play-toggle.small {
  font-size: var(--text-subhead);
}

.auto-play-toggle.small input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* Random Mode Toggle */
.random-mode-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  font-size: var(--text-body);
  color: var(--text-color);
}

.random-mode-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--apple-blue);
  border-radius: 4px;
}

.random-mode-toggle.small {
  font-size: var(--text-subhead);
}

.random-mode-toggle.small input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* Listen Mode Toggle */
.listen-mode-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  font-size: var(--text-body);
  color: var(--text-color);
}

.listen-mode-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--apple-blue);
  border-radius: 4px;
}

.listen-mode-toggle.small {
  font-size: var(--text-subhead);
}

.listen-mode-toggle.small input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.listen-mode-toggle:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Auto Next Toggle */
.auto-next-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  font-size: var(--text-body);
  color: var(--text-color);
}

.auto-next-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--apple-blue);
  border-radius: 4px;
}

.auto-next-toggle.small {
  font-size: var(--text-subhead);
}

.auto-next-toggle.small input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* Speech Rate Selector */
.speech-rate-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-subhead);
  color: var(--text-color);
}

.speech-rate-selector.small {
  font-size: var(--text-caption-1);
}

.speech-rate-selector span {
  white-space: nowrap;
}

.speech-rate-selector select {
  padding: 0.4rem 0.6rem;
  font-size: var(--text-caption-1);
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-sm);
  background-color: var(--white);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 110px;
}

.speech-rate-selector select:hover:not(:disabled) {
  border-color: var(--apple-blue);
}

.speech-rate-selector select:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.speech-rate-selector select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Textarea */
.input-form textarea {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--text-body);
  line-height: var(--line-height-normal);
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-lg);
  resize: vertical;
  min-height: 120px;
  font-family: var(--font-family);
  transition: all var(--transition-fast);
  background-color: var(--white);
}

.input-form textarea:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* Result */
.result {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid transparent;
}

.result.correct {
  background-color: var(--success-bg);
  color: #155724;
  border-color: rgba(52, 199, 89, 0.3);
}

.result.incorrect {
  background-color: var(--danger-bg);
  color: #721c24;
  border-color: rgba(255, 59, 48, 0.3);
}

.result h2 {
  font-size: var(--text-title-3);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-md);
  letter-spacing: var(--letter-spacing-tight);
}

.correct-sentence {
  font-size: var(--text-body);
  font-style: italic;
}

/* Loading and Error States */
.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: var(--text-headline);
  text-align: center;
  padding: var(--spacing-xl);
}

.loading {
  color: var(--apple-blue);
  font-weight: var(--font-medium);
}

.error {
  color: var(--apple-red);
  background-color: var(--danger-bg);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 59, 48, 0.2);
}

/* Phonetics Section */
.phonetics-section {
  padding: var(--spacing-md);
  background: var(--gradient-card);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}

.toggle-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: nowrap;
}

/* Practice Card */
.practice-card {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 48px var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.practice-card-header {
  margin-bottom: var(--spacing-xl);
}

.practice-card-content {
  margin-bottom: var(--spacing-xl);
  min-height: auto;
}

.practice-card-content:empty {
  display: none;
}

/* Practice Card Controls - 所有按钮放一排 */
.practice-card-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.toggle-text-button {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  align-self: center;
  box-shadow: var(--shadow-xs);
}

.toggle-text-button:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.toggle-text-button:active {
  transform: translateY(0);
  background: var(--gray-100);
}

.toggle-text-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}

.phonetics-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
  flex-direction: column;
  align-items: flex-start;
}

.original-text-display {
  width: 100%;
  padding: var(--spacing-lg);
  background: rgba(0, 122, 255, 0.08);
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.original-text-label {
  font-size: var(--text-callout);
  font-weight: var(--font-semibold);
  color: var(--apple-blue);
  margin-right: var(--spacing-sm);
}

.original-text-content {
  font-size: var(--text-headline);
  font-weight: var(--font-semibold);
  color: var(--text-color);
  line-height: var(--line-height-relaxed);
}

.sentence-translation {
  width: 100%;
  padding: var(--spacing-lg);
  background: rgba(52, 199, 89, 0.08);
  border: 2px solid rgba(52, 199, 89, 0.3);
  border-radius: var(--radius-lg);
  margin: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.translation-label {
  font-size: var(--text-callout);
  font-weight: var(--font-semibold);
  color: var(--apple-green);
}

.translation-text {
  font-size: var(--text-headline);
  line-height: var(--line-height-relaxed);
  color: var(--text-color);
  font-weight: var(--font-medium);
}

.phonetic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  min-width: 80px;
  padding: 0.5rem;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.phonetic-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--apple-blue);
}

.phonetic-item .word {
  font-size: var(--text-body);
  font-weight: var(--font-semibold);
  color: var(--text-color);
}

.phonetic-item .phonetic {
  font-size: var(--text-caption-1);
  color: var(--text-muted);
  font-style: italic;
  font-family: var(--font-family-mono);
}

.phonetic-item .phonetic.missing {
  color: var(--gray-400);
  font-style: normal;
}

/* Word Inputs */
.word-inputs-form {
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
}

.word-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  justify-content: center;
  margin: 0;
}

.word-input-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.word-input-container {
  display: flex;
  align-items: stretch;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--white);
  transition: all var(--transition-fast);
}

.word-input-container:focus-within {
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.word-input {
  flex: 0 0 auto;
  min-width: 6ch;
  max-width: 35ch;
  padding: 0.5rem 0.8rem;
  font-size: var(--text-body);
  border: none;
  border-radius: 0;
  text-align: center;
  transition: all var(--transition-fast);
  box-sizing: border-box;
  background-color: transparent;
  letter-spacing: var(--letter-spacing-normal);
  font-family: var(--font-family-mono);
}

.word-input:focus {
  outline: none;
  background-color: transparent;
}

.word-input::placeholder {
  color: var(--gray-300);
  font-style: italic;
  letter-spacing: 0.3em;
}

.word-input.word-correct {
  border-bottom-color: var(--apple-green);
  color: #155724;
  font-weight: var(--font-medium);
  background-color: rgba(52, 199, 89, 0.05);
}

.word-input.word-correct:focus {
  box-shadow: none;
}

.word-input-counter {
  font-size: var(--text-caption-2);
  color: var(--gray-400);
  font-family: var(--font-family-mono);
  letter-spacing: 0.05em;
  font-weight: var(--font-medium);
}

.word-input-wrapper:hover .word-input-counter {
  color: var(--gray-500);
}

.word-input.word-correct + .word-input-counter {
  color: var(--apple-green);
}

/* 单词发音按钮 */
.word-pronounce-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.6rem;
  background: var(--gray-50);
  border: none;
  border-left: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--gray-600);
}

.word-pronounce-button:hover:not(:disabled) {
  background: var(--apple-blue);
  color: var(--white);
}

.word-pronounce-button:active:not(:disabled) {
  background: var(--apple-blue-dark);
  transform: scale(0.98);
}

.word-pronounce-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: var(--gray-50);
}

.word-pronounce-button svg {
  width: 16px;
  height: 16px;
}

/* 提示按钮样式 */
.hint-button-wrapper {
  margin-left: var(--spacing-xs);
  display: inline-flex;
  align-items: center;
  position: relative;
}

.hint-button {
  padding: 0.3rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-size: 1rem;
  line-height: 1;
  color: var(--gray-500);
}

.hint-button:hover {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--apple-blue);
  transform: scale(1.1);
}

/* 加入生词本按钮样式 */
.add-vocab-button {
  padding: 0.25rem 0.5rem;
  margin-left: var(--spacing-xs);
  border: 1px solid var(--apple-blue);
  background: transparent;
  color: var(--apple-blue);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-size: 0.75rem;
  white-space: nowrap;
}

.add-vocab-button:hover {
  background-color: var(--apple-blue);
  color: white;
}

.add-vocab-button.disabled {
  border-color: var(--gray-300);
  color: var(--gray-400);
  cursor: not-allowed;
  opacity: 0.6;
}

.add-vocab-button.disabled:hover {
  background-color: transparent;
  color: var(--gray-400);
}

/* 小气泡提示样式 */
.hint-tooltip {
  position: absolute;
  z-index: var(--z-tooltip);
  min-width: max-content;
  max-width: 12rem;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-caption-1);
  color: var(--white);
  background-color: var(--gray-900);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  animation: fadeInUp 0.2s ease-out forwards;
}

.hint-tooltip::before {
  content: '';
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--gray-900);
  transform: rotate(45deg);
}

.hint-tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-0.5rem);
}

.hint-tooltip.top::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%) rotate(45deg);
}

.hint-tooltip.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(0.5rem);
}

.hint-tooltip.bottom::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(50%) rotate(45deg);
}

.hint-tooltip.left {
  right: 100%;
  top: 50%;
  transform: translateX(-0.5rem) translateY(-50%);
}

.hint-tooltip.left::before {
  left: 100%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) rotate(45deg);
}

.hint-tooltip.right {
  left: 100%;
  top: 50%;
  transform: translateX(0.5rem) translateY(-50%);
}

.hint-tooltip.right::before {
  right: 100%;
  top: 50%;
  transform: translateX(50%) translateY(-50%) rotate(45deg);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Show Counter Toggle */
.show-counter-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  font-size: var(--text-body);
  color: var(--text-color);
}

.show-counter-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--apple-blue);
  border-radius: 4px;
}

.show-counter-toggle.small {
  font-size: var(--text-subhead);
}

.show-counter-toggle.small input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* Next Sentence Button */
.next-sentence-button {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: auto;
  box-shadow: var(--shadow-xs);
}

.next-sentence-button:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.next-sentence-button:active:not(:disabled) {
  transform: translateY(0);
  background: var(--gray-100);
}

.next-sentence-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.next-sentence-button.small {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
}

/* 设置按钮 */
.settings-button {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: auto;
  box-shadow: var(--shadow-xs);
}

.settings-button:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.settings-button:active:not(:disabled) {
  transform: translateY(0);
  background: var(--gray-100);
}

.settings-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.settings-button.small {
  padding: 0.5rem 1rem;
  font-size: var(--text-subhead);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--glass-overlay);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn var(--transition-spring);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--glass-bg-dark);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-2xl);
  animation: slideUp var(--transition-spring);
}

@keyframes slideUp {
  from {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.modal-result {
  text-align: center;
}

.modal-result.correct {
  color: #155724;
}

.modal-result.incorrect {
  color: #721c24;
}

.modal-result h2 {
  font-size: var(--text-title-1);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  letter-spacing: var(--letter-spacing-tight);
}

.modal-result .correct-sentence {
  font-size: var(--text-body);
  font-style: italic;
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.modal-result .auto-next-hint {
  font-size: var(--text-subhead);
  color: var(--gray-500);
  margin-bottom: 1.5rem;
  font-style: italic;
}

.modal-close-button {
  padding: 0.8rem 2rem;
  font-size: var(--text-body);
  font-weight: var(--font-semibold);
  color: var(--white);
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-spring);
  min-width: 120px;
  box-shadow: var(--shadow-blue);
}

.modal-close-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
}

.modal-close-button:active {
  transform: translateY(-1px) scale(0.98);
}

/* Settings Modal Styles */
.settings-modal-content {
  max-width: 600px;
  position: relative;
}

.settings-modal-content h2 {
  font-size: var(--text-title-2);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-lg);
  letter-spacing: var(--letter-spacing-tight);
}

.settings-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--gray-100);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all 0.2s;
}

.settings-close-btn:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

.settings-close-btn svg {
  width: 16px;
  height: 16px;
}

/* Login Modal Styles */
.login-modal-content {
  max-width: 400px;
  text-align: center;
}

.login-modal-content h2 {
  font-size: var(--text-title-2);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  color: var(--gray-600);
  margin-bottom: var(--spacing-lg);
}

.login-modal-content .form-group {
  margin-bottom: var(--spacing-md);
  text-align: left;
}

.login-modal-content label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-medium);
}

.login-modal-content input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 60px;
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
}

.login-modal-content input:focus {
  border-color: var(--apple-blue);
  outline: none;
}

.login-button {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--gradient-primary);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-weight: var(--font-medium);
  cursor: pointer;
  margin-top: var(--spacing-md);
}

.login-button:hover {
  background: var(--primary-gradient-hover);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  color: var(--gray-500);
  font-size: var(--text-caption);
  margin-top: var(--spacing-md);
}

.auth-mode-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
  color: var(--gray-600);
  font-size: var(--text-caption);
}

.link-button {
  background: none;
  border: none;
  color: var(--apple-blue);
  cursor: pointer;
  font-size: var(--text-caption);
  text-decoration: underline;
  padding: 0;
}

.link-button:hover {
  opacity: 0.8;
}

.success-message {
  color: var(--apple-green);
  background-color: rgba(52, 199, 89, 0.1);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-sm);
  font-size: var(--text-caption);
}

.login-modal-content .close-button {
  margin-top: var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--gray-600);
  cursor: pointer;
}

.login-modal-content .close-button:hover {
  color: var(--apple-blue);
}

/* Auth Modal (Login/Register) Styles */
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal-overlay);
  animation: fadeIn 0.2s ease-out;
}

.auth-modal-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  position: relative;
}

.auth-close-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  font-size: 24px;
  line-height: 1;
  transition: all 0.2s;
}

.auth-close-btn:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

.auth-header {
  text-align: left;
  margin-bottom: 28px;
}

.auth-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--gray-900);
}

.auth-subtitle {
  color: var(--gray-500);
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}

.auth-form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  font-size: 15px;
  background: white;
  transition: all 0.2s;
  height: 44px;
  box-sizing: border-box;
}

.auth-form-group input:focus {
  border-color: var(--apple-blue);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.auth-form-group input::placeholder {
  color: var(--gray-400);
}

.auth-message {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.auth-error {
  background: rgba(255, 59, 48, 0.08);
  color: #dc2626;
}

.auth-success {
  background: rgba(52, 199, 89, 0.08);
  color: #16a34a;
}

.auth-submit-btn {
  width: 100%;
  padding: 12px 20px;
  background: var(--apple-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: 4px;
}

.auth-submit-btn:hover:not(:disabled) {
  background: #0066d4;
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.auth-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  color: var(--gray-500);
  font-size: 14px;
}

.auth-switch-btn {
  background: none;
  border: none;
  color: var(--apple-blue);
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  padding: 0;
}

.auth-switch-btn:hover {
  text-decoration: underline;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Tab Navigation */
.settings-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--gray-200);
  padding-bottom: var(--spacing-sm);
}

.settings-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-body);
  font-weight: var(--font-medium);
  color: var(--gray-500);
  background-color: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.settings-tab:hover {
  color: var(--apple-blue);
  background-color: rgba(0, 122, 255, 0.05);
}

.settings-tab.active {
  color: var(--apple-blue);
  background-color: rgba(0, 122, 255, 0.1);
  font-weight: var(--font-semibold);
}

.settings-tab.active::after {
  content: '';
  position: absolute;
  bottom: calc(-1 * var(--spacing-sm) - 2px);
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--apple-blue);
  border-radius: var(--radius-full);
}

.tab-label {
  font-size: var(--text-callout);
}

/* Tab Content */
.settings-tab-content {
  max-height: 400px;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
}

.settings-panel {
  animation: fadeInUp var(--transition-spring);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--gradient-card);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.settings-section h3 {
  font-size: var(--text-headline);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-md);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-color);
}

.settings-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.settings-option:hover {
  background-color: var(--gray-50);
  border-color: var(--apple-blue);
}

.settings-option input[type="checkbox"] {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  accent-color: var(--apple-blue);
  border-radius: 4px;
  cursor: pointer;
}

.settings-option input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-label {
  font-size: var(--text-body);
  font-weight: var(--font-medium);
  color: var(--text-color);
  flex-shrink: 0;
}

.settings-option span {
  font-size: var(--text-body);
  color: var(--text-color);
}

.settings-select {
  padding: 0.5rem 1rem;
  font-size: var(--text-body);
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md);
  background-color: var(--white);
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
}

.settings-select:hover:not(:disabled) {
  border-color: var(--apple-blue);
}

.settings-select:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.settings-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-input {
  padding: 0.5rem 1rem;
  font-size: var(--text-body);
  border: 1.5px solid var(--gray-300);
  border-radius: var(--radius-md);
  background-color: var(--white);
  color: var(--text-color);
  transition: all var(--transition-fast);
  flex: 1;
}

.settings-input:hover {
  border-color: var(--apple-blue);
}

.settings-input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.settings-description {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(0, 122, 255, 0.05);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: var(--radius-md);
  font-size: var(--text-subhead);
  color: var(--apple-blue);
  text-align: center;
}

.settings-note {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--gray-100);
  border-radius: var(--radius-md);
  font-size: var(--text-caption-1);
  color: var(--gray-600);
}

.settings-note a {
  color: var(--apple-blue);
  text-decoration: none;
  font-weight: var(--font-medium);
}

.settings-note a:hover {
  text-decoration: underline;
}

.settings-info {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(52, 199, 89, 0.05);
  border: 1px solid rgba(52, 199, 89, 0.2);
  border-radius: var(--radius-md);
  font-size: var(--text-caption-1);
  color: var(--text-color);
}

.settings-info strong {
  color: var(--apple-green);
  font-weight: var(--font-semibold);
}

.settings-info ul {
  margin: var(--spacing-sm) 0 0 0;
  padding-left: var(--spacing-lg);
}

.settings-info li {
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height-normal);
}

.settings-info li strong {
  color: var(--text-color);
}

.settings-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.settings-close-button {
  padding: 0.8rem 2rem;
  font-size: var(--text-body);
  font-weight: var(--font-semibold);
  color: var(--white);
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-spring);
  min-width: 120px;
  box-shadow: var(--shadow-blue);
}

.settings-close-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
}

/* Navigation Bar */
.app-navbar {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
  padding: 0 var(--spacing-lg);
  transition: all var(--transition-normal);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.navbar-scrolled {
  box-shadow: var(--shadow-md);
  background: var(--glass-bg-dark);
}

.navbar-with-back {
  padding-left: var(--spacing-md);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.navbar-back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--apple-blue);
  background-color: var(--white);
  border: 1.5px solid var(--apple-blue);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-spring);
}

.navbar-back-btn:hover {
  background-color: var(--apple-blue);
  color: var(--white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-blue);
}

.navbar-back-text {
  display: none;
  @media (min-width: 768px) {
    display: inline;
  }
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.navbar-brand:hover {
  transform: translateY(-1px);
}

.navbar-logo {
  font-size: 1.5rem;
}

.navbar-title {
  font-size: var(--text-headline);
  font-weight: var(--font-semibold);
  color: var(--text-color);
  letter-spacing: var(--letter-spacing-tight);
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar-page-title {
  font-size: var(--text-title-3);
  font-weight: var(--font-semibold);
  color: var(--text-color);
  letter-spacing: var(--letter-spacing-tight);
  margin: 0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--text-color);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background-color: var(--gray-50);
  color: var(--apple-blue);
}

.nav-active .nav-link {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--apple-blue);
  font-weight: var(--font-semibold);
}

.nav-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
  color: var(--text-color);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-dropdown-trigger:hover {
  background-color: var(--gray-50);
  color: var(--apple-blue);
}

.nav-dropdown-arrow {
  transition: transform var(--transition-fast);
}

.nav-dropdown-arrow.rotate-180 {
  transform: rotate(180deg);
}

.navbar-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-sm);
  background: var(--glass-bg-dark);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-dropdown);
  min-width: 200px;
  animation: slideDown var(--transition-spring);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  text-align: left;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-subhead);
  color: var(--text-color);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: var(--gray-50);
  color: var(--apple-blue);
}

.dropdown-active {
  background-color: rgba(0, 122, 255, 0.08);
  color: var(--apple-blue);
  font-weight: var(--font-medium);
}

.navbar-user {
  position: relative;
}

.navbar-user-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-color);
}

.navbar-user-btn:hover {
  background-color: var(--gray-50);
}

.user-logged-in .user-avatar-icon {
  color: var(--apple-green);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--gray-100);
  flex-shrink: 0;
}

.user-avatar-icon {
  font-size: 1rem;
}

.user-name {
  font-size: var(--text-subhead);
  font-weight: var(--font-medium);
}

/* Mobile Menu */
.navbar-mobile-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-color);
}

.navbar-mobile-toggle:hover {
  background-color: var(--gray-50);
}

.hamburger {
  position: relative;
  width: 24px;
  height: 20px;
  cursor: pointer;
}

.hamburger span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--text-color);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

.hamburger span:nth-child(1) {
  top: 0;
}

.hamburger span:nth-child(2) {
  top: 9px;
}

.hamburger span:nth-child(3) {
  bottom: 0;
}

.hamburger-active span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.hamburger-active span:nth-child(2) {
  opacity: 0;
}

.hamburger-active span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

.mobile-nav-menu {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100vh;
  background: var(--glass-bg-dark);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-left: 1px solid var(--glass-border);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-fixed);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.mobile-nav-open {
  right: 0;
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
}

.mobile-nav-title {
  font-size: var(--text-title-3);
  font-weight: var(--font-semibold);
  color: var(--text-color);
}

.mobile-nav-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-color);
}

.mobile-nav-close:hover {
  background-color: var(--gray-50);
}

.mobile-nav-items {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.mobile-nav-item-wrapper {
  margin-bottom: var(--spacing-sm);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-md);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-color);
}

.mobile-nav-item:hover {
  background-color: var(--gray-50);
  color: var(--apple-blue);
}

.mobile-nav-active {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--apple-blue);
  font-weight: var(--font-semibold);
}

.mobile-nav-icon {
  font-size: 1.2rem;
  margin-right: var(--spacing-md);
}

.mobile-nav-label {
  flex: 1;
  font-size: var(--text-body);
  font-weight: var(--font-medium);
}

.mobile-nav-arrow {
  transition: transform var(--transition-fast);
}

.mobile-nav-arrow.rotate-180 {
  transform: rotate(180deg);
}

.mobile-nav-indicator {
  width: 4px;
  height: 20px;
  background-color: var(--apple-blue);
  border-radius: var(--radius-full);
}

.mobile-nav-submenu {
  margin-left: var(--spacing-lg);
  margin-top: var(--spacing-sm);
  border-left: 2px solid var(--gray-200);
  padding-left: var(--spacing-md);
  animation: slideDown var(--transition-spring);
}

.mobile-nav-subitem {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-color);
  font-size: var(--text-subhead);
}

.mobile-nav-subitem:hover {
  background-color: var(--gray-50);
  color: var(--apple-blue);
}

.subitem-icon {
  font-size: 1rem;
  margin-right: var(--spacing-md);
}

.subitem-label {
  flex: 1;
  font-weight: var(--font-medium);
}

.mobile-nav-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.mobile-user-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--spacing-md);
  background: var(--gradient-primary);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-body);
  font-weight: var(--font-medium);
}

.mobile-user-btn:hover {
  background: var(--primary-gradient-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-blue);
}

.mobile-user-btn.user-logged-in {
  background: var(--apple-green);
}

.mobile-user-btn.user-logged-in:hover {
  background: #2DB14C;
  box-shadow: var(--shadow-green);
}

.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: var(--z-fixed);
  animation: fadeIn var(--transition-fast);
}

/* Responsive Utilities */
.desktop-only {
  display: none;
  @media (min-width: 768px) {
    display: inline;
  }
}

.mobile-only {
  display: inline;
  @media (min-width: 768px) {
    display: none;
  }
}

.desktop-nav {
  display: none;
  @media (min-width: 768px) {
    display: flex;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-content-area {
    padding: var(--spacing-md);
  }
  
  .practice-card {
    padding: 32px var(--spacing-md);
  }
  
  .data-source-cards {
    grid-template-columns: 1fr;
  }
  
  .practice-card-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .word-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .word-input-wrapper {
    justify-content: center;
  }
}

@media (min-width: 768px) {
  .app-content-area {
    padding: var(--spacing-xl);
  }
  
  .data-source-cards {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-width: 992px) {
  .app-content-area {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .practice-card {
    max-width: 1000px;
  }
}
```