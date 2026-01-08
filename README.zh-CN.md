# 句子听写练习工具

## 项目概述

句子听写练习工具是一个交互式网页应用，旨在通过句子听写练习帮助用户提高听力和拼写能力。该应用具有多个数据源、语音合成、音标显示和逐词输入功能，提供增强的学习体验。

### 主要功能

- **多个数据源**：从本地JSON文件、Notion页面或新概念英语教材中选择
- **语音合成**：可调节速度收听句子
- **音标显示**：查看单词的音标转录
- **逐词输入**：一次练习拼写一个单词
- **实时反馈**：即时验证正确答案
- **进度跟踪**：跟踪练习进度
- **响应式设计**：适用于桌面和移动设备

## 项目结构

```
sentences-dictation/
├── .cache/                  # 缓存的API响应
├── doc/                     # 文档文件
│   └── 功能列表.md           # 功能列表
├── netlify/                 # Netlify Functions
│   └── functions/           # 无服务器函数
│       ├── get-new-concept-3-lesson.js   # 获取新概念三课程内容
│       ├── get-new-concept-3.js          # 获取新概念三文章列表
│       ├── get-notion-sentences.js       # 从Notion获取句子
│       └── get-real-article-link.js      # 获取真实文章链接
├── public/                  # 公共资产
├── src/                     # 源代码
│   ├── assets/              # 静态资产
│   ├── data/                # 本地数据文件
│   │   ├── new-concept-1.json  # 新概念英语1句子
│   │   └── sentences.json       # 本地练习句子
│   ├── services/            # 服务模块
│   │   ├── cacheService.js      # 缓存管理
│   │   ├── dataService.js       # 数据源管理
│   │   ├── pronunciationService.js  # 音标转录
│   │   └── speechService.js     # 文本转语音功能
│   ├── App.css              # 主应用样式
│   ├── App.jsx              # 主应用组件
│   ├── index.css            # 全局样式
│   └── main.jsx             # 应用入口点
├── .gitignore               # Git忽略文件
├── README.md                # 项目文档
├── deno.lock                # Deno依赖锁文件
├── eslint.config.js         # ESLint配置
├── index.html               # HTML模板
├── netlify.toml             # Netlify配置
├── package-lock.json        # npm依赖锁文件
├── package.json             # 项目配置和依赖
├── requirement.md           # 项目要求
└── vite.config.js           # Vite配置
```

## 安装说明

### 先决条件

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- Netlify CLI（用于本地开发无服务器函数）

### 设置步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/your-username/sentences-dictation.git
   cd sentences-dictation
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **安装Netlify CLI**（如果尚未安装）

   ```bash
   npm install -g netlify-cli
   ```

4. **启动开发服务器**

   ```bash
   npm run netlify-dev
   ```

   这将同时启动Vite开发服务器和Netlify Functions开发环境。

5. **访问应用**

   打开浏览器并导航至 `http://localhost:8888`

## 配置步骤

### 环境变量

应用需要以下环境变量用于Netlify Functions：

1. **Notion集成**：
   - `NOTION_API_KEY`：您的Notion API密钥
   - `NOTION_PAGE_ID`：包含句子的Notion页面ID

2. **新概念英语3集成**：
   - 不需要额外的环境变量（使用网页抓取）

3. **本地开发**：
   在项目根目录创建 `.env` 文件，包含所需的变量：

   ```env
   NOTION_API_KEY=your_notion_api_key
   NOTION_PAGE_ID=your_notion_page_id
   ```

### Netlify Functions配置

`netlify.toml` 文件配置了部署的无服务器函数：

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[dev]
  publish = "dist"
  functions = "netlify/functions"
  port = 8888
```

## 使用示例

### 基本使用流程

1. **从初始选择页面选择数据源**
2. **如果使用新概念三**，选择特定文章
3. **使用播放按钮收听句子**
4. **根据需要调整语速**
5. **在相应的输入字段中输入单词**
6. **接收正确/错误答案的即时反馈**
7. **自动或手动移至下一个句子**

### 数据源选择

应用支持四个数据源：

1. **本地数据**：使用本地 `sentences.json` 文件中的句子
2. **Notion**：从配置的Notion页面获取句子
3. **新概念1**：使用新概念英语1教材中的句子
4. **新概念3**：从新概念英语3教材获取文章

### 语音合成功能

- **播放/暂停**：控制音频播放
- **速度调整**：从0.5x到2.0x速度选择
- **自动播放**：加载句子时自动播放
- **浏览器兼容性**：适用于大多数支持Web Speech API的现代浏览器

## API文档

### Netlify Functions

应用使用Netlify Functions进行服务器端操作：

#### 1. get-notion-sentences

**目的**：从Notion页面获取句子

**端点**：`/.netlify/functions/get-notion-sentences`

**方法**：GET

**响应格式**：
```json
{
  "success": true,
  "sentences": ["句子1", "句子2", ...]
}
```

#### 2. get-new-concept-3

**目的**：获取新概念英语3文章列表

**端点**：`/.netlify/functions/get-new-concept-3`

**方法**：GET

**响应格式**：
```json
{
  "success": true,
  "articles": [
    {
      "id": 1,
      "title": "文章标题",
      "link": "https://..."
    },
    ...
  ]
}
```

#### 3. get-new-concept-3-lesson

**目的**：获取特定新概念英语3课程的内容

**端点**：`/.netlify/functions/get-new-concept-3-lesson`

**方法**：POST

**请求体**：
```json
{
  "link": "https://..."
}
```

**响应格式**：
```json
{
  "success": true,
  "sentences": ["句子1", "句子2", ...]
}
```

#### 4. get-real-article-link

**目的**：获取文章的真实链接

**端点**：`/.netlify/functions/get-real-article-link`

**方法**：GET

**响应格式**：
```json
{
  "success": true,
  "link": "https://..."
}
```

## 贡献指南

### 项目结构

为该项目做贡献时，请遵循现有的文件结构和命名约定：

- React组件位于 `src/` 目录
- 服务模块位于 `src/services/`
- 数据文件位于 `src/data/`
- 无服务器函数位于 `netlify/functions/`

### 代码风格

- 使用ES6+语法
- 遵循ESLint规则（见 `eslint.config.js`）
- 变量和函数使用 `camelCase`
- React组件使用 `PascalCase`
- 为函数和模块添加JSDoc注释

### 添加新数据源

添加新数据源：

1. 在 `dataService.js` 中的 `DATA_SOURCE_TYPES` 添加新常量
2. 在 `DATA_SOURCES` 数组中添加新条目，包含名称、描述和图标
3. 为新源实现数据获取函数
4. 在 `getSentencesBySource` 的switch语句中添加case
5. 更新UI以处理新源的任何特定要求

### 测试

- 使用 `npm run netlify-dev` 在本地测试更改
- 验证所有数据源正常工作
- 在不同浏览器中测试语音合成
- 确保响应式设计在各种屏幕尺寸上正常工作

## 故障排除

### 常见问题和解决方案

1. **语音合成不工作**
   - **解决方案**：检查浏览器兼容性（需要Web Speech API支持）
   - **替代方案**：使用支持语音合成的浏览器（Chrome、Edge、Safari）

2. **Netlify Functions错误**
   - **解决方案**：确保安装并运行Netlify CLI `npm run netlify-dev`
   - **检查**：验证环境变量设置正确

3. **Notion集成失败**
   - **解决方案**：检查Notion API密钥是否具有适当的权限
   - **验证**：确保Notion页面ID正确且可访问

4. **新概念3文章未加载**
   - **解决方案**：检查网络连接和网页抓取权限
   - **替代方案**：如果网页抓取被阻止，使用不同的数据源

5. **本地开发问题**
   - **解决方案**：清除浏览器缓存并重启开发服务器
   - **检查**：确保所有依赖项正确安装

### 错误消息

| 错误消息 | 可能原因 | 解决方案 |
|---------------|---------------|----------|
| "Netlify Functions 未运行或返回了非 JSON 数据" | Netlify CLI未运行 | 使用 `npm run netlify-dev` 启动 |
| "请求超时，请检查网络连接" | 网络问题或API响应缓慢 | 检查网络连接，重试 |
| "数据源返回空数据" | 数据源为空或API错误 | 尝试不同的数据源 |
| "Speech synthesis is not supported" | 浏览器兼容性问题 | 使用支持的浏览器 |

## 技术准确性

### 依赖项

| 包 | 版本 | 用途 |
|---------|---------|---------|
| react | ^19.2.0 | UI库 |
| react-dom | ^19.2.0 | React DOM操作 |
| @notionhq/client | ^2.2.15 | Notion API集成 |
| axios | ^1.7.7 | HTTP客户端 |
| cheerio | ^1.0.0 | HTML解析（网页抓取） |
| cmu-pronouncing-dictionary | ^3.0.0 | 音标转录 |
| netlify-cli | ^23.13.1 | 本地开发与Netlify |
| vite | ^7.2.4 | 构建工具 |

### 浏览器兼容性

- **支持**：Chrome 33+、Edge 79+、Safari 7+、Firefox 49+
- **有限支持**：较旧的浏览器可能不支持语音合成
- **推荐**：使用最新版本的Chrome或Edge以获得最佳体验

### 性能优化

- **缓存**：API响应缓存在 `.cache/` 目录中
- **延迟加载**：组件仅在需要时加载
- **最小化**：生产构建被最小化以加快加载速度
- **代码分割**：资源被分割以实现最佳加载

## 贡献

欢迎贡献！请随时提交Pull Request。

## 许可证

该项目是开源的，可在 [MIT许可证](LICENSE) 下使用。

## 致谢

- [新概念英语](https://www.newconceptenglish.com/) 提供教育内容
- [Notion API](https://developers.notion.com/) 提供集成能力
- [CMU发音词典](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) 提供音标转录
- [Netlify](https://www.netlify.com/) 提供无服务器函数托管

---

**愉快学习！** 🎓