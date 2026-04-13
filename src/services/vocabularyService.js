/**
 * 生词本 API 服务
 * 与后端 /api/vocabulary 接口交互
 */

const API_BASE = '/api/vocabulary';

/**
 * 获取认证 token
 */
function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

/**
 * 通用请求方法
 */
async function request(method, path, data = null, params = null) {
  const token = getAuthToken();
  
  let url = API_BASE + path;
  
  // 添加查询参数
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      url += '?' + queryString;
    }
  }
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || '请求失败');
    }
    
    return result.data;
  } catch (error) {
    console.error('Vocabulary API Error:', error);
    throw error;
  }
}

/**
 * 获取生词列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.search - 搜索关键词
 * @param {string} params.learned - 是否已掌握 (true/false)
 * @param {string} params.review - 待复习 (due)
 * @param {string} params.order_by - 排序字段
 * @param {string} params.order - 排序方向 (asc/desc)
 */
export async function getVocabularies(params = {}) {
  const result = await request('GET', '', null, params);
  return result.items || [];
}

/**
 * 添加生词
 * @param {Object} vocab - 生词数据
 * @param {string} vocab.word - 单词（必填）
 * @param {string} vocab.phonetic - 音标
 * @param {string} vocab.meaning - 含义
 * @param {string} vocab.part_of_speech - 词性
 * @param {string} vocab.sentence_context - 例句上下文
 * @param {number} vocab.source_sentence_id - 来源句子ID
 * @param {number} vocab.source_article_id - 来源文章ID
 * @param {string} vocab.notes - 用户笔记
 */
export async function addVocabulary(vocab) {
  return request('POST', '', vocab);
}

/**
 * 获取生词详情
 * @param {number} id - 生词ID
 */
export async function getVocabulary(id) {
  return request('GET', `/${id}`);
}

/**
 * 更新生词
 * @param {number} id - 生词ID
 * @param {Object} vocab - 更新的数据
 */
export async function updateVocabulary(id, vocab) {
  return request('PUT', `/${id}`, vocab);
}

/**
 * 删除生词
 * @param {number} id - 生词ID
 */
export async function deleteVocabulary(id) {
  return request('DELETE', `/${id}`);
}

/**
 * 标记复习
 * @param {Object} params - 复习参数
 * @param {number} params.id - 生词ID（必填）
 * @param {boolean} params.is_correct - 是否回答正确
 * @param {number} params.next_review_days - 下次复习天数（可选）
 */
export async function reviewVocabulary(id, is_correct, next_review_days = null) {
  return request('POST', '', { 
    action: 'review',
    id, 
    is_correct,
    next_review_days 
  });
}

/**
 * 检查登录状态
 */
export function isLoggedIn() {
  return !!getAuthToken();
}

/**
 * 设置认证 token
 */
export function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
}

/**
 * 清除认证 token
 */
export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
}

export default {
  getVocabularies,
  addVocabulary,
  getVocabulary,
  updateVocabulary,
  deleteVocabulary,
  reviewVocabulary,
  isLoggedIn,
  setAuthToken,
  clearAuthToken
};