import React, { useState, useEffect, useCallback } from 'react';
import { 
  getVocabularies, 
  addVocabulary, 
  updateVocabulary, 
  deleteVocabulary,
  reviewVocabulary 
} from '../services/vocabularyService';

const VocabularyApp = ({ onBack }) => {
  const [vocabularies, setVocabularies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 新建/编辑表单状态
  const [formData, setFormData] = useState({
    word: '',
    phonetic: '',
    meaning: '',
    part_of_speech: '',
    notes: ''
  });

  // 加载生词列表
  const loadVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVocabularies({ limit: 100 });
      setVocabularies(data || []);
    } catch (err) {
      console.error('加载生词失败:', err);
      setError('加载生词失败，请确保已登录');
      // 如果未登录，显示空列表
      setVocabularies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVocabularies();
  }, [loadVocabularies]);

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.word.trim()) {
      alert('请输入单词');
      return;
    }

    try {
      if (editingId) {
        await updateVocabulary(editingId, formData);
      } else {
        await addVocabulary(formData);
      }
      
      // 重置表单并刷新列表
      setFormData({ word: '', phonetic: '', meaning: '', part_of_speech: '', notes: '' });
      setShowAddForm(false);
      setEditingId(null);
      loadVocabularies();
    } catch (err) {
      alert(err.message || '操作失败');
    }
  };

  // 删除生词
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个生词吗？')) return;
    
    try {
      await deleteVocabulary(id);
      loadVocabularies();
    } catch (err) {
      alert('删除失败');
    }
  };

  // 标记复习
  const handleReview = async (id, isCorrect) => {
    try {
      await reviewVocabulary(id, isCorrect);
      loadVocabularies();
    } catch (err) {
      console.error('复习记录失败:', err);
    }
  };

  // 编辑生词
  const handleEdit = (vocab) => {
    setFormData({
      word: vocab.word || '',
      phonetic: vocab.phonetic || '',
      meaning: vocab.meaning || '',
      part_of_speech: vocab.part_of_speech || '',
      notes: vocab.notes || ''
    });
    setEditingId(vocab.id);
    setShowAddForm(true);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setFormData({ word: '', phonetic: '', meaning: '', part_of_speech: '', notes: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="vocabulary-app">
      <div className="app-header">
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>
        <h2>📚 生词本</h2>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          + 添加生词
        </button>
      </div>

      <div className="app-content">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : vocabularies.length === 0 ? (
          <div className="empty-state">
            <p>生词本为空</p>
            <p className="hint">点击"添加生词"开始记录新单词</p>
          </div>
        ) : (
          <div className="vocabulary-list">
            {vocabularies.map(vocab => (
              <div key={vocab.id} className="vocabulary-card">
                <div className="vocab-word">
                  <span className="word">{vocab.word}</span>
                </div>
                
                {vocab.sentence_context && (
                  <div className="vocab-sentence">{vocab.sentence_context}</div>
                )}

                <div className="vocab-actions">
                  <button 
                    className="review-btn correct"
                    onClick={() => handleReview(vocab.id, true)}
                    title="认识"
                  >
                    ✓
                  </button>
                  <button 
                    className="review-btn incorrect"
                    onClick={() => handleReview(vocab.id, false)}
                    title="不认识"
                  >
                    ✗
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(vocab)}
                  >
                    编辑
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(vocab.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加/编辑表单弹窗 */}
        {showAddForm && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{editingId ? '编辑生词' : '添加生词'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>单词 *</label>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={e => setFormData({...formData, word: e.target.value})}
                    placeholder="输入单词"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>音标</label>
                  <input
                    type="text"
                    value={formData.phonetic}
                    onChange={e => setFormData({...formData, phonetic: e.target.value})}
                    placeholder="如: /əˈloʊ/"
                  />
                </div>
                <div className="form-group">
                  <label>含义</label>
                  <input
                    type="text"
                    value={formData.meaning}
                    onChange={e => setFormData({...formData, meaning: e.target.value})}
                    placeholder="中文含义"
                  />
                </div>
                <div className="form-group">
                  <label>词性</label>
                  <select
                    value={formData.part_of_speech}
                    onChange={e => setFormData({...formData, part_of_speech: e.target.value})}
                  >
                    <option value="">选择词性</option>
                    <option value="noun">名词 (n.)</option>
                    <option value="verb">动词 (v.)</option>
                    <option value="adjective">形容词 (adj.)</option>
                    <option value="adverb">副词 (adv.)</option>
                    <option value="pronoun">代词 (pron.)</option>
                    <option value="preposition">介词 (prep.)</option>
                    <option value="conjunction">连词 (conj.)</option>
                    <option value="interjection">感叹词 (int.)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>笔记</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="添加笔记..."
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                    取消
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingId ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .vocabulary-app {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .vocabulary-app .app-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .vocabulary-app .app-header h2 {
          flex: 1;
          margin: 0;
        }
        
        .vocabulary-app .add-button {
          padding: 8px 16px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .vocabulary-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .vocabulary-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        
        .vocab-word {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .vocab-word .word {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .vocab-word .phonetic {
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .vocab-word .pos {
          background: #e5e7eb;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          color: #4b5563;
        }
        
        .vocab-meaning {
          margin-top: 8px;
          color: #374151;
        }
        
        .vocab-sentence {
          margin-top: 8px;
          color: #6b7280;
          font-size: 0.9rem;
          font-style: italic;
          padding-left: 12px;
          border-left: 3px solid #e5e7eb;
        }
        
        .vocab-notes {
          margin-top: 8px;
          color: #6b7280;
          font-size: 0.9rem;
          font-style: italic;
        }
        
        .vocab-meta {
          margin-top: 12px;
          display: flex;
          gap: 12px;
          font-size: 0.85rem;
          color: #9ca3af;
        }
        
        .learned-badge {
          background: #10B981;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .vocab-actions {
          margin-top: 12px;
          display: flex;
          gap: 8px;
        }
        
        .vocab-actions button {
          padding: 4px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        
        .review-btn.correct {
          background: #10B981;
          color: white;
          border: none;
        }
        
        .review-btn.incorrect {
          background: #EF4444;
          color: white;
          border: none;
        }
        
        .edit-btn:hover {
          background: #f3f4f6;
        }
        
        .delete-btn {
          color: #EF4444;
        }
        
        .delete-btn:hover {
          background: #FEF2F2;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 24px;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
        }
        
        .modal-content h3 {
          margin-top: 0;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .cancel-btn {
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .submit-btn {
          padding: 8px 16px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        
        .empty-state .hint {
          font-size: 0.9rem;
          margin-top: 8px;
        }
        
        .error-message {
          background: #FEF2F2;
          color: #EF4444;
          padding: 12px;
          border-radius: 6px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default VocabularyApp;