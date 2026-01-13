// 数据服务 - 处理不同数据源的读取逻辑

// 本地JSON文件数据源
import localSentences from '../data/简单句.json';
import newConcept1Sentences from '../data/新概念一.json';
import cacheService from './cacheService';
import { getAllFlashcards } from './flashcardService';

// 数据源类型常量
export const DATA_SOURCE_TYPES = {
  LOCAL: 'local',
  NOTION: 'notion',
  NEW_CONCEPT_1: 'new-concept-1',
  NEW_CONCEPT_3: 'new-concept-3',
  FLASHCARDS: 'flashcards',
};

// 数据源配置
export const DATA_SOURCES = [
  {
    id: DATA_SOURCE_TYPES.FLASHCARDS,
    name: '闪卡模式',
    description: '使用闪卡进行单词和句子学习',
    icon: '📇',
  },
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
  {
    id: DATA_SOURCE_TYPES.NEW_CONCEPT_3,
    name: '新概念三',
    description: '从网页动态获取新概念英语第三册文章',
    icon: '📖',
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
    
    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Netlify Functions 未运行或返回了非 JSON 数据。请确保使用 `npm run netlify-dev` 启动项目。');
    }

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
  // 尝试从缓存中读取数据
  const cachedData = cacheService.readCache('getSentencesBySource', { dataSourceType });
  if (cachedData) {
    return cachedData;
  }
  
  let data;
  switch (dataSourceType) {
    case DATA_SOURCE_TYPES.NOTION:
      data = await getNotionSentences();
      break;
    case DATA_SOURCE_TYPES.NEW_CONCEPT_1:
      data = await getNewConcept1Sentences();
      break;
    case DATA_SOURCE_TYPES.NEW_CONCEPT_3:
      data = await getNewConcept3Sentences();
      break;
    case DATA_SOURCE_TYPES.FLASHCARDS:
      data = getAllFlashcards();
      break;
    case DATA_SOURCE_TYPES.LOCAL:
    default:
      data = await getLocalSentences();
      break;
  }
  
  // 缓存数据
  cacheService.writeCache('getSentencesBySource', data, { dataSourceType });
  return data;
};

/**
 * 从 Netlify Function 获取新概念三句子
 * @returns {Promise<Array>} 句子数组
 */
export const getNewConcept3Sentences = async () => {
  // 创建超时控制器
  const controller = new AbortController();
  let timeoutId = null;
  
  try {
    // 调用 Netlify Function
    const functionUrl = '/.netlify/functions/get-new-concept-3';
    
    // 设置超时
    timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    const response = await fetch(functionUrl, {
      signal: controller.signal,
    });
    
    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Netlify Functions 未运行或返回了非 JSON 数据。请确保使用 `npm run netlify-dev` 启动项目。');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.articles || data.articles.length === 0) {
      throw new Error('获取新概念三文章失败或无数据');
    }
    
    // 扁平化所有文章的句子
    const allSentences = data.articles.flatMap(article => article.sentences);
    return allSentences;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('New Concept 3 API request timeout');
      throw new Error('请求超时，请检查网络连接');
    }
    console.error('Error fetching New Concept 3 sentences:', error);
    throw error;
  } finally {
    // 确保清理超时，无论成功还是失败
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
};

/**
 * 获取本地资源列表
 * @returns {Array} 本地资源列表
 */
export const getLocalResources = () => {
  return [
    {
      id: 'simple',
      name: '简单句',
      description: '基础简单句子练习',
      icon: '📝',
      data: localSentences
    },
    {
      id: 'new-concept-1',
      name: '新概念一',
      description: '新概念英语第一册句子',
      icon: '📚',
      data: newConcept1Sentences
    }
  ];
};

/**
 * 根据本地资源ID获取句子
 * @param {string} resourceId - 本地资源ID
 * @returns {Promise<Array>} 句子数组
 */
export const getSentencesByLocalResource = async (resourceId = 'simple') => {
  const resources = getLocalResources();
  const resource = resources.find(r => r.id === resourceId);
  if (resource) {
    return Promise.resolve(resource.data);
  }
  return Promise.resolve(localSentences);
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