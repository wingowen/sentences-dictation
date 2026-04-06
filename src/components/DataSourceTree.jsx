import React, { useState } from 'react';

const SectionCard = ({ node, onSelect, currentUser }) => {
  const isLocked = node.requiresLogin && !currentUser;

  const handleClick = () => {
    if (isLocked) {
      alert('请先登录');
    } else {
      onSelect(node);
    }
  };

  return (
    <div
      className={`section-item ${isLocked ? 'locked' : ''}`}
      onClick={handleClick}
    >
      <span className="section-item-icon">{node.icon}</span>
      <span className="section-item-name">{node.name}</span>
      {isLocked && <span className="section-item-lock">🔒</span>}
    </div>
  );
};

const DataSourceTree = ({ tree, onSelect, currentUser, onLoginClick }) => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="homepage-hero">
        <div className="homepage-hero-icon">🎧</div>
        <h1 className="homepage-hero-title">Practice Your English</h1>
        <p className="homepage-hero-subtitle">听写练习 · 间隔重复 · 高效记忆</p>
        <button
          className="homepage-btn-secondary"
          onClick={() => {
            const resourcesSection = document.querySelector('.homepage-sections');
            resourcesSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          📚 浏览资源
        </button>
      </div>

      {/* Sections */}
      <div className="homepage-sections">
        {tree.map(category => (
          <div key={category.id} className="homepage-section">
            <div className="homepage-section-header">
              <span className="homepage-section-icon">{category.icon}</span>
              <span className="homepage-section-title">{category.name}</span>
            </div>
            <div className="homepage-section-items">
              {category.children?.map(child =>
                child.children ? (
                  // Nested category (e.g., 新概念英语 with 1/2/3)
                  child.children.map(subChild => (
                    <SectionCard
                      key={subChild.id}
                      node={subChild}
                      onSelect={onSelect}
                      currentUser={currentUser}
                    />
                  ))
                ) : (
                  <SectionCard
                    key={child.id}
                    node={child}
                    onSelect={onSelect}
                    currentUser={currentUser}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSourceTree;
