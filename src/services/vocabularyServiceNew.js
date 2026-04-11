/**
 * 新的生词本服务
 * 统一管理本地存储和远程同步
 */

import {
  getLocalVocabularies,
  addLocalVocabulary,
  updateLocalVocabulary,
  deleteLocalVocabulary,
  saveLocalVocabularies
} from './localVocabularyService';

import {
  syncToRemote,
  syncFromRemote,
  syncAll,
  needsSync,
  getSyncInfo
} from './syncService';

import {
  getVocabularies as getRemoteVocabularies,
  addVocabulary as addRemoteVocabulary,
  updateVocabulary as updateRemoteVocabulary,
  deleteVocabulary as deleteRemoteVocabulary,
  reviewVocabulary as reviewRemoteVocabulary,
  isLoggedIn,
  setAuthToken,
  clearAuthToken
} from './vocabularyService';

/**
 * 获取生词列表
 * 优先从本地存储获取，同时触发后台同步
 * @param {Object} params - 查询参数
 */
export async function getVocabularies(params = {}) {
  try {
    // 从本地存储获取数据
    const localVocabularies = getLocalVocabularies();
    
    // 触发后台同步（不等待完成）
    if (isLoggedIn()) {
      syncAll().catch(err => console.error('Background sync failed:', err));
    }
    
    // 应用过滤和排序
    let filteredVocabularies = [...localVocabularies];
    
    // 搜索过滤
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredVocabularies = filteredVocabularies.filter(vocab => 
        vocab.word.toLowerCase().includes(searchLower) ||
        (vocab.meaning && vocab.meaning.toLowerCase().includes(searchLower)) ||
        (vocab.notes && vocab.notes.toLowerCase().includes(searchLower))
      );
    }
    
    // 已掌握过滤
    if (params.learned) {
      const isLearned = params.learned === 'true';
      filteredVocabularies = filteredVocabularies.filter(vocab => 
        vocab.is_learned === isLearned
      );
    }
    
    // 排序
    if (params.order_by) {
      filteredVocabularies.sort((a, b) => {
        const aValue = a[params.order_by];
        const bValue = b[params.order_by];
        
        if (aValue < bValue) return params.order === 'desc' ? 1 : -1;
        if (aValue > bValue) return params.order === 'desc' ? -1 : 1;
        return 0;
      });
    } else {
      // 默认按更新时间倒序
      filteredVocabularies.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    
    // 分页
    if (params.page && params.limit) {
      const offset = (params.page - 1) * params.limit;
      filteredVocabularies = filteredVocabularies.slice(offset, offset + params.limit);
    } else if (params.limit) {
      filteredVocabularies = filteredVocabularies.slice(0, params.limit);
    }
    
    return filteredVocabularies;
  } catch (error) {
    console.error('Get vocabularies failed:', error);
    // 失败时尝试从远程获取
    if (isLoggedIn()) {
      try {
        return await getRemoteVocabularies(params);
      } catch (remoteError) {
        console.error('Remote get vocabularies failed:', remoteError);
        return [];
      }
    }
    return [];
  }
}

/**
 * 添加生词
 * 先保存到本地，然后异步同步到远程
 * @param {Object} vocab - 生词数据
 */
export async function addVocabulary(vocab) {
  try {
    // 保存到本地
    const newVocab = addLocalVocabulary(vocab);
    
    // 异步同步到远程
    if (isLoggedIn()) {
      syncToRemote().catch(err => console.error('Sync add failed:', err));
    }
    
    return newVocab;
  } catch (error) {
    console.error('Add vocabulary failed:', error);
    throw error;
  }
}

/**
 * 获取生词详情
 * @param {string} id - 生词ID
 */
export async function getVocabulary(id) {
  try {
    const localVocabularies = getLocalVocabularies();
    const vocab = localVocabularies.find(v => v.id === id);
    
    if (vocab) {
      return vocab;
    }
    
    // 本地没有，尝试从远程获取
    if (isLoggedIn()) {
      return await getRemoteVocabulary(id);
    }
    
    return null;
  } catch (error) {
    console.error('Get vocabulary failed:', error);
    return null;
  }
}

/**
 * 更新生词
 * 先更新本地，然后异步同步到远程
 * @param {string} id - 生词ID
 * @param {Object} vocab - 更新的数据
 */
export async function updateVocabulary(id, vocab) {
  try {
    // 更新本地
    const updatedVocab = updateLocalVocabulary(id, vocab);
    
    if (!updatedVocab) {
      // 本地更新失败，尝试从远程获取并更新
      if (isLoggedIn()) {
        try {
          const remoteVocab = await getRemoteVocabulary(id);
          if (remoteVocab) {
            const newVocab = {
              ...remoteVocab,
              ...vocab,
              updated_at: new Date().toISOString(),
              sync_status: 'pending'
            };
            const localVocabularies = getLocalVocabularies();
            const index = localVocabularies.findIndex(v => v.id === id);
            if (index !== -1) {
              localVocabularies[index] = newVocab;
              saveLocalVocabularies(localVocabularies);
              // 异步同步到远程
              syncToRemote().catch(err => console.error('Sync update failed:', err));
              return newVocab;
            }
          }
        } catch (remoteError) {
          console.error('Remote update fallback failed:', remoteError);
        }
      }
      throw new Error('Vocabulary not found');
    }
    
    // 异步同步到远程
    if (isLoggedIn()) {
      syncToRemote().catch(err => console.error('Sync update failed:', err));
    }
    
    return updatedVocab;
  } catch (error) {
    console.error('Update vocabulary failed:', error);
    throw error;
  }
}

/**
 * 删除生词
 * 先从本地删除，然后异步同步到远程
 * @param {string} id - 生词ID
 */
export async function deleteVocabulary(id) {
  try {
    // 从本地删除
    const success = deleteLocalVocabulary(id);
    
    if (!success) {
      throw new Error('Vocabulary not found');
    }
    
    // 异步同步到远程
    if (isLoggedIn()) {
      // 对于本地创建的生词，不需要删除远程
      if (!id.startsWith('local_')) {
        try {
          await deleteRemoteVocabulary(id);
        } catch (error) {
          console.error('Remote delete failed:', error);
          // 远程删除失败不影响本地操作
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Delete vocabulary failed:', error);
    throw error;
  }
}

/**
 * 标记复习
 * @param {string} id - 生词ID
 * @param {boolean} is_correct - 是否回答正确
 * @param {number} next_review_days - 下次复习天数
 */
export async function reviewVocabulary(id, is_correct, next_review_days = null) {
  try {
    // 更新本地
    const updatedVocab = updateLocalVocabulary(id, {
      is_correct,
      next_review_days,
      last_reviewed_at: new Date().toISOString()
    });
    
    if (!updatedVocab) {
      throw new Error('Vocabulary not found');
    }
    
    // 异步同步到远程
    if (isLoggedIn()) {
      try {
        await reviewRemoteVocabulary(id, is_correct, next_review_days);
      } catch (error) {
        console.error('Remote review failed:', error);
        // 远程复习失败不影响本地操作
      }
    }
    
    return updatedVocab;
  } catch (error) {
    console.error('Review vocabulary failed:', error);
    throw error;
  }
}

/**
 * 执行同步
 * @returns {Promise<Object>} 同步结果
 */
export async function syncVocabularies() {
  if (!isLoggedIn()) {
    return { success: false, error: 'Not logged in' };
  }
  
  return await syncAll();
}

/**
 * 获取同步状态
 * @returns {Object} 同步状态
 */
export function getSyncStatus() {
  return getSyncInfo();
}

/**
 * 检查是否需要同步
 * @returns {boolean} 是否需要同步
 */
export function isSyncNeeded() {
  return needsSync();
}

// 导出原有方法
export {
  isLoggedIn,
  setAuthToken,
  clearAuthToken
};

export default {
  getVocabularies,
  addVocabulary,
  getVocabulary,
  updateVocabulary,
  deleteVocabulary,
  reviewVocabulary,
  syncVocabularies,
  getSyncStatus,
  isSyncNeeded,
  isLoggedIn,
  setAuthToken,
  clearAuthToken
};
