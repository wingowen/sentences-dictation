import React, { useState, useEffect } from 'react';
import FlashcardManager from './FlashcardManager';
import FlashcardLearner from './FlashcardLearner';
import FlashcardStats from './FlashcardStats';
import { checkAndImportDefaultFlashcards } from '../services/flashcardImportService';
import { isLoggedIn, syncLocalToCloud } from '../services/flashcardService';

const FlashcardApp = ({ onBack }) => {
  const [activeView, setActiveView] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const initializeFlashcards = async () => {
      try {
        await checkAndImportDefaultFlashcards();
      } catch (error) {
        console.error('初始化闪卡数据失败:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeFlashcards();
  }, []);

  const handleSync = async () => {
    if (!isLoggedIn()) {
      setSyncStatus({ type: 'error', message: '请先登录' });
      setTimeout(() => setSyncStatus(null), 3000);
      return;
    }

    setSyncStatus({ type: 'loading', message: '同步中...' });
    try {
      const result = await syncLocalToCloud();
      if (result.synced > 0) {
        setSyncStatus({ type: 'success', message: `已同步 ${result.synced} 张闪卡` });
      } else {
        setSyncStatus({ type: 'success', message: '没有新闪卡需要同步' });
      }
    } catch (error) {
      setSyncStatus({ type: 'error', message: '同步失败: ' + error.message });
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const renderView = () => {
    if (isInitializing) {
      return (
        <div className="flashcard-app">
          <div className="app-header">
            <button className="back-button" onClick={onBack}>
              ← 返回
            </button>
            <h2>闪卡功能</h2>
          </div>
          <div className="app-content">
            <div className="loading">
              <div>正在初始化闪卡数据...</div>
            </div>
          </div>
        </div>
      );
    }
    
    switch (activeView) {
      case 'manager':
        return <FlashcardManager onBack={() => setActiveView(null)} />;
      case 'learner':
        return <FlashcardLearner onBack={() => setActiveView(null)} />;
      case 'stats':
        return <FlashcardStats onBack={() => setActiveView(null)} />;
      default:
        return (
          <div className="flashcard-app">
            <div className="app-header">
              <button className="back-button" onClick={onBack}>
                ← 返回
              </button>
              <h2>闪卡功能</h2>
            </div>
            <div className="app-content">
              {syncStatus && (
                <div className={`sync-status sync-${syncStatus.type}`}>
                  {syncStatus.message}
                </div>
              )}
              <div className="feature-grid">
                <div
                  className="feature-card"
                  onClick={() => setActiveView('manager')}
                >
                  <h3>闪卡管理</h3>
                  <p>创建、编辑和管理你的闪卡</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveView('learner')}
                >
                  <h3>闪卡学习</h3>
                  <p>使用间隔重复算法进行高效学习</p>
                </div>
                <div
                  className="feature-card"
                  onClick={() => setActiveView('stats')}
                >
                  <h3>学习统计</h3>
                  <p>查看学习进度和历史记录</p>
                </div>
                {isLoggedIn() && (
                  <div
                    className="feature-card sync-card"
                    onClick={handleSync}
                  >
                    <h3>同步数据</h3>
                    <p>将本地闪卡同步到云端</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return renderView();
};

export default FlashcardApp;
