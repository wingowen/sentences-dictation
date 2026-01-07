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
    
    // Extract articles - improved selectors for New Concept English 3
    const articles = [];
    
    // Try different selector strategies to find articles
    // Strategy 1: Look for main content container first
    const mainContent = $('#content, .main-content, .article-content, .post-content').first();
    
    if (mainContent.length > 0) {
      // Strategy 1a: Look for article sections within main content
      mainContent.find('section, div[class*="lesson"], div[class*="article"], h2, h3').each((index, element) => {
        const $element = $(element);
        let title = '';
        let content = '';
        
        // Check if this is a heading element
        if ($element.is('h2, h3')) {
          title = $element.text().trim();
          // Get content from following sibling elements
          let nextElement = $element.next();
          while (nextElement.length > 0 && !nextElement.is('h2, h3')) {
            content += nextElement.text() + ' ';
            nextElement = nextElement.next();
          }
        } else {
          // This is a container element
          title = $element.find('h2, h3, .title').first().text().trim();
          content = $element.find('p, .content').text().trim();
        }
        
        if (title && content) {
          // Split content into sentences
          const sentences = content
            .split(/[.!?]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0 && sentence.length < 200);
          
          if (sentences.length > 0) {
            articles.push({
              id: articles.length + 1,
              title: title,
              sentences: sentences
            });
          }
        }
      });
    }
    
    // Strategy 2: If no articles found, try more general approach
    if (articles.length === 0) {
      // Extract all paragraphs and filter for meaningful content
      const paragraphs = [];
      $('p').each((index, element) => {
        const text = $(element).text().trim();
        if (text.length > 50 && text.length < 1000) {
          paragraphs.push(text);
        }
      });
      
      // Group paragraphs into articles
      if (paragraphs.length > 0) {
        const sentencesPerArticle = 15;
        let currentSentences = [];
        
        paragraphs.forEach(paragraph => {
          const paraSentences = paragraph
            .split(/[.!?]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0 && sentence.length < 200);
          
          currentSentences.push(...paraSentences);
          
          // When we have enough sentences, create an article
          if (currentSentences.length >= sentencesPerArticle) {
            articles.push({
              id: articles.length + 1,
              title: `Lesson ${articles.length + 1}`,
              sentences: currentSentences.slice(0, sentencesPerArticle)
            });
            currentSentences = currentSentences.slice(sentencesPerArticle);
          }
        });
        
        // Add any remaining sentences as the last article
        if (currentSentences.length > 0) {
          articles.push({
            id: articles.length + 1,
            title: `Lesson ${articles.length + 1}`,
            sentences: currentSentences
          });
        }
      }
    }
    
    // Remove any articles that appear to be non-lesson content
    const filteredArticles = articles.filter(article => {
      // Filter out articles with generic titles that don't look like lessons
      const hasLessonTitle = article.title.toLowerCase().includes('lesson') || 
                           article.title.match(/\b\d+\b/);
      // Filter out articles with very short or low-quality content
      const hasQualityContent = article.sentences.length > 2 && 
                               article.sentences.some(sentence => sentence.length > 30);
      // Filter out articles that seem to be copyright or navigation content
      const isNotCopyright = !article.title.toLowerCase().includes('copyright') && 
                            !article.title.toLowerCase().includes('©') &&
                            !article.sentences.some(s => s.toLowerCase().includes('copyright') || 
                                                          s.toLowerCase().includes('正版') ||
                                                          s.toLowerCase().includes('购买'));
      return hasLessonTitle && hasQualityContent && isNotCopyright;
    });
    
    // Use filtered articles
    const finalArticles = filteredArticles;
    
    const result = {
      success: true,
      articles: finalArticles,
      totalArticles: finalArticles.length
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
