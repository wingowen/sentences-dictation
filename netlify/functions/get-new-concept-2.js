const fs = require('fs');
const path = require('path');
const { readCache, writeCache } = require('../shared/cache.js');
const { CORS_HEADERS, handleCorsPreflight, validateHttpMethod } = require('../shared/cors.js');

function getDataFilePath(filename) {
  const possiblePaths = [
    path.join(__dirname, '..', 'data', filename),
    path.join(process.cwd(), 'netlify', 'data', filename),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.cwd(), 'netlify', 'data', filename);
}

export async function handler(event, context) {
  const preflightResponse = handleCorsPreflight(event);
  if (preflightResponse) return preflightResponse;

  const methodError = validateHttpMethod(event, ['GET']);
  if (methodError) return methodError;

  try {
    console.log('[get-new-concept-2] 开始获取数据...');

    const cachedData = readCache('get-new-concept-2', {});
    if (cachedData) {
      console.log('[get-new-concept-2] 使用缓存数据');
      return { statusCode: 200, body: JSON.stringify(cachedData), headers: CORS_HEADERS };
    }

    const dataPath = getDataFilePath('new-concept-2.json');
    console.log(`[get-new-concept-2] 读取文件: ${dataPath}`);

    const rawContent = fs.readFileSync(dataPath, 'utf-8');
    const localData = JSON.parse(rawContent);

    if (localData && localData.success && localData.articles && localData.articles.length > 0) {
      console.log(`[get-new-concept-2] 成功读取 ${localData.articles.length} 篇课文`);

      const result = {
        success: true,
        articles: localData.articles,
        totalArticles: localData.articles.length
      };

      writeCache('get-new-concept-2', result, {});
      console.log('[get-new-concept-2] 数据已缓存');

      return { statusCode: 200, body: JSON.stringify(result), headers: CORS_HEADERS };
    }

    console.error('[get-new-concept-2] 本地数据格式不正确或为空');
    return {
      statusCode: 404,
      body: JSON.stringify({
        success: false,
        error: '本地数据不存在或格式错误',
        articles: [],
        totalArticles: 0
      }),
      headers: CORS_HEADERS
    };

  } catch (error) {
    console.error('[get-new-concept-2] 错误:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message || 'Failed to fetch New Concept English 2 articles' }),
      headers: CORS_HEADERS
    };
  }
}
