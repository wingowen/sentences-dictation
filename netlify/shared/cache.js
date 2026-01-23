// Shared cache service for Netlify functions
const DEFAULT_CACHE_TTL = 3600000; // 1 hour

// In-memory cache for serverless functions
const cache = new Map();

// Generate cache key
const generateCacheKey = (functionName, params = {}) => {
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  let key = `${functionName}_${Buffer.from(paramsStr).toString('base64')}`;
  // Replace problematic characters
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
};

// Read from cache
const readCache = (functionName, params = {}) => {
  try {
    const key = generateCacheKey(functionName, params);
    const cacheData = cache.get(key);

    if (!cacheData) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - cacheData.timestamp > (cacheData.ttl || DEFAULT_CACHE_TTL)) {
      cache.delete(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

// Write to cache
const writeCache = (functionName, data, params = {}, ttl = DEFAULT_CACHE_TTL) => {
  try {
    const key = generateCacheKey(functionName, params);
    const cacheData = {
      timestamp: Date.now(),
      ttl,
      data
    };

    cache.set(key, cacheData);
    return true;
  } catch (error) {
    console.error('Error writing cache:', error);
    return false;
  }
};

export { readCache, writeCache, generateCacheKey };