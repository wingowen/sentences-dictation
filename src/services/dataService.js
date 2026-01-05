// 数据服务 - 处理不同数据源的读取逻辑

// 本地JSON文件数据源
import localSentences from '../data/sentences.json';

/**
 * 从本地JSON文件获取句子
 * @returns {Array} 句子数组
 */
export const getLocalSentences = () => {
  return localSentences;
};

/**
 * 从 Netlify Function 获取 Notion 句子
 * 通过 serverless function 调用 Notion API，避免在前端暴露 API key
 * @returns {Promise<Array>} 句子数组
 */
export const getNotionSentences = async () => {
  try {
    // 调用 Netlify Function
    const functionUrl = '/.netlify/functions/get-notion-sentences';
    const response = await fetch(functionUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Notion API error:', data.error);
      return [];
    }
    
    return data.sentences || [];
  } catch (error) {
    console.error('Error fetching Notion sentences:', error);
    return [];
  }
};

/**
 * 获取句子数据（优先从Notion获取，失败则使用本地JSON）
 * @param {boolean} useNotion - 是否使用 Notion 数据源（默认 true）
 * @returns {Promise<Array>} 句子数组
 */
export const getSentences = async (useNotion = true) => {
  // 如果启用 Notion，则尝试从 Notion 获取
  if (useNotion) {
    const notionSentences = await getNotionSentences();
    if (notionSentences.length > 0) {
      return notionSentences;
    }
    console.warn('Failed to fetch from Notion, falling back to local sentences');
  }
  
  // 回退到本地JSON文件
  return getLocalSentences();
};