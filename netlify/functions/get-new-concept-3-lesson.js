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

    // URL 验证（相对路径直接放行）
    if (link.startsWith('http') && !validateUrl(link)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ success: false, error: 'Invalid URL' }),
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
    
    // Extract lesson content - separate English and Chinese
    console.log('Extracting lesson content...');

    let englishParagraph = '';
    const chineseParts = [];
    let foundEnglish = false;

    $('p').each((index, element) => {
      const text = $(element).text().trim();
      if (text.length < 15) return;
      if (text.includes('copyright') || text.includes('NewConceptEnglish.com')) return;
      if (/^版权/.test(text)) return;
      if (/^解析/.test(text)) return;

      const hasChinese = /[\u4e00-\u9fa5]/.test(text);
      const hasEnglish = /[a-zA-Z]{5,}/.test(text);

      if (/^\s*(英|美)\s*(n\.|v\.|adj\.|adv\.)/.test(text)) return;
      if (/^\s*英\s*$/.test(text.split('\n')[0])) return;

      if (hasEnglish && !hasChinese && text.length > 80) {
        englishParagraph = text;
        foundEnglish = true;
        return;
      }

      if (foundEnglish && hasChinese && !hasEnglish && text.length > 15) {
        if (text.startsWith('0') || (text.includes('语法') && text.includes('来看'))) return;
        chineseParts.push(text);
      }
    });

    const chineseParagraph = chineseParts.join('');

    // Split English into sentences
    const englishSentences = englishParagraph
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && /[a-zA-Z]/.test(s));

    // Split Chinese into sentences (by 。！？)
    const chineseSentences = chineseParagraph
      .split(/(?<=[。！？])/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    // Build sentences array with translations
    const sentences = englishSentences.map((en, i) => ({
      text: en,
      translation: chineseSentences[i] || ''
    }));

    console.log(`Extracted ${sentences.length} sentences with ${chineseSentences.length} translations`);

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
