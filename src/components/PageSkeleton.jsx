import React from 'react';

const PageSkeleton = ({ 
  title, 
  showBackButton = true,
  layout = 'default'
}) => {
  return (
    <div className={`page-skeleton page-skeleton--${layout}`}>
      {showBackButton && (
        <div className="skeleton-header">
          <div className="skeleton-button skeleton-shimmer" style={{width: '60px', height: '32px'}} />
          <div className="skeleton-title skeleton-shimmer" style={{width: '120px', height: '24px'}} />
        </div>
      )}
      
      <div className="skeleton-content">
        {layout === 'card' && (
          <>
            <div className="skeleton-card skeleton-shimmer" style={{height: '200px'}} />
            <div className="skeleton-card skeleton-shimmer" style={{height: '200px', marginTop: '16px'}} />
          </>
        )}
        
        {layout === 'list' && (
          <>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton-list-item skeleton-shimmer" style={{height: '60px', marginBottom: '12px'}} />
            ))}
          </>
        )}
        
        {layout === 'form' && (
          <>
            <div className="skeleton-input skeleton-shimmer" style={{height: '40px', marginBottom: '16px'}} />
            <div className="skeleton-input skeleton-shimmer" style={{height: '80px', marginBottom: '16px'}} />
            <div className="skeleton-button-large skeleton-shimmer" style={{height: '40px', width: '120px'}} />
          </>
        )}
        
        {layout === 'default' && (
          <>
            <div className="skeleton-block skeleton-shimmer" style={{height: '150px', marginBottom: '20px'}} />
            <div className="skeleton-block skeleton-shimmer" style={{height: '150px'}} />
          </>
        )}
      </div>
      
      <div className="skeleton-loading-indicator">
        <div className="skeleton-spinner" />
        <span>{title || '加载中...'}</span>
      </div>
    </div>
  );
};

export default PageSkeleton;
