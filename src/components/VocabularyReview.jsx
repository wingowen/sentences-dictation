import React, { useState, useEffect, useCallback } from 'react';
import { getVocabularies, reviewVocabulary } from '../services/vocabularyService';
import LoadingIndicator from './LoadingIndicator';

const VocabularyReview = ({ onBack, currentUser, showHeader = true }) => {
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [reviewMode, setReviewMode] = useState('due');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadVocabularies = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = reviewMode === 'due' 
        ? { review: 'due', limit: 50 }
        : { limit: 100 };
      const data = await getVocabularies(params);
      setVocabularies(data || []);
      if (!data || data.length === 0) {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('加载生词失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, reviewMode]);

  useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => setIsTransitioning(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const handleModeChange = (mode) => {
    setReviewMode(mode);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ correct: 0, total: 0 });
    setIsComplete(false);
    setShowModeSelector(false);
    setIsTransitioning(true);
  };

  const handleResponse = async (correct) => {
    const vocab = vocabularies[currentIndex];
    if (!vocab) return;

    try {
      await reviewVocabulary(vocab.id, correct);
    } catch (error) {
      console.error('更新复习记录失败:', error);
    }

    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    if (currentIndex < vocabularies.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      }, 200);
    } else {
      setIsComplete(true);
    }
  };

  if (!currentUser) {
    return (
      <div className="vocab-review">
        {showHeader && (
          <div className="review-header">
            <button className="back-button" onClick={onBack}>
              ← 返回
            </button>
            <h2>生词本复习</h2>
          </div>
        )}
        <div className="empty-state">
          <p>请先登录以使用生词本复习功能</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="vocab-review">
        {showHeader && (
          <div className="review-header">
            <button className="back-button" onClick={onBack}>
              ← 返回
            </button>
            <h2>生词本复习</h2>
          </div>
        )}
        <div className="vocab-review__loading">
          <LoadingIndicator 
            message="正在加载生词列表..."
            type="dots"
            size="medium"
          />
        </div>
      </div>
    );
  }

  const current = vocabularies[currentIndex];

  if (!current) {
    return (
      <div className="vocab-review">
        {showHeader && (
          <div className="review-header">
            <button className="back-button" onClick={onBack}>
              ← 返回
            </button>
            <h2>生词本复习</h2>
          </div>
        )}
        <div className="review-complete">
          {reviewMode === 'due' ? (
            <div className="mode-selector">
              <p>暂无待复习的生词</p>
              <p className="mode-hint">你可以练习所有生词来巩固记忆</p>
              <button 
                className="primary-button"
                onClick={() => handleModeChange('all')}
              >
                练习所有生词
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <p>暂无生词</p>
              <p className="mode-hint">请先添加一些生词到生词本</p>
            </div>
          )}
          <button className="secondary-button" onClick={onBack}>
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vocab-review">
      {showHeader ? (
        <div className="review-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>生词本复习</h2>
          <div className="mode-switcher">
            <button 
              className={`mode-button ${reviewMode === 'due' ? 'active' : ''}`}
              onClick={() => handleModeChange('due')}
            >
              待复习
            </button>
            <button 
              className={`mode-button ${reviewMode === 'all' ? 'active' : ''}`}
              onClick={() => handleModeChange('all')}
            >
              所有生词
            </button>
          </div>
          <div className="progress-info">
            {currentIndex + 1} / {vocabularies.length}
          </div>
        </div>
      ) : (
        <div className="review-subheader">
          <div className="mode-switcher">
            <button 
              className={`mode-button ${reviewMode === 'due' ? 'active' : ''}`}
              onClick={() => handleModeChange('due')}
            >
              待复习
            </button>
            <button 
              className={`mode-button ${reviewMode === 'all' ? 'active' : ''}`}
              onClick={() => handleModeChange('all')}
            >
              所有生词
            </button>
          </div>
          <div className="progress-info">
            {currentIndex + 1} / {vocabularies.length}
          </div>
        </div>
      )}

      <div className="review-progress">
        <div
          className="progress-bar"
          style={{ width: `${((currentIndex + 1) / vocabularies.length) * 100}%` }}
        ></div>
      </div>

      <div className={`flashcard-container ${isTransitioning ? 'card-transitioning' : ''}`} key={currentIndex}>
        <div className="flashcard">
          <div className={`flashcard-content ${showAnswer ? 'answer-visible' : 'question-visible'}`}>
            {!showAnswer ? (
              <>
                <div className="card-section">
                  <h3>词义：</h3>
                  <p className={`meaning ${!current.meaning ? 'meaning-empty' : ''}`}>
                    {current.meaning || '暂无释义'}
                  </p>
                </div>
                <div className="card-section sentence-section">
                  <h4>例句：</h4>
                  <p className={`sentence ${!current.sentence_context ? 'sentence-empty' : ''}`}>
                    {current.sentence_context || '暂无例句'}
                  </p>
                </div>
                <button
                  className="show-answer-button"
                  onClick={() => setShowAnswer(true)}
                >
                  显示答案
                </button>
              </>
            ) : (
              <>
                <div className="card-section">
                  <h3>单词：</h3>
                  <p className="word">{current.word}</p>
                </div>
                {current.phonetic && (
                  <div className="card-section">
                    <p className="phonetic">{current.phonetic}</p>
                  </div>
                )}
                {current.part_of_speech && (
                  <div className="card-section">
                    <p className="pos">{current.part_of_speech}</p>
                  </div>
                )}
                {current.meaning && (
                  <div className="card-section">
                    <h4>释义：</h4>
                    <p className="meaning">{current.meaning}</p>
                  </div>
                )}
                {current.sentence_context && (
                  <div className="card-section sentence-section">
                    <h4>例句：</h4>
                    <p className="sentence">{current.sentence_context}</p>
                  </div>
                )}
                <div className="response-buttons">
                  <button
                    className="response-button again"
                    onClick={() => handleResponse(false)}
                  >
                    忘记了
                  </button>
                  <button
                    className="response-button easy"
                    onClick={() => handleResponse(true)}
                  >
                    记住了
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`learning-stats ${stats.total > 0 ? 'updating' : ''}`}>
        <p>已复习: {stats.total} / {vocabularies.length}</p>
        <p>正确率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</p>
      </div>
    </div>
  );
};

export default VocabularyReview;