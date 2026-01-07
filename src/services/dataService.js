// 数据服务 - 处理不同数据源的读取逻辑

// 本地JSON文件数据源
import localSentences from '../data/sentences.json';
import newConcept1Sentences from '../data/new-concept-1.json';

// 数据源类型常量
export const DATA_SOURCE_TYPES = {
  LOCAL: 'local',
  NOTION: 'notion',
  NEW_CONCEPT_1: 'new-concept-1',
};

// 数据源配置
export const DATA_SOURCES = [
  {
    id: DATA_SOURCE_TYPES.LOCAL,
    name: '本地数据',
    description: '使用本地 JSON 文件中的句子',
    icon: '📁',
  },
  {
    id: DATA_SOURCE_TYPES.NOTION,
    name: 'Notion',
    description: '从 Notion 页面动态获取句子',
    icon: '📝',
  },
  {
    id: DATA_SOURCE_TYPES.NEW_CONCEPT_1,
    name: '新概念一',
    description: '使用新概念英语第一册的句子',
    icon: '📚',
  },
];

/**
 * 从本地JSON文件获取句子
 * @returns {Promise<Array>} 句子数组
 */
export const getLocalSentences = async () => {
  return Promise.resolve(localSentences);
};

/**
 * 从本地JSON文件获取新概念一句子
 * @returns {Promise<Array>} 句子数组
 */
export const getNewConcept1Sentences = async () => {
  return Promise.resolve(newConcept1Sentences);
};

/**
 * 从 Netlify Function 获取 Notion 句子
 * 通过 serverless function 调用 Notion API，避免在前端暴露 API key
 * @returns {Promise<Array>} 句子数组
 */
export const getNotionSentences = async () => {
  // 创建超时控制器
  const controller = new AbortController();
  let timeoutId = null;
  
  try {
    // 调用 Netlify Function
    const functionUrl = '/.netlify/functions/get-notion-sentences';
    
    // 设置超时
    timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(functionUrl, {
      signal: controller.signal,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Notion API error:', data.error);
      throw new Error(data.message || data.error);
    }
    
    return data.sentences || [];
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Notion API request timeout');
      throw new Error('请求超时，请检查网络连接');
    }
    console.error('Error fetching Notion sentences:', error);
    throw error;
  } finally {
    // 确保清理超时，无论成功还是失败
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
};

/**
 * 根据数据源类型获取句子
 * @param {string} dataSourceType - 数据源类型 (DATA_SOURCE_TYPES)
 * @returns {Promise<Array>} 句子数组
 */
export const getSentencesBySource = async (dataSourceType = DATA_SOURCE_TYPES.LOCAL) => {
  switch (dataSourceType) {
    case DATA_SOURCE_TYPES.NOTION:
      return await getNotionSentences();
    case DATA_SOURCE_TYPES.NEW_CONCEPT_1:
      return await getNewConcept1Sentences();
    case DATA_SOURCE_TYPES.LOCAL:
    default:
      return await getLocalSentences();
  }
};

/**
 * 获取句子数据（兼容旧接口）
 * @param {string|boolean} dataSource - 数据源类型或是否使用 Notion（向后兼容）
 * @returns {Promise<Array>} 句子数组
 */
export const getSentences = async (dataSource = DATA_SOURCE_TYPES.LOCAL) => {
  // 向后兼容：如果传入 boolean，转换为数据源类型
  if (typeof dataSource === 'boolean') {
    dataSource = dataSource ? DATA_SOURCE_TYPES.NOTION : DATA_SOURCE_TYPES.LOCAL;
  }
  
  return await getSentencesBySource(dataSource);
};