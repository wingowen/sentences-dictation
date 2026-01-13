import React, { useState, useEffect } from 'react';
import * as flashcardService from '../services/flashcardService';
import * as spacedRepetitionService from '../services/spacedRepetitionService';

/**
 * Processes English text to hide/show words in {{}} placeholders
 * @param {string} text - English text with {{}} placeholders
 * @param {boolean} showComplete - Whether to show complete text or hide placeholders
 * @returns {string} Processed text
 */
const processEnglishText = (text, showComplete) => {
  if (showComplete) {
    return text;
  }
  
  // Replace {{}} content with underscores of similar length
  return text.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
    // Calculate length of content without spaces
    const contentLength = content.trim().length;
    // Create underscores string (minimum 3 underscores)
    const underscores = '_'.repeat(Math.max(3, contentLength));
    return underscores;
  });
};

const FlashcardLearner = ({ onBack }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0
  });

  // 加载需要复习的闪卡
  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = () => {
    const dueFlashcards = flashcardService.getFlashcardsForReview();
    if (dueFlashcards.length > 0) {
      const sortedFlashcards = spacedRepetitionService.sortFlashcardsByPriority(dueFlashcards);
      setFlashcards(sortedFlashcards);
      setCurrentFlashcard(sortedFlashcards[0]);
      setLearningProgress(0);
      setStartTime(Date.now());
      setStats({ correct: 0, total: 0 });
    } else {
      // 没有需要复习的闪卡，加载所有闪卡按优先级排序
      const allFlashcards = flashcardService.getAllFlashcards();
      if (allFlashcards.length > 0) {
        const sortedFlashcards = spacedRepetitionService.sortFlashcardsByPriority(allFlashcards);
        setFlashcards(sortedFlashcards);
        setCurrentFlashcard(sortedFlashcards[0]);
        setLearningProgress(0);
        setStartTime(Date.now());
        setStats({ correct: 0, total: 0 });
      }
    }
  };

  // 处理用户响应
  const handleResponse = (quality) => {
    if (!currentFlashcard) return;

    // 计算响应时间
    const responseTime = Date.now() - startTime;
    
    // 更新闪卡的间隔重复参数
    const updatedParams = spacedRepetitionService.updateSpacedRepetitionParams(
      currentFlashcard, 
      quality
    );
    
    // 保存更新后的闪卡
    flashcardService.updateFlashcard(currentFlashcard.id, updatedParams);
    
    // 记录学习历史
    const correct = quality >= 2;
    flashcardService.addLearningRecord(currentFlashcard.id, correct, responseTime);
    
    // 更新统计数据
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    
    // 移动到下一个闪卡
    const nextIndex = flashcards.findIndex(f => f.id === currentFlashcard.id) + 1;
    if (nextIndex < flashcards.length) {
      setCurrentFlashcard(flashcards[nextIndex]);
      setLearningProgress(nextIndex / flashcards.length);
      setShowAnswer(false);
      setStartTime(Date.now());
    } else {
      // 学习完成
      setCurrentFlashcard(null);
      setLearningProgress(1);
    }
  };

  // 跳过当前闪卡
  const handleSkip = () => {
    const nextIndex = flashcards.findIndex(f => f.id === currentFlashcard.id) + 1;
    if (nextIndex < flashcards.length) {
      setCurrentFlashcard(flashcards[nextIndex]);
      setLearningProgress(nextIndex / flashcards.length);
      setShowAnswer(false);
      setStartTime(Date.now());
    } else {
      setCurrentFlashcard(null);
      setLearningProgress(1);
    }
  };

  // 重新开始学习
  const handleRestart = () => {
    loadFlashcards();
  };

  if (flashcards.length === 0 && !currentFlashcard) {
    return (
      <div className="flashcard-learner">
        <div className="learner-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>闪卡学习</h2>
        </div>
        <div className="empty-state">
          <p>还没有闪卡，去创建一些闪卡吧！</p>
          <button className="primary-button" onClick={onBack}>
            返回管理
          </button>
        </div>
      </div>
    );
  }

  if (!currentFlashcard) {
    return (
      <div className="flashcard-learner">
        <div className="learner-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>闪卡学习</h2>
        </div>
        <div className="learning-complete">
          <h3>学习完成！</h3>
          <div className="completion-stats">
            <p>完成了 {stats.total} 个闪卡</p>
            <p>正确率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</p>
          </div>
          <button className="primary-button" onClick={handleRestart}>
            再学一遍
          </button>
          <button className="secondary-button" onClick={onBack}>
            返回管理
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-learner">
      <div className="learner-header">
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <h2>闪卡学习</h2>
        <div className="progress-info">
          {Math.round(learningProgress * 100)}%
        </div>
      </div>

      <div className="learning-progress">
        <div 
          className="progress-bar" 
          style={{ width: `${learningProgress * 100}%` }}
        ></div>
      </div>

      <div className="flashcard-container">
        <div className="flashcard">
          <div className="flashcard-category">
            {currentFlashcard.category}
          </div>
          <div className="flashcard-content">
            {!showAnswer ? (
              <>
                <h3>问题：</h3>
                <p>{currentFlashcard.question}</p>
                <h4>填空：</h4>
                <p>{processEnglishText(currentFlashcard.answer, false)}</p>
                <button 
                  className="show-answer-button"
                  onClick={() => setShowAnswer(true)}
                >
                  显示答案
                </button>
              </>
            ) : (
              <>
                <h3>答案：</h3>
                <p>{processEnglishText(currentFlashcard.answer, true)}</p>
                <div className="difficulty-tags">
                  {currentFlashcard.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="response-buttons">
                  <button
                    className="response-button again"
                    onClick={() => handleResponse(spacedRepetitionService.RESPONSE_QUALITY.AGAIN)}
                  >
                    忘记了
                  </button>
                  <button
                    className="response-button hard"
                    onClick={() => handleResponse(spacedRepetitionService.RESPONSE_QUALITY.HARD)}
                  >
                    困难
                  </button>
                  <button
                    className="response-button good"
                    onClick={() => handleResponse(spacedRepetitionService.RESPONSE_QUALITY.GOOD)}
                  >
                    良好
                  </button>
                  <button
                    className="response-button easy"
                    onClick={() => handleResponse(spacedRepetitionService.RESPONSE_QUALITY.EASY)}
                  >
                    简单
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {showAnswer && (
          <button className="skip-button" onClick={handleSkip}>
            跳过
          </button>
        )}
      </div>

      <div className="learning-stats">
        <p>已学习: {stats.total} / {flashcards.length}</p>
        <p>正确率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</p>
      </div>
    </div>
  );
};

export default FlashcardLearner;