// src/components/LocalResourceSelector.jsx
import React from 'react';
import { DATA_SOURCE_TYPES } from '../services/dataService';

/**
 * 本地资源选择器组件
 * @param {Object} props
 * @param {string} props.dataSource - 当前数据源
 * @param {Array} props.resources - 本地资源列表
 * @param {string} props.selectedResourceId - 选中的资源ID
 * @param {Function} props.onResourceChange - 资源选择回调
 */
const LocalResourceSelector = React.memo(({
  dataSource,
  resources,
  selectedResourceId,
  onResourceChange
}) => {
  // 只在本地数据源且有资源时显示
  if (dataSource !== DATA_SOURCE_TYPES.LOCAL || resources.length === 0) {
    return null;
  }

  return (
    <div className="article-selector">
      <label>
        选择本地资源:
        <select
          value={selectedResourceId}
          onChange={(e) => onResourceChange(e.target.value)}
        >
          {resources.map(resource => (
            <option key={resource.id} value={resource.id}>
              {resource.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
});

LocalResourceSelector.displayName = 'LocalResourceSelector';

export default LocalResourceSelector;