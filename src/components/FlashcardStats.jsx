import React, { useState, useEffect, useCallback } from 'react';
import * as flashcardService from '../services/flashcardService';

const FlashcardStats = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const flashcardStats = await flashcardService.getFlashcardStats();
      setStats(flashcardStats);

      const allHistory = await flashcardService.getLearningHistory();
      const now = new Date();
      let filteredHistory;

      switch (selectedPeriod) {
        case 'day':
          filteredHistory = allHistory.filter(record => {
            return new Date(record.timestamp).toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredHistory = allHistory.filter(record => {
            return new Date(record.timestamp) >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredHistory = allHistory.filter(record => {
            return new Date(record.timestamp) >= monthAgo;
          });
          break;
        case 'all':
          filteredHistory = allHistory;
          break;
        default:
          filteredHistory = allHistory;
      }

      filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(filteredHistory);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPeriodStats = () => {
    const correct = history.filter(record => record.correct).length;
    const total = history.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, total, accuracy };
  };

  const periodStats = getPeriodStats();

  if (isLoading) {
    return (
      <div className="flashcard-stats">
        <div className="stats-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>闪卡统计</h2>
        </div>
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flashcard-stats">
        <div className="stats-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>闪卡统计</h2>
        </div>
        <div className="empty-state">
          <p>暂无统计数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-stats">
      <div className="stats-header">
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <h2>闪卡统计</h2>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>总闪卡数</h3>
          <p className="stat-value">{stats.totalFlashcards}</p>
        </div>
        <div className="stat-card">
          <h3>待复习</h3>
          <p className="stat-value">{stats.dueFlashcards}</p>
        </div>
        <div className="stat-card">
          <h3>今日学习</h3>
          <p className="stat-value">{stats.todayTotal}</p>
        </div>
        <div className="stat-card">
          <h3>今日正确率</h3>
          <p className="stat-value">{stats.todayAccuracy}%</p>
        </div>
      </div>

      <div className="period-stats">
        <h3>学习记录</h3>
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'day' ? 'active' : ''}
            onClick={() => setSelectedPeriod('day')}
          >
            今日
          </button>
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            本周
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            本月
          </button>
          <button 
            className={selectedPeriod === 'all' ? 'active' : ''}
            onClick={() => setSelectedPeriod('all')}
          >
            全部
          </button>
        </div>
        
        <div className="period-stats-details">
          <div className="detail-item">
            <span>正确次数：</span>
            <strong>{periodStats.correct}</strong>
          </div>
          <div className="detail-item">
            <span>总次数：</span>
            <strong>{periodStats.total}</strong>
          </div>
          <div className="detail-item">
            <span>正确率：</span>
            <strong>{periodStats.accuracy}%</strong>
          </div>
        </div>
      </div>

      <div className="category-stats">
        <h3>分类统计</h3>
        {Object.keys(stats.categoryStats).length === 0 ? (
          <p>暂无分类数据</p>
        ) : (
          <div className="category-list">
            {Object.entries(stats.categoryStats).map(([category, count]) => (
              <div key={category} className="category-item">
                <span>{category}</span>
                <span className="category-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardStats;
