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
 * 从Notion公开页面获取句子
 * @param {string} notionPageUrl - Notion公开页面URL
 * @returns {Promise<Array>} 句子数组
 */
export const getNotionSentences = async (notionPageUrl) => {
  try {
    // 注意：这里使用的是Notion公开页面的HTML抓取方式
    // 在生产环境中，建议使用Notion API并通过Netlify Functions等服务端方式调用
    const response = await fetch(notionPageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch Notion page');
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 提取页面中的纯文本内容
    const textContent = doc.body.textContent || '';
    
    // 简单的句子分割逻辑（根据句号、问号、感叹号分割）
    // 注意：这是一个简化实现，实际Notion页面结构可能更复杂
    const sentences = textContent
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
    
    return sentences;
  } catch (error) {
    console.error('Error fetching Notion sentences:', error);
    return [];
  }
};

/**
 * 获取句子数据（优先从Notion获取，失败则使用本地JSON）
 * @param {string} notionPageUrl - Notion公开页面URL（可选）
 * @returns {Promise<Array>} 句子数组
 */
export const getSentences = async (notionPageUrl = '') => {
  // 如果提供了Notion URL，则尝试从Notion获取
  if (notionPageUrl) {
    const notionSentences = await getNotionSentences(notionPageUrl);
    if (notionSentences.length > 0) {
      return notionSentences;
    }
  }
  
  // 回退到本地JSON文件
  return getLocalSentences();
};