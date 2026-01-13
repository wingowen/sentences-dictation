import React, { useState } from 'react';
import FlashcardManager from './FlashcardManager';
import FlashcardLearner from './FlashcardLearner';
import FlashcardStats from './FlashcardStats';

const FlashcardApp = ({ onBack }) => {
  const [activeView, setActiveView] = useState(null); // manager, learner, stats

  const renderView = () => {
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
              <div className="feature-grid">
                <div 
                  className="feature-card"
                  onClick={() => setActiveView('manager')}
                >
                  <h3>📝 闪卡管理</h3>
                  <p>创建、编辑和管理你的闪卡</p>
                </div>
                <div 
                  className="feature-card"
                  onClick={() => setActiveView('learner')}
                >
                  <h3>🎓 闪卡学习</h3>
                  <p>使用间隔重复算法进行高效学习</p>
                </div>
                <div 
                  className="feature-card"
                  onClick={() => setActiveView('stats')}
                >
                  <h3>📊 学习统计</h3>
                  <p>查看学习进度和历史记录</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderView();
};

export default FlashcardApp;