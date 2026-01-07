// Netlify Function to fetch specific New Concept English 3 lesson content
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
          error: 'Lesson link is required'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow CORS
        }
      };
    }
    
    console.log(`Fetching lesson content from: ${link}`);

    // 检查缓存
    const cachedData = readCache('get-new-concept-3-lesson', { link });
    
    if (cachedData) {
      console.log('Using cached lesson data');
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow CORS
        }
      };
    }
    
    // Build full URL if needed
    const baseUrl = 'https://newconceptenglish.com';
    let fullUrl;
    if (link.startsWith('http')) {
      fullUrl = link;
    } else if (link.startsWith('/')) {
      fullUrl = `${baseUrl}${link}`;
    } else {
      fullUrl = `${baseUrl}/${link}`;
    }
    
    // Fetch the lesson page
    const response = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract lesson content
    console.log('Extracting lesson content...');
    
    // Try different strategies to find content
    let content = '';
    
    // Strategy 1: Look for main content container
    const mainContent = $('#content, .main-content, .article-content, .post-content, .entry-content, .content').first();
    if (mainContent.length > 0) {
      content = mainContent.text().trim();
      console.log('Found content in main container');
    }
    
    // Strategy 2: Look for paragraphs
    if (!content) {
      const paragraphs = [];
      $('p').each((index, element) => {
        const text = $(element).text().trim();
        if (text.length > 30) {
          paragraphs.push(text);
        }
      });
      content = paragraphs.join(' ');
      console.log('Found content in paragraphs');
    }
    
    // Extract sentences from content for dictation
    let sentences = content
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      // Filter out sentences with Chinese characters
      .filter(sentence => !/[\u4e00-\u9fa5]/.test(sentence))
      // Filter out sentences with HTML tags or special characters
      .filter(sentence => !sentence.includes('==') && !sentence.includes('!') && !sentence.includes('<') && !sentence.includes('>'))
      // Filter out sentences that are website navigation or copyright
      .filter(sentence => !sentence.toLowerCase().includes('copyright') && !sentence.toLowerCase().includes('com |') && !sentence.toLowerCase().includes('about'))
      // Filter out very short or long sentences
      .filter(sentence => sentence.length > 15 && sentence.length < 180)
      // Filter out sentences with only numbers or symbols
      .filter(sentence => /[a-zA-Z]/.test(sentence));
    
    console.log(`Extracted ${sentences.length} clean sentences from lesson`);
    
    const result = {
      success: true,
      sentences: sentences,
      totalSentences: sentences.length
    };

    // 写入缓存
    writeCache('get-new-concept-3-lesson', result, { link });
    console.log('Lesson data cached successfully');

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
    console.error('Error fetching lesson content:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch lesson content'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Allow CORS
      }
    };
  }
}
