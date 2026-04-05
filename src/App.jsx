import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
import './App.css';
import { onAuthStateChanged, getCurrentUser } from './services/firebase';
import { DATA_SOURCE_TREE, DATA_SOURCE_TYPES } from './services/dataService';
import DataSourceTree from './components/DataSourceTree';
import PracticeCard from './components/PracticeCard';
import LoadingIndicator from './components/LoadingIndicator';
import PageSkeleton from './components/PageSkeleton';
import AppNavbar from './components/AppNavbar';
import LoginModal from './components/LoginModal';
import { AppProvider } from './contexts/AppContext';

const FlashcardApp = lazy(() => import('./components/FlashcardApp'));
const FlashcardLearner = lazy(() => import('./components/FlashcardLearner'));
const VocabularyApp = lazy(() => import('./components/VocabularyApp'));
const VocabularyReview = lazy(() => import('./components/VocabularyReview'));

const VIEWS = {
  HOME: 'home',
  PRACTICE: 'practice',
  FLASHCARD_LEARN: 'flashcard-learn',
  FLASHCARD_MANAGE: 'flashcard-manage',
  VOCAB_REVIEW: 'vocab-review',
  VOCABULARY: 'vocabulary',
};

const VIEW_TITLES = {
  [VIEWS.HOME]: null,
  [VIEWS.PRACTICE]: '练习模式',
  [VIEWS.FLASHCARD_LEARN]: '闪卡学习',
  [VIEWS.FLASHCARD_MANAGE]: '闪卡管理',
  [VIEWS.VOCAB_REVIEW]: '生词复习',
  [VIEWS.VOCABULARY]: '生词本',
};

const VIEW_CONFIG = {
  [VIEWS.HOME]: { showBackButton: false },
  [VIEWS.PRACTICE]: { showBackButton: true },
  [VIEWS.FLASHCARD_LEARN]: { showBackButton: true },
  [VIEWS.FLASHCARD_MANAGE]: { showBackButton: false },
  [VIEWS.VOCAB_REVIEW]: { showBackButton: true },
  [VIEWS.VOCABULARY]: { showBackButton: true },
};

const componentCache = new Map();

function getLazyComponent(view) {
  if (componentCache.has(view)) {
    return componentCache.get(view);
  }
  
  let component;
  switch (view) {
    case VIEWS.PRACTICE:
      component = PracticeCard;
      break;
    case VIEWS.FLASHCARD_LEARN:
      component = FlashcardLearner;
      break;
    case VIEWS.FLASHCARD_MANAGE:
      component = FlashcardApp;
      break;
    case VIEWS.VOCAB_REVIEW:
      component = VocabularyReview;
      break;
    case VIEWS.VOCABULARY:
      component = VocabularyApp;
      break;
    default:
      return null;
  }
  
  componentCache.set(view, component);
  return component;
}

function useHashRouter(initialView) {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash && Object.values(VIEWS).includes(hash) ? hash : initialView;
  });
  const [viewHistory, setViewHistory] = useState([initialView]);
  const historyIndexRef = useRef(0);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      if (hash && Object.values(VIEWS).includes(hash)) {
        setCurrentView(hash);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = useCallback((view) => {
    if (!Object.values(VIEWS).includes(view)) return;
    
    window.history.pushState(null, '', `#${view}`);
    setViewHistory(prev => [...prev.slice(0, historyIndexRef.current + 1), view]);
    historyIndexRef.current += 1;
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateBack = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevView = viewHistory[historyIndexRef.current];
      window.history.back();
      setCurrentView(prevView);
    } else {
      navigateTo(VIEWS.HOME);
    }
  }, [viewHistory, navigateTo]);

  const canGoBack = historyIndexRef.current > 0 || currentView !== VIEWS.HOME;

  return { currentView, navigateTo, navigateBack, canGoBack };
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const contentAreaRef = useRef(null);

  const { currentView, navigateTo, navigateBack, canGoBack } = useHashRouter(VIEWS.HOME);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setAuthLoading(false);
    
    return unsubscribe;
  }, []);

  const handleNavigate = useCallback((view) => {
    setIsContentLoading(true);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        navigateTo(view);
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsContentLoading(false);
          }, 50);
        });
      }, 80);
    });
  }, [navigateTo]);

  const handleBack = useCallback(() => {
    setIsContentLoading(true);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        navigateBack();
        
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsContentLoading(false);
          }, 50);
        });
      }, 80);
    });
  }, [navigateBack]);

  const handleLoginClick = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleLoginSuccess = useCallback((user) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  }, []);

  const handleCloseLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleSelectDataSource = useCallback((node) => {
    if (!node) return;
    
    if (node.view === 'flashcard-learner') {
      handleNavigate(VIEWS.FLASHCARD_LEARN);
    } else if (node.view === 'flashcard-manager') {
      handleNavigate(VIEWS.FLASHCARD_MANAGE);
    } else if (node.view === 'vocab-review') {
      handleNavigate(VIEWS.VOCAB_REVIEW);
    } else if (node.id) {
      setSelectedDataSource(node.id);
      handleNavigate(VIEWS.PRACTICE);
    } else {
      handleNavigate(VIEWS.HOME);
    }
  }, [handleNavigate]);

  const showBackButton = VIEW_CONFIG[currentView]?.showBackButton && canGoBack;
  const pageTitle = VIEW_TITLES[currentView];

  const renderContent = useMemo(() => {
    switch (currentView) {
      case VIEWS.HOME:
        return (
          <DataSourceTree
            tree={DATA_SOURCE_TREE}
            onSelect={handleSelectDataSource}
            currentUser={currentUser}
            onLoginClick={handleLoginClick}
          />
        );
      
      case VIEWS.PRACTICE:
        return (
          <AppProvider dataSource={selectedDataSource || DATA_SOURCE_TYPES.LOCAL}>
            <PracticeCard
              onBack={() => navigateTo(VIEWS.HOME)}
              currentUser={currentUser}
            />
          </AppProvider>
        );
      
      case VIEWS.FLASHCARD_LEARN:
        return (
          <Suspense fallback={<PageSkeleton type="flashcard" />}>
            <FlashcardLearner
              onBack={() => navigateTo(VIEWS.HOME)}
              currentUser={currentUser}
              showHeader={false}
            />
          </Suspense>
        );

      case VIEWS.FLASHCARD_MANAGE:
        return (
          <Suspense fallback={<PageSkeleton type="flashcard" />}>
            <FlashcardApp
              onBack={() => navigateTo(VIEWS.HOME)}
              currentUser={currentUser}
            />
          </Suspense>
        );

      case VIEWS.VOCAB_REVIEW:
        return (
          <Suspense fallback={<PageSkeleton type="review" />}>
            <VocabularyReview
              onBack={() => navigateTo(VIEWS.HOME)}
              currentUser={currentUser}
              showHeader={false}
            />
          </Suspense>
        );

      case VIEWS.VOCABULARY:
        return (
          <Suspense fallback={<PageSkeleton type="vocabulary" />}>
            <VocabularyApp
              onBack={() => navigateTo(VIEWS.HOME)}
              currentUser={currentUser}
            />
          </Suspense>
        );

      default:
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column'
          }}>
            <p>页面不存在</p>
            <button onClick={() => navigateTo(VIEWS.HOME)} style={{ marginTop: '16px' }}>
              返回首页
            </button>
          </div>
        );
    }
  }, [currentView, currentUser, navigateTo, handleSelectDataSource, handleLoginClick]);

  if (authLoading) {
    return (
      <div className="app-layout">
        <AppNavbar 
          currentView={VIEWS.HOME} 
          onNavigate={() => {}}
          currentUser={null}
        />
        <div className="app-content-area">
          <LoadingIndicator message="加载中..." type="spinner" size="large" fullscreen />
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <AppNavbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLoginClick={handleLoginClick}
        showBackButton={showBackButton}
        onBack={handleBack}
        title={pageTitle}
      />
      
      <main 
        ref={contentAreaRef}
        className={`app-content-area ${isContentLoading ? 'app-content-loading' : ''}`}
      >
        <div key={currentView} className="view-enter">
          {renderContent}
        </div>
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}

export default AppContent;