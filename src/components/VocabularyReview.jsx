import React, { useState, useEffect, useCallback } from 'react';
import { getVocabularies, reviewVocabulary } from '../services/vocabularyService';

const VocabularyReview = ({ onBack, currentUser }) => {
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [reviewMode, setReviewMode] = useState('due');
  const [showModeSelector, setShowModeSelector] = useState(false);

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

  const handleModeChange = (mode) => {
    setReviewMode(mode);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ correct: 0, total: 0 });
    setIsComplete(false);
    setShowModeSelector(false);
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
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setIsComplete(true);
    }
  };

  if (!currentUser) {
    return (
      <div className="vocab-review">
        <div className="review-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>生词本复习</h2>
        </div>
        <div className="empty-state">
          <p>请先登录以使用生词本复习功能</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="vocab-review">
        <div className="review-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>生词本复习</h2>
        </div>
        <div className="loading-state">
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  const current = vocabularies[currentIndex];

  if (!current) {
    return (
      <div className="vocab-review">
        <div className="review-header">
          <button className="back-button" onClick={onBack}>
            ← 返回
          </button>
          <h2>生词本复习</h2>
        </div>
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

      <div className="review-progress">
        <div
          className="progress-bar"
          style={{ width: `${((currentIndex + 1) / vocabularies.length) * 100}%` }}
        ></div>
      </div>

      <div className="flashcard-container">
        <div className="flashcard">
          <div className="flashcard-content">
            {!showAnswer ? (
              <>
                <h3>词义：</h3>
                <p className="meaning">{current.meaning || current.word}</p>
                {current.sentence_context && (
                  <>
                    <h4>例句：</h4>
                    <p className="sentence">{current.sentence_context}</p>
                  </>
                )}
                <button
                  className="show-answer-button"
                  onClick={() => setShowAnswer(true)}
                >
                  显示答案
                </button>
              </>
            ) : (
              <>
                <h3>单词：</h3>
                <p className="word">{current.word}</p>
                {current.phonetic && (
                  <p className="phonetic">{current.phonetic}</p>
                )}
                {current.part_of_speech && (
                  <p className="pos">{current.part_of_speech}</p>
                )}
                {current.meaning && (
                  <>
                    <h4>释义：</h4>
                    <p className="meaning">{current.meaning}</p>
                  </>
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

      <div className="learning-stats">
        <p>已复习: {stats.total} / {vocabularies.length}</p>
        <p>正确率: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</p>
      </div>
    </div>
  );
};

export default VocabularyReview;
