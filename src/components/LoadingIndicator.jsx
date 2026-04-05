import React from 'react';

const LoadingIndicator = ({ 
  message = '加载中...',
  size = 'medium',
  type = 'spinner',
  fullScreen = false
}) => {
  const sizeClasses = {
    small: 'loading-sm',
    medium: 'loading-md',
    large: 'loading-lg'
  };

  const renderSpinner = () => (
    <div className={`loading-spinner ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="loading-dots">
      {[1,2,3].map(i => (
        <div key={i} className={`loading-dot ${sizeClasses[size]}`} />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`loading-pulse ${sizeClasses[size]}`} />
  );

  const renderBars = () => (
    <div className="loading-bars">
      {[1,2,3,4].map(i => (
        <div key={i} className="loading-bar" style={{animationDelay: `${i * 0.1}s`}} />
      ))}
    </div>
  );

  const spinnerMap = {
    spinner: renderSpinner,
    dots: renderDots,
    pulse: renderPulse,
    bars: renderBars
  };

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          {spinnerMap[type]()}
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      {spinnerMap[type]()}
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
