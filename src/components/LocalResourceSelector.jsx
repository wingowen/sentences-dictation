// src/components/LocalResourceSelector.jsx
import React from 'react';

/**
 * 本地资源选择器组件
 * @param {Object} props
 * @param {boolean} props.showSelector - 是否显示选择器
 * @param {Array} props.resources - 本地资源列表
 * @param {string} props.selectedResourceId - 选中的资源ID
 * @param {Function} props.onResourceChange - 资源选择回调
 */
const LocalResourceSelector = React.memo(({
  showSelector,
  resources,
  selectedResourceId,
  onResourceChange
}) => {
  // 只在需要显示且有资源时显示
  if (!showSelector || resources.length === 0) {
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