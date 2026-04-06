// Netlify Function to fetch New Concept English 3 articles
import { readCache, writeCache } from '../shared/cache.js';
import { CORS_HEADERS, handleCorsPreflight, validateHttpMethod } from '../shared/cors.js';

// Main handler
export async function handler(event, context) {
  // 处理 CORS 预检
  const preflightResponse = handleCorsPreflight(event);
  if (preflightResponse) return preflightResponse;

  // 验证 HTTP 方法
  const methodError = validateHttpMethod(event, ['GET']);
  if (methodError) return methodError;

  try {
    console.log('Fetching New Concept English 3 data...');

    // 检查缓存
    const cachedData = readCache('get-new-concept-3', {});
    
    if (cachedData) {
      console.log('Using cached New Concept English 3 data');
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
        headers: CORS_HEADERS
      };
    }
    
    // 从本地数据文件读取（使用 require 动态导入）
    const localDataPath = './data/new-concept-3.json';
    const localDataModule = await import(localDataPath);
    const localData = localDataModule.default;
    
    if (localData && localData.success && localData.articles && localData.articles.length > 0) {
      console.log(`Using local data: ${localData.articles.length} articles found`);
      
      const result = {
        success: true,
        articles: localData.default.articles,
        totalArticles: localData.default.articles.length
      };
      
      writeCache('get-new-concept-3', result, {});
      console.log('New Concept English 3 data cached successfully');
      
      return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: CORS_HEADERS
      };
    }
    
    // 如果本地数据不存在，返回错误
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        error: '本地数据不存在',
        articles: [],
        totalArticles: 0
      }),
      headers: CORS_HEADERS
    };
    
  } catch (error) {
    console.error('Error fetching New Concept English 3:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch New Concept English 3 articles'
      }),
      headers: CORS_HEADERS
    };
  }
}
