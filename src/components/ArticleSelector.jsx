// src/components/ArticleSelector.jsx
import React from 'react';
import { DATA_SOURCE_TYPES } from '../services/dataService';

/**
 * 新概念三文章选择器组件
 * @param {Object} props
 * @param {string} props.dataSource - 当前数据源
 * @param {Array} props.articles - 文章列表
 * @param {number|null} props.selectedArticleId - 选中的文章ID
 * @param {Function} props.onArticleChange - 文章选择回调
 * @param {boolean} props.isLoading - 是否正在加载
 */
const ArticleSelector = React.memo(({
  dataSource,
  articles,
  selectedArticleId,
  onArticleChange,
  isLoading
}) => {
  // 只在新概念三数据源且有文章时显示
  if (dataSource !== DATA_SOURCE_TYPES.NEW_CONCEPT_3 ||
      articles.length === 0) {
    return null;
  }

  return (
    <div className="article-selector">
      <label>
        选择文章:
        <select
          value={selectedArticleId || ''}
          onChange={(e) => {
            const value = e.target.value;
            onArticleChange(value ? parseInt(value) : null);
          }}
          disabled={isLoading}
        >
          <option value="">
            {isLoading ? '加载中...' : '请选择文章'}
          </option>
          {articles.map(article => (
            <option key={article.id} value={article.id}>
              {article.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
});

ArticleSelector.displayName = 'ArticleSelector';

export default ArticleSelector;