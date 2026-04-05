import React, { useState, useEffect, useCallback } from 'react';
import * as flashcardService from '../services/flashcardService';
import * as spacedRepetitionService from '../services/spacedRepetitionService';
import LoadingIndicator from './LoadingIndicator';

const processEnglishText = (text, showComplete) => {
  if (showComplete) {
    return text;
  }
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match, content) => {
    const contentLength = content.trim().length;
    return '_'.repeat(Math.max(3, contentLength));
  });
};

const FlashcardLearner = ({ onBack }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0
  });

  const loadFlashcards = useCallback(async () => {
    setIsLoading(true);
    try {
      let dueFlashcards = await flashcardService.getFlashcardsForReview();
      if (dueFlashcards.length > 0) {
        const sortedFlashcards = spacedRepetitionService.sortFlashcardsByPriority(dueFlashcards);
        setFlashcards(sortedFlashcards);
        setCurrentFlashcard(sortedFlashcards[0]);
        setLearningProgress(0);
        setStats({ correct: 0, total: 0 });
      } else {
        const allFlashcards = await flashcardService.getAllFlashcards();
        if (allFlashcards.length > 0) {
          const sortedFlashcards = spacedRepetitionService.sortFlashcardsByPriority(allFlashcards);
          setFlashcards(sortedFlashcards);
          setCurrentFlashcard(sortedFlashcards[0]);
          setLearningProgress(0);
          setStats({ correct: 0, total: 0 });
        }
      }
    } catch (error) {
      console.error('加载闪卡失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const handleResponse = async (quality) => {
    if (!currentFlashcard) return;

    const updatedParams = spacedRepetitionService.updateSpacedRepetitionParams(
      currentFlashcard, 
      quality
    );
    
    await flashcardService.updateFlashcard(currentFlashcard.id, updatedParams);
    
    const correct = quality >= 2;
    await flashcardService.addLearningRecord(currentFlashcard.id, correct);
    
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    
    const nextIndex = flashcards.findIndex(f => f.id === currentFlashcard.id) + 1;
    if (nextIndex < flashcards.length) {
      setCurrentFlashcard(flashcards[nextIndex]);
      setLearningProgress(nextIndex / flashcards.length);
      setShowAnswer(false);
    } else {
      setCurrentFlashcard(null);
      setLearningProgress(1);
    }
  };

  const handleSkip = () => {
    const nextIndex = flashcards.findIndex(f => f.id === currentFlashcard.id) + 1;
    if (nextIndex < flashcards.length) {
      setCurrentFlashcard(flashcards[nextIndex]);
      setLearningProgress(nextIndex / flashcards.length);
      setShowAnswer(false);
    } else {
      setCurrentFlashcard(null);
      setLearningProgress(1);
    }
  };

  const handleRestart = () => {
    loadFlashcards();
  };

  if (isLoading) {
    return (
      <div className="flashcard-learner">
        <div className="learner-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>闪卡学习</h2>
        </div>
        <div className="loading-state">
          <LoadingIndicator
            message="加载闪卡中..."
            type="spinner"
            size="medium"
          />
        </div>
      </div>
    );
  }

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
