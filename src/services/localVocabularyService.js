/**
 * 本地存储生词服务
 * 使用 localStorage 存储生词数据
 */

const STORAGE_KEY = 'vocabulary_data';
const SYNC_STATUS_KEY = 'vocabulary_sync_status';

/**
 * 检查 localStorage 是否可用
 * @returns {boolean} localStorage 是否可用
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

const localStorageAvailable = isLocalStorageAvailable();

/**
 * 从本地存储读取生词数据
 * @returns {Array} 生词列表
 */
export function getLocalVocabularies() {
  try {
    if (!localStorageAvailable) {
      return [];
    }
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading local vocabulary data:', error);
    return [];
  }
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖处理后的函数
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 防抖保存函数
 */
const debouncedSave = debounce((key, data) => {
  try {
    if (localStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error in debounced save:', error);
  }
}, 300);

/**
 * 保存生词数据到本地存储
 * @param {Array} vocabularies 生词列表
 * @returns {boolean} 是否保存成功
 */
export function saveLocalVocabularies(vocabularies) {
  try {
    if (!localStorageAvailable) {
      console.warn('LocalStorage is not available');
      return false;
    }
    // 使用防抖保存
    debouncedSave(STORAGE_KEY, vocabularies);
    return true;
  } catch (error) {
    console.error('Error saving local vocabulary data:', error);
    return false;
  }
}

/**
 * 添加生词到本地存储
 * @param {Object} vocab 生词数据
 * @returns {Object} 添加后的生词（包含本地ID）
 */
export function addLocalVocabulary(vocab) {
  const vocabularies = getLocalVocabularies();
  const newVocab = {
    ...vocab,
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sync_status: 'pending'
  };
  vocabularies.push(newVocab);
  saveLocalVocabularies(vocabularies);
  return newVocab;
}

/**
 * 更新本地存储中的生词
 * @param {string} id 生词ID
 * @param {Object} updates 更新数据
 * @returns {Object|null} 更新后的生词
 */
export function updateLocalVocabulary(id, updates) {
  const vocabularies = getLocalVocabularies();
  const index = vocabularies.findIndex(v => v.id === id);
  
  if (index === -1) {
    return null;
  }
  
  vocabularies[index] = {
    ...vocabularies[index],
    ...updates,
    updated_at: new Date().toISOString(),
    sync_status: 'pending'
  };
  
  saveLocalVocabularies(vocabularies);
  return vocabularies[index];
}

/**
 * 从本地存储删除生词
 * @param {string} id 生词ID
 * @returns {boolean} 是否删除成功
 */
export function deleteLocalVocabulary(id) {
  const vocabularies = getLocalVocabularies();
  const filtered = vocabularies.filter(v => v.id !== id);
  
  if (filtered.length === vocabularies.length) {
    return false;
  }
  
  saveLocalVocabularies(filtered);
  return true;
}

/**
 * 获取需要同步的生词
 * @returns {Array} 需要同步的生词列表
 */
export function getPendingSyncVocabularies() {
  const vocabularies = getLocalVocabularies();
  return vocabularies.filter(v => v.sync_status === 'pending');
}

/**
 * 更新生词的同步状态
 * @param {string} id 生词ID
 * @param {string} status 同步状态 ('pending', 'synced', 'error')
 */
export function updateSyncStatus(id, status) {
  const vocabularies = getLocalVocabularies();
  const index = vocabularies.findIndex(v => v.id === id);
  
  if (index !== -1) {
    vocabularies[index].sync_status = status;
    if (status === 'synced') {
      vocabularies[index].synced_at = new Date().toISOString();
    }
    saveLocalVocabularies(vocabularies);
  }
}

/**
 * 防抖保存同步状态函数
 */
const debouncedSaveSyncStatus = debounce((status) => {
  try {
    if (localStorageAvailable) {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
        ...status,
        timestamp: new Date().toISOString()
      }));
    }
  } catch (error) {
    console.error('Error in debounced save sync status:', error);
  }
}, 500);

/**
 * 记录同步状态
 * @param {Object} status 同步状态信息
 * @returns {boolean} 是否保存成功
 */
export function saveSyncStatus(status) {
  try {
    if (!localStorageAvailable) {
      console.warn('LocalStorage is not available');
      return false;
    }
    // 使用防抖保存
    debouncedSaveSyncStatus(status);
    return true;
  } catch (error) {
    console.error('Error saving sync status:', error);
    return false;
  }
}

/**
 * 获取同步状态
 * @returns {Object|null} 同步状态信息
 */
export function getSyncStatus() {
  try {
    if (!localStorageAvailable) {
      return null;
    }
    const data = localStorage.getItem(SYNC_STATUS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading sync status:', error);
    return null;
  }
}

export default {
  getLocalVocabularies,
  saveLocalVocabularies,
  addLocalVocabulary,
  updateLocalVocabulary,
  deleteLocalVocabulary,
  getPendingSyncVocabularies,
  updateSyncStatus,
  saveSyncStatus,
  getSyncStatus
};
