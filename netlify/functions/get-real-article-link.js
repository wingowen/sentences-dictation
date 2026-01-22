// Netlify Function to get real article link from relative link
import axios from 'axios';
import * as cheerio from 'cheerio';
import { readCache, writeCache } from '../shared/cache.js';
import { validateUrl } from '../shared/url-validator.js';
import { CORS_HEADERS } from '../shared/cors.js';



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

    // 添加URL验证
    const validation = validateUrl(link);
    if (!validation.isValid) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          success: false,
          error: validation.error
        }),
        headers: CORS_HEADERS
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
