// Netlify Function to get real article link from relative link
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// 缓存目录路径
const CACHE_DIR = path.join(process.cwd(), '.cache');

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

// 构建真实的文章链接
const buildRealArticleLink = (link) => {
  const baseUrl = 'https://newconceptenglish.com';
  
  if (link.startsWith('http')) {
    // 已经是完整链接
    return link;
  } else if (link.startsWith('/')) {
    // 相对路径，直接拼接
    return `${baseUrl}${link}`;
  } else {
    // 相对路径，需要添加斜杠
    return `${baseUrl}/${link}`;
  }
};

// Main handler
export async function handler(event, context) {
  try {
    // Parse request body
    const { link } = JSON.parse(event.body || '{}');
    
    if (!link) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Link is required'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow CORS
        }
      };
    }
    
    console.log(`Processing link: ${link}`);

    // 检查缓存
    const cachedData = readCache('get-real-article-link', { link });
    
    if (cachedData) {
      console.log('Using cached real link');
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow CORS
        }
      };
    }
    
    // 构建真实的文章链接
    const realLink = buildRealArticleLink(link);
    console.log(`Real article link: ${realLink}`);
    
    // 验证链接是否有效（可选）
    let isValid = false;
    try {
      const response = await axios.head(realLink, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000
      });
      isValid = response.status >= 200 && response.status < 400;
      console.log(`Link validation status: ${isValid ? 'Valid' : 'Invalid'}`);
    } catch (error) {
      console.warn('Link validation failed:', error.message);
      // 即使验证失败，也返回构建的链接
    }
    
    const result = {
      success: true,
      originalLink: link,
      realLink: realLink,
      isValid: isValid
    };

    // 写入缓存
    writeCache('get-real-article-link', result, { link });
    console.log('Real link cached successfully');

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Allow CORS
      }
    };
    
  } catch (error) {
    console.error('Error processing link:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to process link'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Allow CORS
      }
    };
  }
}
