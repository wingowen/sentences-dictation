此次合并主要更新了Supabase依赖版本，优化了组件状态管理，并添加了生词编辑功能的测试脚本。同时移除了不必要的依赖包，提升了项目的整体性能和可维护性。
| 文件 | 变更 |
|------|---------|
| package.json | - 更新 @supabase/supabase-js 从 2.45.0 到 2.103.0<br>- 移除 supabase 依赖包 |
| src/components/LessonSelector.jsx | - 添加空课程时的处理逻辑，设置 lessons 为空数组<br>- 优化 useEffect 依赖项，移除 dataSource 依赖<br>- 添加数据源变化时的状态重置逻辑 |
| src/contexts/AppContext.jsx | - 优化 useMemo 依赖项，添加 newConcept2Data 和 newConcept3Data<br>- 添加数据源变化时的状态重置逻辑，重置 selectedLesson 和 currentIndex |
| src/hooks/useSentences.js | - 移除 useEffect 依赖项，避免无限循环 |
| test_vocabulary_api.sh | - 新增测试脚本，用于测试生词编辑 API 端点功能 |
| test_vocabulary_edit.py | - 新增 Python 测试脚本，使用 Playwright 测试生词编辑功能 |
| package-lock.json | - 移除多个不必要的依赖包，包括 fetch-blob、formdata-polyfill、minipass 等<br>- 更新 imurmurhash 为 dev 依赖 |