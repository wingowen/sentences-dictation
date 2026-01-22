// netlify/functions/shared/cors.js
/**
 * CORS配置
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * 检查并处理OPTIONS预检请求
 * @param {Object} event - Lambda事件对象
 * @returns {Object|null} OPTIONS响应或null
 */
export function handleCorsPreflight(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }
  return null;
}

/**
 * 验证HTTP方法
 * @param {Object} event - Lambda事件对象
 * @param {string[]} allowedMethods - 允许的方法数组
 * @returns {Object|null} 405响应或null
 */
export function validateHttpMethod(event, allowedMethods) {
  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Method not allowed',
        allowedMethods
      })
    };
  }
  return null;
}