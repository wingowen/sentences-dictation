# Notion 集成配置指南

本文档说明如何配置 Notion API 以从 Notion 页面动态获取句子数据。

## 前置要求

1. 一个 Notion 账户
2. 一个包含句子的 Notion 页面
3. Netlify 账户（用于部署和配置环境变量）

## 配置步骤

### 1. 创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "New integration" 或 "+ New integration"
3. 填写集成信息：
   - **Name**: 例如 "Sentences Dictation App"
   - **Associated workspace**: 选择你的工作区
   - **Type**: 选择 "Internal"（内部集成）
4. 点击 "Submit" 创建集成
5. 复制生成的 **Internal Integration Token**（以 `secret_` 开头）
   - 这个 token 就是你的 `NOTION_API_KEY`

### 2. 获取 Notion Page ID

从你的 Notion 页面 URL 中提取 Page ID：

**URL 格式示例：**
```
https://www.notion.so/wingowen/sentences-2df67b2182078004bd67d5d6832030b6
```

**Page ID 提取方法：**

1. **从 URL 中提取**：
   - URL 中最后一个连字符后的部分：`2df67b2182078004bd67d5d6832030b6`
   - 需要将其格式化为标准 UUID 格式：`2df67b21-8207-8004-bd67-d5d6832030b6`
   - 格式：`前8位-中间4位-中间4位-中间4位-后12位`

2. **使用浏览器控制台（推荐）**：
   ```javascript
   // 在浏览器控制台中运行以下代码
   const url = 'https://www.notion.so/wingowen/sentences-2df67b2182078004bd67d5d6832030b6';
   const pageId = url.split('-').pop();
   const formattedId = `${pageId.slice(0,8)}-${pageId.slice(8,12)}-${pageId.slice(12,16)}-${pageId.slice(16,20)}-${pageId.slice(20)}`;
   console.log('Page ID:', formattedId);
   ```

3. **或者直接从 Notion 页面获取**：
   - 打开你的 Notion 页面
   - 点击右上角的 "..." 菜单
   - 选择 "Copy link"
   - 从链接中提取 ID 部分并格式化

**对于你的 URL：**
- 原始 ID: `2df67b2182078004bd67d5d6832030b6`
- 格式化后: `2df67b21-8207-8004-bd67-d5d6832030b6`

### 3. 分享页面给 Integration

1. 打开你的 Notion 页面
2. 点击右上角的 "Share" 按钮
3. 在分享对话框中，点击 "Add people, emails, groups, or integrations"
4. 搜索并选择你刚才创建的 Integration（例如 "Sentences Dictation App"）
5. 点击 "Invite"

**重要：** 如果不分享页面给 Integration，API 将无法访问页面内容。

### 4. 在 Netlify 中配置环境变量

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 选择你的站点
3. 进入 **Site settings** > **Environment variables**
4. 添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `NOTION_API_KEY` | `secret_xxxxx` | 步骤 1 中复制的 Integration Token |
   | `NOTION_PAGE_ID` | `2df67b21-8207-8004-bd67-d5d6832030b6` | 步骤 2 中提取的 Page ID（UUID 格式） |

5. 点击 "Save"

### 5. 重新部署站点

配置环境变量后，需要重新部署站点：

1. 在 Netlify Dashboard 中，进入 **Deploys** 标签
2. 点击 "Trigger deploy" > "Deploy site"
3. 或者推送代码到 GitHub 触发自动部署

## Notion 页面格式建议

为了获得最佳效果，建议在 Notion 页面中：

1. **每行一个句子**：将每个句子放在单独的行或列表中
2. **使用列表格式**：使用项目符号列表或编号列表
3. **避免复杂格式**：尽量使用纯文本，避免过多的格式化

**示例格式：**
```
- Hello, how are you today?
- The quick brown fox jumps over the lazy dog.
- Practice makes perfect.
```

或者使用段落格式，每段一个句子。

## 测试配置

配置完成后，访问你的网站，应用会自动尝试从 Notion 获取句子。如果配置正确，你应该能看到 Notion 页面中的句子。

如果 Notion 数据获取失败，应用会自动回退到本地 `sentences.json` 文件。

## 故障排查

### 问题：返回 500 错误

**可能原因：**
- 环境变量未正确配置
- Integration Token 无效
- Page ID 格式错误

**解决方法：**
1. 检查 Netlify 环境变量是否正确设置
2. 确认 Integration Token 以 `secret_` 开头
3. 确认 Page ID 是 UUID 格式（包含连字符）

### 问题：返回 404 或空数据

**可能原因：**
- 页面未分享给 Integration
- Page ID 不正确
- 页面中没有可提取的文本内容

**解决方法：**
1. 确认页面已分享给 Integration
2. 检查 Page ID 是否正确
3. 确认页面中有文本内容

### 问题：CORS 错误

**可能原因：**
- Netlify Function 配置问题

**解决方法：**
- 检查 `netlify/functions/get-notion-sentences.js` 文件是否正确部署

## 安全注意事项

1. **永远不要**在前端代码中暴露 `NOTION_API_KEY`
2. **永远不要**将环境变量提交到 Git 仓库
3. 使用 Netlify 环境变量来安全存储敏感信息
4. 定期轮换 Integration Token（如果可能）

## 更新句子

配置完成后，你只需要在 Notion 页面中添加、修改或删除句子，然后刷新网站即可看到更新。无需重新部署代码！

