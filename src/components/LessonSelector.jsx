import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { DATA_SOURCE_TYPES } from '../services/dataService';

const LessonSelector = ({ onBack }) => {
  const {
    selectedLesson,
    setSelectedLesson,
    setShowLessonSelector,
    dataSource,
    rawArticles,
    sentencesLoading,
    getStoredProgress,
    setCurrentIndex
  } = useApp() || {};

  const [lessons, setLessons] = useState([]);
  const [showProgressHint, setShowProgressHint] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);
  const [pendingLesson, setPendingLesson] = useState(null);

  // 当 rawArticles 变化时，确保清除旧的选择状态
  useEffect(() => {
    // 切换数据源时，先清除当前选择
    if (selectedLesson && rawArticles) {
      const currentLessonId = selectedLesson.lesson_id;
      const existsInNewList = rawArticles.some(a => a.lesson_id === currentLessonId);
      // 如果当前选择的 lesson_id 不在新列表中，清除选择
      if (!existsInNewList) {
        console.log('[LessonSelector] Clearing stale selection:', currentLessonId);
        if (setSelectedLesson) setSelectedLesson(null);
      }
    }
  }, [rawArticles, selectedLesson, setSelectedLesson]);

  useEffect(() => {
    if (rawArticles && rawArticles.length > 0) {
      const lessonList = rawArticles.map((article, index) => ({
        lesson_id: article.lesson_id || `lesson-${index + 1}`,
        lesson_number: `Lesson ${index + 1}`,
        title: article.title || `第 ${index + 1} 课`,
        sentences: article.sentences || []
      }));
      setLessons(lessonList);
      console.log('[LessonSelector] Lessons loaded:', lessonList.length, 'dataSource:', dataSource);
    } else if (rawArticles && rawArticles.length === 0) {
      // 数据源切换但新数据还没加载，清空 lessons
      setLessons([]);
    }
  }, [rawArticles, dataSource]);

  const handleSelectLesson = (lesson) => {
    console.log('[LessonSelector] Selecting lesson:', lesson);
    
    // 检测是否有历史进度
    const progress = getStoredProgress ? getStoredProgress(dataSource, lesson.lesson_id) : null;
    
    if (progress && progress.currentIndex > 0) {
      // 有进度，显示提示让用户选择
      setProgressInfo(progress);
      setPendingLesson(lesson);
      setShowProgressHint(true);
    } else {
      // 无进度，直接设置课程
      if (setSelectedLesson) setSelectedLesson(lesson);
      if (setShowLessonSelector) setShowLessonSelector(false);
    }
  };

  const handleContinue = () => {
    if (setSelectedLesson && pendingLesson && setCurrentIndex) {
      setSelectedLesson(pendingLesson);
      setCurrentIndex(progressInfo.currentIndex);
    }
    if (setShowLessonSelector) setShowLessonSelector(false);
  };

  const handleRestart = () => {
    if (setSelectedLesson && pendingLesson) {
      setSelectedLesson(pendingLesson);
      // 从第一句开始
    }
    if (setShowLessonSelector) setShowLessonSelector(false);
  };

  const closeProgressHint = () => {
    setShowProgressHint(false);
    setProgressInfo(null);
    setPendingLesson(null);
  };

  const handleBackClick = () => {
    if (onBack) onBack();
  };

  const bookTitleMap = {
    [DATA_SOURCE_TYPES.NEW_CONCEPT_1]: '新概念英语第一册',
    [DATA_SOURCE_TYPES.NEW_CONCEPT_2]: '新概念英语第二册',
    [DATA_SOURCE_TYPES.NEW_CONCEPT_3]: '新概念英语第三册',
  };
  const bookTitle = bookTitleMap[dataSource] || '新概念英语';

  if (sentencesLoading && (!rawArticles || rawArticles.length === 0)) {
    return (
      <div className="lesson-selector">
        <div className="lesson-selector-header">
          <button className="lesson-back-btn" onClick={handleBackClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回</span>
          </button>
          <h2 className="lesson-selector-title">{bookTitle} - 选择课文</h2>
        </div>
        <div className="lesson-list">
          <div className="loading-message">正在加载课文列表...</div>
        </div>
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="lesson-selector">
        <div className="lesson-selector-header">
          <button className="lesson-back-btn" onClick={handleBackClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>返回</span>
          </button>
          <h2 className="lesson-selector-title">{bookTitle} - 选择课文</h2>
        </div>
        <div className="lesson-list">
          <div className="no-lessons-message">暂无可用课文，请检查网络连接或稍后重试</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-selector">
      <div className="lesson-selector-header">
        <button className="lesson-back-btn" onClick={handleBackClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>返回</span>
        </button>
        <h2 className="lesson-selector-title">{bookTitle} - 选择课文</h2>
      </div>

      {/* 进度提示 */}
      {showProgressHint && progressInfo && (
        <div className="progress-hint" style={{
          margin: '12px',
          padding: '16px',
          background: '#e8f4fd',
          borderRadius: '8px',
          border: '1px solid #b3d7f5'
        }}>
          <p style={{ margin: '0 0 12px 0', color: '#333', fontSize: '14px' }}>
            上次学到第 {progressInfo.currentIndex + 1} 句/共 {progressInfo.total} 句
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleContinue}
              style={{
                padding: '8px 16px',
                background: '#00247D',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              继续
            </button>
            <button
              onClick={handleRestart}
              style={{
                padding: '8px 16px',
                background: '#fff',
                color: '#00247D',
                border: '1px solid #00247D',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              重新开始
            </button>
            <button
              onClick={closeProgressHint}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                color: '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: 'auto'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="lesson-list">
        {lessons.map((lesson, index) => (
          <button
            key={`${dataSource}-${lesson.lesson_id}-${index}`}
            className={`lesson-item ${selectedLesson?.lesson_id === lesson.lesson_id ? 'selected' : ''}`}
            onClick={() => {
              console.log('[LessonSelector] Clicked:', lesson.lesson_id, 'title:', lesson.title);
              handleSelectLesson(lesson);
            }}
          >
            <div className="lesson-info">
              <span className="lesson-number">{lesson.lesson_number}</span>
              <span className="lesson-title">{lesson.title}</span>
            </div>
            <svg className="lesson-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LessonSelector;
