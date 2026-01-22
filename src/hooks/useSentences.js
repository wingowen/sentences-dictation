// src/hooks/useSentences.js
import { useState, useEffect, useCallback } from 'react';
import { getSentences, DATA_SOURCE_TYPES, getLocalResources, getSentencesByLocalResource } from '../services/dataService';

/**
 * 句子数据管理Hook
 * @param {string} initialDataSource - 初始数据源
 * @returns {Object} 句子数据和控制函数
 */
export function useSentences(initialDataSource = DATA_SOURCE_TYPES.LOCAL) {
  const [sentences, setSentences] = useState([]);
  const [currentDataSource, setCurrentDataSource] = useState(initialDataSource);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localResources, setLocalResources] = useState([]);
  const [localResourceId, setLocalResourceId] = useState('simple');

  // 加载句子数据
  const loadSentences = useCallback(async (dataSource = currentDataSource, resourceId = localResourceId) => {
    try {
      setIsLoading(true);
      setError(null);

      let data;

      if (dataSource === DATA_SOURCE_TYPES.LOCAL) {
        // 本地数据源，使用本地资源ID
        data = await getSentencesByLocalResource(resourceId);
      } else {
        // 其他数据源
        data = await getSentences(dataSource);
      }

      setSentences(data);
      setCurrentDataSource(dataSource);

      if (dataSource === DATA_SOURCE_TYPES.LOCAL) {
        setLocalResourceId(resourceId);
      }

    } catch (err) {
      console.error('Error loading sentences:', err);
      setError(err.message || '加载句子数据失败');
      setSentences([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDataSource, localResourceId]);

  // 切换数据源
  const changeDataSource = useCallback((newDataSource, resourceId = null) => {
    const resourceToUse = resourceId || (newDataSource === DATA_SOURCE_TYPES.LOCAL ? 'simple' : null);
    loadSentences(newDataSource, resourceToUse);
  }, [loadSentences]);

  // 切换本地资源
  const changeLocalResource = useCallback((resourceId) => {
    if (currentDataSource === DATA_SOURCE_TYPES.LOCAL) {
      loadSentences(DATA_SOURCE_TYPES.LOCAL, resourceId);
    }
  }, [currentDataSource, loadSentences]);

  // 重新加载当前数据
  const reload = useCallback(() => {
    loadSentences(currentDataSource, localResourceId);
  }, [loadSentences, currentDataSource, localResourceId]);

  // 初始化时加载本地资源列表
  useEffect(() => {
    const resources = getLocalResources();
    setLocalResources(resources);
  }, []);

  // 初始化时加载句子数据
  useEffect(() => {
    loadSentences(initialDataSource);
  }, [loadSentences, initialDataSource]);

  return {
    sentences,
    currentDataSource,
    localResources,
    localResourceId,
    isLoading,
    error,
    loadSentences,
    changeDataSource,
    changeLocalResource,
    reload
  };
}