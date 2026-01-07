import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 缓存目录路径
const CACHE_DIR = path.join(path.dirname(__dirname), '.cache');

// 默认缓存过期时间（毫秒）
const DEFAULT_CACHE_TTL = 3600000; // 1小时

// 确保缓存目录存在
const ensureCacheDir = () => {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
};

// 生成缓存键
const generateCacheKey = (functionName, params = {}) => {
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  const key = `${functionName}_${Buffer.from(paramsStr).toString('base64')}`;
  // 替换可能导致文件系统问题的字符
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
};

// 生成文件路径
const getCacheFilePath = (key) => {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${key}.json`);
};

// 读取缓存
const readCache = (functionName, params = {}) => {
  try {
    const key = generateCacheKey(functionName, params);
    const filePath = getCacheFilePath(key);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const cache = JSON.parse(data);
    
    // 检查缓存是否过期
    const now = Date.now();
    if (now - cache.timestamp > (cache.ttl || DEFAULT_CACHE_TTL)) {
      // 删除过期缓存
      fs.unlinkSync(filePath);
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
    const key = generateCacheKey(functionName, params);
    const filePath = getCacheFilePath(key);
    
    const cache = {
      timestamp: Date.now(),
      ttl,
      data
    };
    
    fs.writeFileSync(filePath, JSON.stringify(cache, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing cache:', error);
    return false;
  }
};

// 清除特定函数的缓存
const clearCache = (functionName) => {
  try {
    ensureCacheDir();
    const files = fs.readdirSync(CACHE_DIR);
    
    files.forEach(file => {
      if (file.startsWith(`${functionName}_`)) {
        const filePath = path.join(CACHE_DIR, file);
        fs.unlinkSync(filePath);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// 清除所有缓存
const clearAllCache = () => {
  try {
    ensureCacheDir();
    const files = fs.readdirSync(CACHE_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(CACHE_DIR, file);
        fs.unlinkSync(filePath);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

// 检查文件是否有变更（用于检测函数代码变更）
const getFileHash = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    // 简单的哈希生成
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
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
