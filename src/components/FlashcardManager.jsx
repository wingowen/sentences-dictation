import React, { useState, useEffect } from 'react';
import * as flashcardService from '../services/flashcardService';
import FlashcardImporter from './FlashcardImporter';

const FlashcardManager = ({ onBack }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '默认',
    tags: '',
    difficulty: 3
  });

  const loadFlashcards = () => {
    const allFlashcards = flashcardService.getAllFlashcards();
    setFlashcards(allFlashcards);
  };

  const loadCategories = () => {
    const allCategories = flashcardService.getFlashcardCategories();
    setCategories(allCategories);
  };

  // 加载闪卡和分类
  useEffect(() => {
    loadFlashcards();
    loadCategories();
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 处理标签输入
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    const flashcardData = {
      ...formData,
      tags,
      difficulty: parseInt(formData.difficulty)
    };

    if (editingFlashcard) {
      // 更新闪卡
      flashcardService.updateFlashcard(editingFlashcard.id, flashcardData);
    } else {
      // 创建新闪卡
      flashcardService.createFlashcard(flashcardData);
    }

    // 重置表单
    resetForm();
    // 重新加载闪卡
    loadFlashcards();
    // 重新加载分类
    loadCategories();
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: '默认',
      tags: '',
      difficulty: 3
    });
    setEditingFlashcard(null);
    setShowForm(false);
  };

  // 编辑闪卡
  const handleEdit = (flashcard) => {
    setEditingFlashcard(flashcard);
    setFormData({
      question: flashcard.question,
      answer: flashcard.answer,
      category: flashcard.category,
      tags: flashcard.tags.join(','),
      difficulty: flashcard.difficulty
    });
    setShowForm(true);
  };

  // 删除闪卡
  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个闪卡吗？')) {
      flashcardService.deleteFlashcard(id);
      loadFlashcards();
    }
  };

  // 打开创建表单
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  // 打开导入对话框
  const handleImportClick = () => {
    setShowImporter(true);
  };

  // 处理导入完成
  const handleImportComplete = () => {
    // 重新加载闪卡和分类
    loadFlashcards();
    loadCategories();
    setShowImporter(false);
  };

  return (
    <div className="flashcard-manager">
      <div className="manager-header">
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <h2>闪卡管理</h2>
        <div className="header-buttons">
          <button className="import-button-header" onClick={handleImportClick}>
            📥 导入
          </button>
          <button className="create-button" onClick={handleCreate}>
            + 创建闪卡
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="flashcard-form">
          <h3>{editingFlashcard ? '编辑闪卡' : '创建闪卡'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>问题：</label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>答案：</label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>分类：</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>标签（用逗号分隔）：</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="例如：英语, 语法, 单词"
              />
            </div>
            <div className="form-group">
              <label>难度：</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    {level} - {level === 1 ? '非常简单' : level === 2 ? '简单' : level === 3 ? '中等' : level === 4 ? '困难' : '非常困难'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={resetForm}>
                取消
              </button>
              <button type="submit" className="submit-button">
                {editingFlashcard ? '更新' : '创建'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flashcard-list">
          <div className="list-header">
            <h3>闪卡列表 ({flashcards.length})</h3>
            <div className="filter-controls">
              <select
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    loadFlashcards();
                  } else {
                    const filtered = flashcardService.getFlashcardsByCategory(e.target.value);
                    setFlashcards(filtered);
                  }
                }}
              >
                <option value="all">所有分类</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {flashcards.length === 0 ? (
            <div className="empty-state">
              <p>还没有闪卡，点击 "创建闪卡" 开始添加</p>
            </div>
          ) : (
            <table className="flashcard-table">
              <thead>
                <tr>
                  <th>问题</th>
                  <th>答案</th>
                  <th>分类</th>
                  <th>标签</th>
                  <th>难度</th>
                  <th>下次复习</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {flashcards.map(flashcard => (
                  <tr key={flashcard.id}>
                    <td className="question-cell">{flashcard.question}</td>
                    <td className="answer-cell">{flashcard.answer}</td>
                    <td>{flashcard.category}</td>
                    <td>
                      {flashcard.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </td>
                    <td>{flashcard.difficulty}</td>
                    <td>
                      {new Date(flashcard.nextReviewDate).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(flashcard)}
                      >
                        编辑
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(flashcard.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Import Dialog */}
      {showImporter && (
        <FlashcardImporter 
          onClose={() => setShowImporter(false)}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default FlashcardManager;