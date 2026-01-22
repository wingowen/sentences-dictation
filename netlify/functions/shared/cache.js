// netlify/functions/shared/cache.js
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const DEFAULT_CACHE_TTL = 3600000; // 1小时

/**
 * 确保缓存目录存在
 */
export function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * 生成缓存键
 */
export function generateCacheKey(functionName, params = {}) {
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  const key = `${functionName}_${Buffer.from(paramsStr).toString('base64')}`;
  // 替换可能导致文件系统问题的字符
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * 生成文件路径
 */
export function getCacheFilePath(key) {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${key}.json`);
}

/**
 * 读取缓存
 */
export function readCache(functionName, params = {}) {
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
}

/**
 * 写入缓存
 */
export function writeCache(functionName, data, params = {}, ttl = DEFAULT_CACHE_TTL) {
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
}