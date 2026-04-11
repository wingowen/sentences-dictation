# 生词编辑功能测试计划

## 测试目标
验证生词本的编辑功能是否正常工作，包括添加、编辑和删除操作。

## 测试步骤

### 1. 打开生词本页面
- 导航到 `http://localhost:5173/#vocabulary`
- 等待页面加载完成

### 2. 添加新生词
- 点击「添加生词」按钮
- 填写表单：
  - 单词：testword
  - 音标：/test/
  - 含义：测试单词
  - 词性：名词
  - 例句上下文：This is a test sentence with testword.
  - 笔记：This is a test note.
- 点击「保存」按钮
- 验证生词是否出现在列表中

### 3. 编辑生词
- 找到刚添加的 testword
- 点击「编辑」按钮
- 修改表单数据：
  - 含义：修改后的测试单词
  - 笔记：修改后的测试笔记
- 点击「保存」按钮
- 验证修改是否成功

### 4. 删除生词
- 找到修改后的 testword
- 点击「删除」按钮
- 确认删除操作
- 验证生词是否从列表中消失

## 预期结果
- 添加生词成功，显示在列表中
- 编辑生词成功，修改后的内容正确显示
- 删除生词成功，从列表中消失
- 同步状态正确更新

## 测试文件
- 主组件：[VocabularyApp.jsx](file:///workspace/src/components/VocabularyApp.jsx)
- 服务文件：[vocabularyServiceNew.js](file:///workspace/src/services/vocabularyServiceNew.js)
- 本地存储服务：[localVocabularyService.js](file:///workspace/src/services/localVocabularyService.js)
- 同步服务：[syncService.js](file:///workspace/src/services/syncService.js)

## 关键功能点
1. **添加功能**：`addVocabulary` 函数，先保存到本地，然后异步同步到远程
2. **编辑功能**：`handleEdit` 函数，填充表单数据并打开编辑模式
3. **更新功能**：`updateVocabulary` 函数，先更新本地，然后异步同步到远程
4. **删除功能**：`deleteVocabulary` 函数，先从本地删除，然后异步同步到远程
5. **同步功能**：`syncVocabularies` 函数，执行双向同步

## 注意事项
- 确保本地存储可用
- 检查同步状态是否正确更新
- 验证表单验证是否正常工作
- 测试网络断开时的离线功能
