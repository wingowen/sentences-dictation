// Netlify Function to fetch New Concept English 3 articles
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
    // URL for New Concept English 3
    const url = 'https://newconceptenglish.com/index.php?id=nce-3';

    // 检查缓存
    const cachedData = readCache('get-new-concept-3', { url });
    
    if (cachedData) {
      console.log('Using cached New Concept English 3 data');
      return {
        statusCode: 200,
        body: JSON.stringify(cachedData),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow CORS
        }
      };
    }
    
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract articles - this will need to be adjusted based on the actual webpage structure
    const articles = [];
    
    // Example structure - you may need to inspect the actual webpage to find the correct selectors
    // Look for article elements or sections containing the lessons
    $('.article, .lesson, .content').each((index, element) => {
      const title = $(element).find('h2, h3, .title').text().trim();
      if (title) {
        // Extract paragraphs or sentences
        const content = $(element).find('p, .content').text().trim();
        if (content) {
          // Split content into sentences
          const sentences = content
            .split(/[.!?]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0);
          
          if (sentences.length > 0) {
            articles.push({
              id: index + 1,
              title: title,
              sentences: sentences
            });
          }
        }
      }
    });
    
    // If no articles found with the above selectors, try a more general approach
    if (articles.length === 0) {
      // Extract all text and split into sentences
      const allText = $('body').text().trim();
      const allSentences = allText
        .split(/[.!?]+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0 && sentence.length < 200); // Filter out very long sentences
      
      // Group sentences into pseudo-articles
      if (allSentences.length > 0) {
        const pseudoArticles = [];
        const sentencesPerArticle = 10;
        
        for (let i = 0; i < allSentences.length; i += sentencesPerArticle) {
          pseudoArticles.push({
            id: pseudoArticles.length + 1,
            title: `Lesson ${pseudoArticles.length + 1}`,
            sentences: allSentences.slice(i, i + sentencesPerArticle)
          });
        }
        
        articles.push(...pseudoArticles);
      }
    }
    
    const result = {
      success: true,
      articles: articles,
      totalArticles: articles.length
    };

    // 写入缓存
    writeCache('get-new-concept-3', result, { url });
    console.log('New Concept English 3 data cached successfully');

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
    console.error('Error fetching New Concept English 3:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch New Concept English 3 articles'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Allow CORS
      }
    };
  }
}
