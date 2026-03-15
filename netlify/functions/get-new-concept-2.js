// Netlify Function to fetch New Concept English 2 articles
import axios from 'axios';
import * as cheerio from 'cheerio';
import { readCache, writeCache } from '../shared/cache.js';
import { CORS_HEADERS, handleCorsPreflight, validateHttpMethod } from '../shared/cors.js';

// Main handler
export async function handler(event, context) {
  const preflightResponse = handleCorsPreflight(event);
  if (preflightResponse) return preflightResponse;

  const methodError = validateHttpMethod(event, ['GET']);
  if (methodError) return methodError;

  try {
    const url = 'https://newconceptenglish.com/index.php?id=nce-2';

    const cachedData = readCache('get-new-concept-2', { url });
    if (cachedData) {
      console.log('Using cached New Concept English 2 data');
      return { statusCode: 200, body: JSON.stringify(cachedData), headers: CORS_HEADERS };
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const articles = [];

    console.log('Starting to extract New Concept 2 articles...');

    // Strategy 1: Book 2 has links like <a href="index.php?id=2-001">2-001　　Title</a>
    $('a[href*="index.php?id=2-"]').each((index, el) => {
      const linkText = $(el).text().trim();
      const linkUrl = $(el).attr('href');

      const match = linkText.match(/^(2-\d{3})\s+(.+)$/);
      if (match) {
        articles.push({
          id: articles.length + 1,
          title: `${match[1]} ${match[2]}`,
          link: linkUrl,
          sentences: []
        });
        console.log(`Parsed lesson: ${match[1]} - ${match[2]}`);
      }
    });

    console.log('Articles found:', articles.length);

    // Strategy 2: Fallback to general content extraction
    if (articles.length === 0) {
      console.log('Trying strategy 2: general content extraction...');
      const mainContent = $('main, article, .content, .container').first();
      if (mainContent.length > 0) {
        const contentText = mainContent.text().trim();
        if (contentText.length > 100) {
          const sentences = contentText
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.length < 200)
            .slice(0, 10);

          if (sentences.length > 0) {
            articles.push({ id: 1, title: 'New Concept 2 Content', sentences });
            console.log('Added general content article');
          }
        }
      }
    }

    // Filter out non-lesson content
    const finalArticles = articles.filter(article => {
      const isNotCopyright = !article.title.toLowerCase().includes('copyright') &&
                            !article.title.toLowerCase().includes('©');
      const isNotNavigation = !article.title.toLowerCase().includes('home') &&
                             !article.title.toLowerCase().includes('menu');
      const hasValidLink = article.link && article.link.length > 0;
      const hasValidTitle = article.title && article.title.length > 5;
      return isNotCopyright && isNotNavigation && hasValidLink && hasValidTitle;
    });

    if (finalArticles.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: '未能找到新概念二文章内容，请检查网页结构是否变化',
          articles: [],
          totalArticles: 0
        }),
        headers: CORS_HEADERS
      };
    }

    const result = { success: true, articles: finalArticles, totalArticles: finalArticles.length };

    writeCache('get-new-concept-2', result, { url });
    console.log('New Concept English 2 data cached successfully');

    return { statusCode: 200, body: JSON.stringify(result), headers: CORS_HEADERS };

  } catch (error) {
    console.error('Error fetching New Concept English 2:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message || 'Failed to fetch New Concept English 2 articles' }),
      headers: CORS_HEADERS
    };
  }
}
