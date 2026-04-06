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
import SettingsModal from './components/SettingsModal';
import LessonSelector from './components/LessonSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import { addVocabulary } from './services/vocabularyService';

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

// PracticeCard 包装组件，用于传递 onAddToVocabulary 函数
function PracticeCardWrapper({ onBack, currentUser, onRequireLogin }) {
  const appContext = useApp();
  const { currentWords, currentIndex, sentences, selectedLesson, dataSource } = appContext || {};
  
  const handleAddToVocabulary = useCallback(async (wordData) => {
    if (!currentUser) {
      onRequireLogin?.();
      return;
    }
    
    try {
      const currentSentence = sentences?.[currentIndex];
      const sentenceText = typeof currentSentence === 'object' ? currentSentence?.text || '' : currentSentence || '';
      
      await addVocabulary({
        word: wordData.word,
        phonetic: wordData.phonetic || '',
        meaning: wordData.translation || '',
        part_of_speech: wordData.partOfSpeech || '',
        sentence_context: sentenceText
      });
      
      alert(`已添加 "${wordData.word}" 到生词本`);
    } catch (err) {
      console.error('添加生词失败:', err);
      alert(err.message || '添加失败，请重试');
    }
  }, [currentUser, sentences, currentIndex, onRequireLogin]);
  
  // 检查是否需要显示课文选择器（第二册或第三册且没有选择课文）
  const isNce2 = dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2;
  const isNce3 = dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3;
  const shouldShowLessonSelector = (isNce2 || isNce3) && !selectedLesson;
  
  // 如果需要选择课文，显示课文选择器
  if (shouldShowLessonSelector) {
    return <LessonSelector onBack={onBack} />;
  }
  
  return (
    <PracticeCard
      onBack={onBack}
      currentUser={currentUser}
      onAddToVocabulary={handleAddToVocabulary}
      onRequireLogin={onRequireLogin}
    />
  );
}

function AppContent({ onSelectedDataSourceChange }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const contentAreaRef = useRef(null);

  const { currentView, navigateTo, navigateBack, canGoBack } = useHashRouter(VIEWS.HOME);
  
  // 获取设置模态框的状态和方法
  const {
    showSettingsModal,
    setShowSettingsModal,
    autoPlay,
    setAutoPlay,
    randomMode,
    setRandomMode,
    listenMode,
    setListenMode,
    autoNext,
    setAutoNext,
    showCounter,
    setShowCounter,
    speechRate,
    setSpeechRate,
    showTranslation,
    setShowTranslation,
    showOriginalText,
    setShowOriginalText,
    currentTranslation,
    isSupported: speechSupported,
  } = useApp() || {};

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
      onSelectedDataSourceChange(node.id);
      handleNavigate(VIEWS.PRACTICE);
    } else {
      handleNavigate(VIEWS.HOME);
    }
  }, [handleNavigate, onSelectedDataSourceChange]);
  
  // 处理新概念选择（从导航栏）
  const handleNewConceptSelect = useCallback((conceptId) => {
    const conceptMap = {
      'new-concept-1': DATA_SOURCE_TYPES.NEW_CONCEPT_1,
      'new-concept-2': DATA_SOURCE_TYPES.NEW_CONCEPT_2,
      'new-concept-3': DATA_SOURCE_TYPES.NEW_CONCEPT_3,
    };
    const dataSource = conceptMap[conceptId] || DATA_SOURCE_TYPES.LOCAL;
    
    // 第一册直接进入练习，第二册和第三册需要先选择课文
    if (conceptId === 'new-concept-1') {
      onSelectedDataSourceChange(dataSource);
      handleNavigate(VIEWS.PRACTICE);
    } else {
      // 第二册和第三册：设置数据源并进入练习模式，在练习模式中显示课文选择
      onSelectedDataSourceChange(dataSource);
      handleNavigate(VIEWS.PRACTICE);
    }
  }, [handleNavigate, onSelectedDataSourceChange]);

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
          <PracticeCardWrapper
            onBack={() => navigateTo(VIEWS.HOME)}
            currentUser={currentUser}
            onRequireLogin={() => setIsLoginModalOpen(true)}
          />
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
              onNavigateToReview={() => navigateTo(VIEWS.VOCAB_REVIEW)}
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
        onBack={navigateBack}
        title={pageTitle}
        onNewConceptSelect={handleNewConceptSelect}
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

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        autoPlay={autoPlay}
        onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
        randomMode={randomMode}
        onToggleRandomMode={() => setRandomMode(!randomMode)}
        listenMode={listenMode}
        onToggleListenMode={() => setListenMode(!listenMode)}
        autoNext={autoNext}
        onToggleAutoNext={() => setAutoNext(!autoNext)}
        showCounter={showCounter}
        onToggleShowCounter={() => setShowCounter(!showCounter)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        speechSupported={speechSupported}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation(!showTranslation)}
        showOriginalText={showOriginalText}
        onToggleOriginalText={() => setShowOriginalText(!showOriginalText)}
        currentTranslation={currentTranslation}
      />
    </div>
  );
}

function App() {
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  
  return (
    <AppProvider dataSource={selectedDataSource || DATA_SOURCE_TYPES.LOCAL}>
      <AppContent onSelectedDataSourceChange={setSelectedDataSource} />
    </AppProvider>
  );
}

export default App;