// 默认缓存过期时间（毫秒）
const DEFAULT_CACHE_TTL = 3600000; // 1小时

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// 生成缓存键
const generateCacheKey = (functionName, params = {}) => {
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  let key = `${functionName}_${btoa(paramsStr)}`;
  // 替换可能导致localStorage问题的字符
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
};

// 读取缓存
const readCache = (functionName, params = {}) => {
  try {
    if (!isBrowser) {
      return null;
    }
    
    const key = generateCacheKey(functionName, params);
    const cacheData = localStorage.getItem(key);
    
    if (!cacheData) {
      return null;
    }
    
    const cache = JSON.parse(cacheData);
    
    // 检查缓存是否过期
    const now = Date.now();
    if (now - cache.timestamp > (cache.ttl || DEFAULT_CACHE_TTL)) {
      // 删除过期缓存
      localStorage.removeItem(key);
      return null;
    }
    
    return cache.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

// 写入缓存
const writeCache = (functionName, data, params = {}, ttl = DEFAULT_CACHE_TTL) => {
  try {
    if (!isBrowser) {
      return false;
    }
    
    const key = generateCacheKey(functionName, params);
    const cache = {
      timestamp: Date.now(),
      ttl,
      data
    };
    
    localStorage.setItem(key, JSON.stringify(cache));
    return true;
  } catch (error) {
    console.error('Error writing cache:', error);
    return false;
  }
};

// 清除特定函数的缓存
const clearCache = (functionName) => {
  try {
    if (!isBrowser) {
      return false;
    }
    
    // 遍历localStorage中的所有键，删除与functionName相关的缓存
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${functionName}_`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// 清除所有缓存
const clearAllCache = () => {
  try {
    if (!isBrowser) {
      return false;
    }
    
    // 遍历localStorage中的所有键，删除所有缓存
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

// 检查文件是否有变更（用于检测函数代码变更）
// 注意：在浏览器环境中，这个函数可能无法正常工作
const getFileHash = (_filePath) => {
  try {
    // 在浏览器环境中，返回null
    if (isBrowser) {
      return null;
    }
    
    // 对于Node.js环境，可以添加fs模块的实现
    return null;
  } catch (error) {
    console.error('Error getting file hash:', error);
    return null;
  }
};

// 导出缓存服务
const cacheService = {
  readCache,
  writeCache,
  clearCache,
  clearAllCache,
  generateCacheKey,
  getFileHash
};

export default cacheService;
