/**
 * 同步服务
 * 处理本地存储与远程 Supabase 之间的数据同步
 */

import {
  getVocabularies as getRemoteVocabularies,
  addVocabulary as addRemoteVocabulary,
  updateVocabulary as updateRemoteVocabulary,
  deleteVocabulary as deleteRemoteVocabulary
} from './vocabularyService';

import {
  getLocalVocabularies,
  saveLocalVocabularies,
  getPendingSyncVocabularies,
  updateSyncStatus,
  saveSyncStatus,
  getSyncStatus
} from './localVocabularyService';

/**
 * 同步本地数据到远程
 * @returns {Promise<Object>} 同步结果
 */
export async function syncToRemote() {
  try {
    const pendingVocabularies = getPendingSyncVocabularies();
    const syncedItems = [];
    const failedItems = [];

    for (const vocab of pendingVocabularies) {
      try {
        if (vocab.id.startsWith('local_')) {
          // 新建生词
          const remoteVocab = await addRemoteVocabulary({
            word: vocab.word,
            phonetic: vocab.phonetic,
            meaning: vocab.meaning,
            part_of_speech: vocab.part_of_speech,
            sentence_context: vocab.sentence_context,
            source_sentence_id: vocab.source_sentence_id,
            source_article_id: vocab.source_article_id,
            notes: vocab.notes
          });
          
          // 更新本地ID为远程ID
          const localVocabularies = getLocalVocabularies();
          const index = localVocabularies.findIndex(v => v.id === vocab.id);
          if (index !== -1) {
            localVocabularies[index] = {
              ...localVocabularies[index],
              id: remoteVocab.id,
              sync_status: 'synced',
              synced_at: new Date().toISOString()
            };
            saveLocalVocabularies(localVocabularies);
          }
          
          syncedItems.push(remoteVocab);
        } else {
          // 更新或删除生词
          try {
            await updateRemoteVocabulary(vocab.id, {
              word: vocab.word,
              phonetic: vocab.phonetic,
              meaning: vocab.meaning,
              part_of_speech: vocab.part_of_speech,
              sentence_context: vocab.sentence_context,
              source_sentence_id: vocab.source_sentence_id,
              source_article_id: vocab.source_article_id,
              notes: vocab.notes
            });
            updateSyncStatus(vocab.id, 'synced');
            syncedItems.push(vocab);
          } catch (error) {
            // 如果更新失败，可能是因为远程数据已删除
            console.error('Update failed, checking if vocabulary exists:', error);
            failedItems.push(vocab);
          }
        }
      } catch (error) {
        console.error('Sync to remote failed for vocabulary:', vocab.id, error);
        updateSyncStatus(vocab.id, 'error');
        failedItems.push(vocab);
      }
    }

    saveSyncStatus({
      last_sync: new Date().toISOString(),
      synced: syncedItems.length,
      failed: failedItems.length
    });

    return {
      success: true,
      synced: syncedItems.length,
      failed: failedItems.length,
      syncedItems,
      failedItems
    };
  } catch (error) {
    console.error('Sync to remote failed:', error);
    saveSyncStatus({
      last_sync: new Date().toISOString(),
      error: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 同步远程数据到本地
 * @returns {Promise<Object>} 同步结果
 */
export async function syncFromRemote() {
  try {
    const remoteVocabularies = await getRemoteVocabularies({ limit: 1000 });
    const localVocabularies = getLocalVocabularies();
    const updatedItems = [];
    const newItems = [];

    // 构建本地ID映射
    const localIdMap = new Map();
    localVocabularies.forEach(vocab => {
      if (!vocab.id.startsWith('local_')) {
        localIdMap.set(vocab.id, vocab);
      }
    });

    // 处理远程数据
    for (const remoteVocab of remoteVocabularies) {
      const localVocab = localIdMap.get(remoteVocab.id);
      
      if (localVocab) {
        // 检查是否需要更新
        const localUpdatedAt = new Date(localVocab.updated_at).getTime();
        const remoteUpdatedAt = new Date(remoteVocab.updated_at).getTime();
        
        if (localVocab.sync_status === 'pending') {
          // 本地有未同步的修改，保留本地数据
          console.log('Local has pending changes, keeping local version:', localVocab.id);
        } else if (remoteUpdatedAt > localUpdatedAt) {
          // 远程数据更新，覆盖本地数据
          const index = localVocabularies.findIndex(v => v.id === remoteVocab.id);
          if (index !== -1) {
            localVocabularies[index] = {
              ...remoteVocab,
              sync_status: 'synced',
              synced_at: new Date().toISOString()
            };
            updatedItems.push(remoteVocab);
          }
        } else if (remoteUpdatedAt < localUpdatedAt) {
          // 本地数据更新时间更晚，但同步状态为synced，可能是网络延迟导致
          console.log('Local version is newer but synced, keeping local version:', localVocab.id);
        }
      } else {
        // 新的远程数据
        localVocabularies.push({
          ...remoteVocab,
          sync_status: 'synced',
          synced_at: new Date().toISOString()
        });
        newItems.push(remoteVocab);
      }
    }

    // 删除本地存在但远程不存在的数据（仅同步状态为synced的）
    const remoteIds = new Set(remoteVocabularies.map(v => v.id));
    const filteredVocabularies = localVocabularies.filter(vocab => {
      if (vocab.id.startsWith('local_')) {
        return true; // 保留本地创建但未同步的数据
      }
      return remoteIds.has(vocab.id);
    });

    saveLocalVocabularies(filteredVocabularies);

    saveSyncStatus({
      last_sync: new Date().toISOString(),
      updated: updatedItems.length,
      added: newItems.length
    });

    return {
      success: true,
      updated: updatedItems.length,
      added: newItems.length,
      updatedItems,
      newItems
    };
  } catch (error) {
    console.error('Sync from remote failed:', error);
    saveSyncStatus({
      last_sync: new Date().toISOString(),
      error: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 执行完整同步（双向）
 * @returns {Promise<Object>} 同步结果
 */
export async function syncAll() {
  try {
    // 先同步到远程，确保本地变更先上传
    const toRemoteResult = await syncToRemote();
    
    // 再同步从远程，获取最新数据
    const fromRemoteResult = await syncFromRemote();

    return {
      success: true,
      toRemote: toRemoteResult,
      fromRemote: fromRemoteResult
    };
  } catch (error) {
    console.error('Full sync failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查是否需要同步
 * @returns {boolean} 是否需要同步
 */
export function needsSync() {
  const pendingVocabularies = getPendingSyncVocabularies();
  return pendingVocabularies.length > 0;
}

/**
 * 获取同步状态
 * @returns {Object} 同步状态
 */
export function getSyncInfo() {
  const syncStatus = getSyncStatus();
  const pendingCount = getPendingSyncVocabularies().length;
  
  return {
    ...syncStatus,
    pending: pendingCount,
    lastSync: syncStatus?.timestamp || null
  };
}

export default {
  syncToRemote,
  syncFromRemote,
  syncAll,
  needsSync,
  getSyncInfo
};
