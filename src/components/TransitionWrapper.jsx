import React, { useState, useEffect } from 'react';

const TransitionWrapper = ({ 
  children, 
  show = true,
  duration = 300,
  animationType = 'fade'
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`transition-wrapper transition-${animationType} ${isVisible ? 'is-visible' : 'is-hidden'}`}
      style={{ 
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default TransitionWrapper;
