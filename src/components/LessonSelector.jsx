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
