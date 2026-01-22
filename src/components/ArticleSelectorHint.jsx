// src/components/ArticleSelectorHint.jsx
import React from 'react';
import { DATA_SOURCE_TYPES } from '../services/dataService';

/**
 * 文章选择器提示组件
 * @param {Object} props
 * @param {string} props.dataSource - 当前数据源
 * @param {Array} props.articles - 文章列表
 * @param {number|null} props.selectedArticleId - 选中的文章ID
 * @param {boolean} props.isLoading - 是否正在加载
 */
function ArticleSelectorHint({
  dataSource,
  articles,
  selectedArticleId,
  isLoading
}) {
  // 只在新概念三数据源、有文章、未选择文章且不在加载中时显示
  if (dataSource !== DATA_SOURCE_TYPES.NEW_CONCEPT_3 ||
      articles.length === 0 ||
      selectedArticleId ||
      isLoading) {
    return null;
  }

  return (
    <div className="article-selector-hint">
      <p>👆 请在上方选择一篇文章开始练习</p>
    </div>
  );
}

export default ArticleSelectorHint;