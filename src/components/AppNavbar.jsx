import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from './Icon';

const NAV_ITEMS = [
  { id: 'home', icon: 'Home', label: '首页', requiresAuth: false },
  { 
    id: 'practice', 
    icon: 'Book', 
    label: '新概念', 
    requiresAuth: false,
    children: [
      { id: 'new-concept-1', icon: 'Number1', label: '第一册' },
      { id: 'new-concept-2', icon: 'Number2', label: '第二册' },
      { id: 'new-concept-3', icon: 'Number3', label: '第三册' },
    ]
  },
  { id: 'vocabulary', icon: 'BookOpen', label: '生词本', requiresAuth: false },
];

const AppNavbar = ({ 
  currentView, 
  onNavigate, 
  currentUser, 
  onLoginClick,
  showBackButton,
  onBack,
  title,
  onNewConceptSelect
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.navbar-dropdown')) {
        setActiveDropdown(null);
      }
      if (isMobileMenuOpen && !e.target.closest('.mobile-nav-menu')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleNavClick = useCallback((itemId) => {
    // 检查是否需要登录（生词本相关功能）
    if (itemId === 'vocab-review' || itemId === 'vocabulary') {
      if (!currentUser) {
        onLoginClick?.();
        return;
      }
    }
    onNavigate(itemId);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [currentUser, onNavigate, onLoginClick]);
  
  const handleDropdownClick = useCallback((childId) => {
    if (onNewConceptSelect) {
      onNewConceptSelect(childId);
    } else {
      onNavigate(childId);
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [onNavigate, onNewConceptSelect]);

  const isActive = useCallback((itemId) => {
    if (currentView === itemId) return true;
    if (itemId === 'practice' && currentView?.startsWith('practice-')) return true;
    if (itemId === 'flashcard-learn' && currentView === 'flashcard-learn') return true;
    if (itemId === 'flashcard-manage' && currentView === 'flashcard-manage') return true;
    return false;
  }, [currentView]);

  const currentItem = useMemo(() => {
    return NAV_ITEMS.find(item => item.id === currentView || 
      (currentView?.startsWith(item.id + '-') && item.id !== 'home'));
  }, [currentView]);

  const navItemsToShow = useMemo(() => {
    return NAV_ITEMS.filter(item => !item.requiresAuth || currentUser);
  }, [currentUser]);

  return (
    <nav className={`app-navbar ${isScrolled ? 'navbar-scrolled' : ''} ${showBackButton ? 'navbar-with-back' : ''}`}>
      <div className="navbar-inner">
        {/* Left Section: Back Button / Logo */}
        <div className="navbar-left">
          {showBackButton ? (
            <button 
              className="navbar-back-btn" 
              onClick={onBack}
              aria-label="返回"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="navbar-back-text">返回</span>
            </button>
          ) : (
            <button 
              className="navbar-brand" 
              onClick={() => handleNavClick('home')}
              aria-label="返回首页"
            >
              <Icon name="BookOpen" size={24} className="navbar-logo" />
              <span className="navbar-title">Sentence Dictation</span>
            </button>
          )}
        </div>

        {/* Center Section: Page Title (when in sub-page) */}
        {showBackButton && title && (
          <div className="navbar-center">
            <h2 className="navbar-page-title">{title}</h2>
          </div>
        )}

        {/* Right Section: Navigation Items / User */}
        <div className="navbar-right">
          {/* Desktop Navigation */}
          <ul className="navbar-nav desktop-nav">
            {navItemsToShow.map(item => (
              <li key={item.id} className={`nav-item ${isActive(item.id) ? 'nav-active' : ''}`}>
                {item.children ? (
                  <div 
                    className="nav-dropdown-trigger"
                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                  >
                    <Icon name={item.icon} size={16} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    <Icon 
                      name="ChevronDown" 
                      size={12} 
                      className={`nav-dropdown-arrow ${activeDropdown === item.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                ) : (
                  <button 
                    className="nav-link"
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon name={item.icon} size={16} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                )}
                
                {item.children && activeDropdown === item.id && (
                  <div className="navbar-dropdown">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        className={`dropdown-item ${isActive(child.id) ? 'dropdown-active' : ''}`}
                        onClick={() => handleDropdownClick(child.id)}
                      >
                        <Icon name={child.icon} size={14} />
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* User Section */}
          <div className="navbar-user">
            <button 
              className={`navbar-user-btn ${currentUser ? 'user-logged-in' : ''}`}
              onClick={() => currentUser ? null : onLoginClick?.()}
              title={currentUser ? `${currentUser.email}` : '点击登录'}
            >
              <span className="user-avatar">
                {currentUser ? (
                  <Icon name="User" size={18} className="user-avatar-icon" />
                ) : (
                  <Icon name="User" size={18} />
                )}
              </span>
              <span className="user-name desktop-only">
                {currentUser ? '已登录' : '登录'}
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="navbar-mobile-toggle mobile-only"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={isMobileMenuOpen}
          >
            <div className={`hamburger ${isMobileMenuOpen ? 'hamburger-active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">导航菜单</span>
          <button 
            className="mobile-nav-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="关闭"
          >
            <Icon name="X" size={24} />
          </button>
        </div>
        
        <div className="mobile-nav-items">
          {navItemsToShow.map(item => (
            <div key={item.id} className="mobile-nav-item-wrapper">
              {item.children ? (
                <>
                  <button
                    className={`mobile-nav-item ${isActive(item.id) ? 'mobile-nav-active' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                  >
                    <Icon name={item.icon} size={20} className="mobile-nav-icon" />
                    <span className="mobile-nav-label">{item.label}</span>
                    <Icon 
                      name="ChevronDown" 
                      size={16} 
                      className={`mobile-nav-arrow ${activeDropdown === item.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {activeDropdown === item.id && (
                    <div className="mobile-nav-submenu">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          className="mobile-nav-subitem"
                          onClick={() => handleDropdownClick(child.id)}
                        >
                          <Icon name={child.icon} size={16} className="subitem-icon" />
                          <span className="subitem-label">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={`mobile-nav-item ${isActive(item.id) ? 'mobile-nav-active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <Icon name={item.icon} size={20} className="mobile-nav-icon" />
                  <span className="mobile-nav-label">{item.label}</span>
                  {isActive(item.id) && <span className="mobile-nav-indicator"></span>}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mobile-nav-footer">
          <button 
            className={`mobile-user-btn ${currentUser ? 'user-logged-in' : ''}`}
            onClick={() => {
              if (!currentUser) onLoginClick?.();
              setIsMobileMenuOpen(false);
            }}
          >
            <span>
              {currentUser ? (
                <>
                  <Icon name="User" size={16} className="inline-icon" /> {currentUser.email}
                </>
              ) : (
                <>
                  <Icon name="Lock" size={16} className="inline-icon" /> 登录账户
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default AppNavbar;