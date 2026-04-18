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
    sentencesLoading
  } = useApp() || {};

  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    if (rawArticles && rawArticles.length > 0) {
      const lessonList = rawArticles.map((article, index) => ({
        lesson_id: article.lesson_id || `lesson-${index + 1}`,
        lesson_number: `Lesson ${index + 1}`,
        title: article.title || `第 ${index + 1} 课`,
        sentences: article.sentences || []
      }));
      setLessons(lessonList);
      console.log('[LessonSelector] Lessons loaded:', lessonList.length);
    }
  }, [rawArticles, dataSource]);

  const handleSelectLesson = (lesson) => {
    console.log('[LessonSelector] Selecting lesson:', lesson);
    if (setSelectedLesson) setSelectedLesson(lesson);
    if (setShowLessonSelector) setShowLessonSelector(false);
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

      <div className="lesson-list">
        {lessons.map((lesson) => (
          <button
            key={lesson.lesson_id}
            className={`lesson-item ${selectedLesson?.lesson_id === lesson.lesson_id ? 'selected' : ''}`}
            onClick={() => handleSelectLesson(lesson)}
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
