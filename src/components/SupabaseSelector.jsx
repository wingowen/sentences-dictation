// src/components/SupabaseSelector.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseTags, getSupabaseArticles, getSupabaseSentences, DATA_SOURCE_TYPES } from '../services/dataService';

/**
 * Supabase 内容选择器组件
 * 支持按标签筛选文章，选择后获取句子
 */
const SupabaseSelector = React.memo(({
  dataSource,
  onSentencesLoad,
  onError,
  setIsLoading
}) => {
  const [tags, setTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [articles, setArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [loadingStep, setLoadingStep] = useState(null);
  
  // 使用 ref 防止重复加载
  const isInitializedRef = useRef(false);
  const lastLoadedTagIdRef = useRef(null);

  // 初始化：加载数据源时只执行一次
  useEffect(() => {
    // 只在 SUPABASE 数据源时执行
    if (dataSource !== DATA_SOURCE_TYPES.SUPABASE) {
      isInitializedRef.current = false;
      return;
    }
    
    // 防止重复初始化
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    console.log('[SupabaseSelector] 初始化加载标签');
    
    const loadInitialData = async () => {
      setLoadingStep('tags');
      setIsLoading?.(true);
      try {
        const tagsData = await getSupabaseTags();
        setTags(tagsData);
        if (tagsData.length > 0) {
          const firstTagId = tagsData[0].id;
          setSelectedTagId(firstTagId);
          
          // 立即加载第一个标签的文章
          setLoadingStep('articles');
          const articlesData = await getSupabaseArticles(firstTagId);
          setArticles(articlesData);
          lastLoadedTagIdRef.current = firstTagId;
        }
      } catch (error) {
        console.error('[SupabaseSelector] 加载失败:', error);
        onError?.(error.message || '加载数据失败');
        isInitializedRef.current = false; // 失败时允许重试
      } finally {
        setLoadingStep(null);
        setIsLoading?.(false);
      }
    };
    
    loadInitialData();
  }, [dataSource]); // 只依赖 dataSource

  // 手动切换标签时加载文章
  const handleTagChange = useCallback(async (newTagId) => {
    if (!newTagId || newTagId === lastLoadedTagIdRef.current) return;
    
    console.log('[SupabaseSelector] 切换标签:', newTagId);
    setSelectedTagId(newTagId);
    setSelectedArticleId(null);
    setLoadingStep('articles');
    setIsLoading?.(true);
    
    try {
      const articlesData = await getSupabaseArticles(newTagId);
      setArticles(articlesData);
      lastLoadedTagIdRef.current = newTagId;
    } catch (error) {
      console.error('[SupabaseSelector] 加载文章失败:', error);
      onError?.(error.message || '加载文章失败');
    } finally {
      setLoadingStep(null);
      setIsLoading?.(false);
    }
  }, [onError, setIsLoading]);

  // 加载句子
  const handleLoadSentences = useCallback(async () => {
    if (!selectedArticleId) {
      onError?.('请先选择文章');
      return;
    }
    
    console.log('[SupabaseSelector] 加载句子, articleId:', selectedArticleId);
    setLoadingStep('sentences');
    setIsLoading?.(true);
    try {
      const sentencesData = await getSupabaseSentences(selectedArticleId);
      if (sentencesData.length === 0) {
        onError?.('该文章暂无句子');
        setLoadingStep(null);
        setIsLoading?.(false);
        return;
      }
      // 转换为 App.jsx 期望的格式：字符串数组
      const sentencesText = sentencesData.map(s => s.text);
      console.log('[SupabaseSelector] 加载了', sentencesText.length, '个句子');
      onSentencesLoad?.(sentencesText);
    } catch (error) {
      console.error('[SupabaseSelector] 加载句子失败:', error);
      onError?.(error.message || '加载句子失败');
    } finally {
      setLoadingStep(null);
      setIsLoading?.(false);
    }
  }, [selectedArticleId, onSentencesLoad, onError, setIsLoading]);

  // 只在 Supabase 数据源时显示
  if (dataSource !== DATA_SOURCE_TYPES.SUPABASE) {
    return null;
  }

  const isLoading_ = loadingStep !== null;

  return (
    <div className="supabase-selector" style={{ margin: '16px 0', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
      {/* 标签选择 */}
      <div className="tag-selector" style={{ marginBottom: '12px' }}>
        <label style={{ marginRight: '8px', fontWeight: '500' }}>
          选择标签:
          <select
            value={selectedTagId || ''}
            onChange={(e) => handleTagChange(e.target.value ? parseInt(e.target.value) : null)}
            disabled={isLoading_}
            style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {loadingStep === 'tags' ? (
              <option value="">加载中...</option>
            ) : (
              <>
                <option value="">全部文章</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
      </div>

      {/* 文章选择 */}
      {articles.length > 0 && (
        <div className="article-selector" style={{ marginBottom: '12px' }}>
          <label style={{ marginRight: '8px', fontWeight: '500' }}>
            选择文章:
            <select
              value={selectedArticleId || ''}
              onChange={(e) => setSelectedArticleId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isLoading_}
              style={{ marginLeft: '8px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
            >
              <option value="">请选择文章</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>
                  {article.title} ({article.total_sentences || 0}句)
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* 加载按钮 */}
      {selectedArticleId && (
        <button
          onClick={handleLoadSentences}
          disabled={isLoading_}
          style={{
            padding: '10px 24px',
            background: isLoading_ ? '#ccc' : '#00247D',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading_ ? 'wait' : 'pointer',
            fontWeight: '500'
          }}
        >
          {loadingStep === 'sentences' ? '加载中...' : '开始练习'}
        </button>
      )}

      {/* 加载状态提示 */}
      {loadingStep && (
        <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
          {loadingStep === 'tags' && '正在加载标签...'}
          {loadingStep === 'articles' && '正在加载文章列表...'}
          {loadingStep === 'sentences' && '正在加载句子...'}
        </div>
      )}

      {/* 空状态提示 */}
      {!loadingStep && articles.length === 0 && selectedTagId && (
        <div style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
          该标签下暂无文章
        </div>
      )}
    </div>
  );
});

SupabaseSelector.displayName = 'SupabaseSelector';

export default SupabaseSelector;
