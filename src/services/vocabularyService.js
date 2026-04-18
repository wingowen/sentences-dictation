/**
 * 生词本 API 服务
 * 与后端 /api/vocabulary 接口交互
 * 支持本地优先 + 异步同步模式
 */

const API_BASE = '/api/vocabulary';

// localStorage 键名
const STORAGE_KEYS = {
  VOCABULARIES: 'vocabularies_local',
  SYNC_QUEUE: 'vocabularies_sync_queue',
  LAST_SYNC_TIME: 'vocabularies_last_sync'
};

// 同步操作类型
const SYNC_OP_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  REVIEW: 'review'
};

// 同步状态
let isSyncing = false;
let syncRetryCount = 0;
const MAX_SYNC_RETRIES = 3;
const SYNC_RETRY_DELAY = 2000; // 2秒

/**
 * 生成临时 ID
 */
function generateTempId() {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 从 localStorage 加载数据
 */
function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

/**
 * 保存数据到 localStorage
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

/**
 * 获取本地生词列表
 */
function getLocalVocabularies() {
  return loadFromStorage(STORAGE_KEYS.VOCABULARIES, []);
}

/**
 * 保存本地生词列表
 */
function saveLocalVocabularies(vocabularies) {
  saveToStorage(STORAGE_KEYS.VOCABULARIES, vocabularies);
}

/**
 * 获取同步队列
 */
function getSyncQueue() {
  return loadFromStorage(STORAGE_KEYS.SYNC_QUEUE, []);
}

/**
 * 保存同步队列
 */
function saveSyncQueue(queue) {
  saveToStorage(STORAGE_KEYS.SYNC_QUEUE, queue);
}

/**
 * 添加操作到同步队列
 */
function addToSyncQueue(operation) {
  const queue = getSyncQueue();
  queue.push({
    ...operation,
    timestamp: Date.now(),
    retryCount: 0
  });
  saveSyncQueue(queue);
  
  // 触发同步
  triggerSync();
}

/**
 * 从队列中移除已完成的操作
 */
function removeFromSyncQueue(index) {
  const queue = getSyncQueue();
  queue.splice(index, 1);
  saveSyncQueue(queue);
}

/**
 * 获取认证 token
 */
function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  return !!getAuthToken();
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
    console.log('[vocabularyService] Sending data:', method, url, data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log('[vocabularyService] Response:', result);
    
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
 * 获取生词列表 - 本地优先
 */
export async function getVocabularies(params = {}) {
  // 先返回本地数据
  let localVocabs = getLocalVocabularies();
  
  // 异步从服务器拉取最新数据
  if (isLoggedIn()) {
    try {
      const serverData = await request('GET', '', null, params);
      const serverVocabs = serverData.items || [];
      
      // 合并数据：本地数据优先
      const mergedVocabs = mergeVocabularies(localVocabs, serverVocabs);
      saveLocalVocabularies(mergedVocabs);
      localVocabs = mergedVocabs;
    } catch (error) {
      console.error('[vocabularyService] Failed to fetch from server:', error);
      // 如果服务器请求失败，继续使用本地数据
    }
  }
  
  return localVocabs;
}

/**
 * 合并本地和服务器数据 - 本地优先
 */
function mergeVocabularies(localVocabs, serverVocabs) {
  const vocabMap = new Map();
  
  // 先添加服务器数据
  serverVocabs.forEach(vocab => {
    if (vocab.id) {
      vocabMap.set(vocab.id.toString(), vocab);
    }
  });
  
  // 再添加本地数据，覆盖服务器数据（本地优先）
  localVocabs.forEach(vocab => {
    if (vocab.id) {
      vocabMap.set(vocab.id.toString(), vocab);
    }
  });
  
  return Array.from(vocabMap.values());
}

/**
 * 添加生词 - 本地优先 + 异步同步
 */
export async function addVocabulary(vocab) {
  // 1. 生成临时 ID
  const tempId = generateTempId();
  const newVocab = {
    ...vocab,
    id: tempId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_local: true
  };
  
  // 2. 立即保存到本地
  const localVocabs = getLocalVocabularies();
  localVocabs.unshift(newVocab);
  saveLocalVocabularies(localVocabs);
  
  // 3. 异步添加到同步队列
  addToSyncQueue({
    type: SYNC_OP_TYPES.CREATE,
    tempId,
    data: vocab
  });
  
  return newVocab;
}

/**
 * 获取生词详情
 */
export async function getVocabulary(id) {
  const localVocabs = getLocalVocabularies();
  const vocab = localVocabs.find(v => v.id.toString() === id.toString());
  
  if (vocab) {
    return vocab;
  }
  
  // 本地没有，尝试从服务器获取
  if (isLoggedIn()) {
    try {
      const serverVocab = await request('GET', `/${id}`);
      // 保存到本地
      const updatedLocalVocabs = getLocalVocabularies();
      updatedLocalVocabs.push(serverVocab);
      saveLocalVocabularies(updatedLocalVocabs);
      return serverVocab;
    } catch (error) {
      console.error('[vocabularyService] Failed to fetch vocab from server:', error);
    }
  }
  
  throw new Error('Vocabulary not found');
}

/**
 * 更新生词 - 本地优先 + 异步同步
 */
export async function updateVocabulary(id, vocab) {
  // 1. 立即更新本地数据
  const localVocabs = getLocalVocabularies();
  const index = localVocabs.findIndex(v => v.id.toString() === id.toString());
  
  if (index === -1) {
    throw new Error('Vocabulary not found');
  }
  
  const updatedVocab = {
    ...localVocabs[index],
    ...vocab,
    updated_at: new Date().toISOString()
  };
  
  localVocabs[index] = updatedVocab;
  saveLocalVocabularies(localVocabs);
  
  // 2. 异步添加到同步队列
  addToSyncQueue({
    type: SYNC_OP_TYPES.UPDATE,
    id,
    data: vocab
  });
  
  return updatedVocab;
}

/**
 * 删除生词 - 本地优先 + 异步同步
 */
export async function deleteVocabulary(id) {
  // 1. 立即从本地删除
  const localVocabs = getLocalVocabularies();
  const filteredVocabs = localVocabs.filter(v => v.id.toString() !== id.toString());
  saveLocalVocabularies(filteredVocabs);
  
  // 2. 异步添加到同步队列
  addToSyncQueue({
    type: SYNC_OP_TYPES.DELETE,
    id
  });
  
  return { success: true };
}

/**
 * 标记复习 - 本地优先 + 异步同步
 */
export async function reviewVocabulary(id, is_correct, next_review_days = null) {
  // 1. 立即更新本地数据
  const localVocabs = getLocalVocabularies();
  const index = localVocabs.findIndex(v => v.id.toString() === id.toString());
  
  if (index !== -1) {
    localVocabs[index] = {
      ...localVocabs[index],
      last_reviewed_at: new Date().toISOString(),
      review_count: (localVocabs[index].review_count || 0) + 1,
      correct_count: (localVocabs[index].correct_count || 0) + (is_correct ? 1 : 0)
    };
    saveLocalVocabularies(localVocabs);
  }
  
  // 2. 异步添加到同步队列
  addToSyncQueue({
    type: SYNC_OP_TYPES.REVIEW,
    id,
    data: { is_correct, next_review_days }
  });
  
  return { success: true };
}

/**
 * 触发同步
 */
function triggerSync() {
  if (isSyncing) {
    return;
  }
  
  syncRetryCount = 0;
  processSyncQueue();
}

/**
 * 处理同步队列
 */
async function processSyncQueue() {
  if (!isLoggedIn()) {
    console.log('[vocabularyService] Not logged in, skipping sync');
    return;
  }
  
  const queue = getSyncQueue();
  if (queue.length === 0) {
    console.log('[vocabularyService] Sync queue is empty');
    return;
  }
  
  isSyncing = true;
  console.log('[vocabularyService] Starting sync, queue length:', queue.length);
  
  for (let i = 0; i < queue.length; i++) {
    const operation = queue[i];
    
    try {
      await processSingleOperation(operation);
      removeFromSyncQueue(i);
      i--; // 因为移除了元素，索引需要回退
      syncRetryCount = 0; // 重置重试计数
    } catch (error) {
      console.error('[vocabularyService] Sync operation failed:', operation, error);
      
      operation.retryCount = (operation.retryCount || 0) + 1;
      
      if (operation.retryCount < MAX_SYNC_RETRIES) {
        // 等待一段时间后重试
        console.log(`[vocabularyService] Retrying operation (${operation.retryCount}/${MAX_SYNC_RETRIES})...`);
        await delay(SYNC_RETRY_DELAY * operation.retryCount);
        i--; // 重新尝试当前操作
      } else {
        console.error('[vocabularyService] Max retries reached for operation:', operation);
        // 保留在队列中，下次启动时再尝试
      }
    }
  }
  
  isSyncing = false;
  console.log('[vocabularyService] Sync completed');
}

/**
 * 处理单个同步操作
 */
async function processSingleOperation(operation) {
  switch (operation.type) {
    case SYNC_OP_TYPES.CREATE:
      return await processCreateOperation(operation);
    case SYNC_OP_TYPES.UPDATE:
      return await processUpdateOperation(operation);
    case SYNC_OP_TYPES.DELETE:
      return await processDeleteOperation(operation);
    case SYNC_OP_TYPES.REVIEW:
      return await processReviewOperation(operation);
    default:
      throw new Error(`Unknown operation type: ${operation.type}`);
  }
}

/**
 * 处理创建操作
 */
async function processCreateOperation(operation) {
  const serverVocab = await request('POST', '', operation.data);
  
  // 更新本地数据，替换临时 ID
  const localVocabs = getLocalVocabularies();
  const index = localVocabs.findIndex(v => v.id === operation.tempId);
  
  if (index !== -1) {
    localVocabs[index] = {
      ...localVocabs[index],
      ...serverVocab,
      is_local: false
    };
    saveLocalVocabularies(localVocabs);
  }
  
  return serverVocab;
}

/**
 * 处理更新操作
 */
async function processUpdateOperation(operation) {
  return await request('PUT', `/${operation.id}`, operation.data);
}

/**
 * 处理删除操作
 */
async function processDeleteOperation(operation) {
  return await request('DELETE', `/${operation.id}`);
}

/**
 * 处理复习操作
 */
async function processReviewOperation(operation) {
  return await request('POST', '', {
    action: 'review',
    id: operation.id,
    ...operation.data
  });
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 设置认证 token
 */
export function setAuthToken(token) {
  localStorage.setItem('auth_token', token);
  // 登录后触发同步
  setTimeout(() => triggerSync(), 1000);
}

/**
 * 清除认证 token
 */
export function clearAuthToken() {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
}

/**
 * 手动触发同步（用于测试或用户主动操作）
 */
export function forceSync() {
  triggerSync();
}

/**
 * 获取同步状态
 */
export function getSyncStatus() {
  return {
    isSyncing,
    queueLength: getSyncQueue().length
  };
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
  clearAuthToken,
  forceSync,
  getSyncStatus
};
