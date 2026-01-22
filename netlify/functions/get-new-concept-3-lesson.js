// Netlify Function to fetch specific New Concept English 3 lesson content
import axios from 'axios';
import * as cheerio from 'cheerio';
import { readCache, writeCache } from '../shared/cache.js';
import { validateUrl } from '../shared/url-validator.js';
import { CORS_HEADERS } from '../shared/cors.js';



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
