// Netlify Function to fetch New Concept English 3 articles
import axios from 'axios';
import * as cheerio from 'cheerio';
import { readCache, writeCache } from '../shared/cache.js';
import { CORS_HEADERS, handleCorsPreflight, validateHttpMethod } from '../shared/cors.js';



// Main handler
export async function handler(event, context) {
  // 处理CORS预检
  const preflightResponse = handleCorsPreflight(event);
  if (preflightResponse) return preflightResponse;

  // 验证HTTP方法
  const methodError = validateHttpMethod(event, ['GET']);
  if (methodError) return methodError;

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
        headers: CORS_HEADERS
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
    
    // Extract articles - specifically targeting the courselist-table
    const articles = [];
    
    console.log('Starting to extract New Concept 3 articles...');
    
    // Strategy 1: Target the specific courselist-table
    const courseListTable = $('#courselist-table');
    console.log('Course list table found:', courseListTable.length > 0);
    
    if (courseListTable.length > 0) {
      // Extract lessons from the table
      const tableRows = courseListTable.find('tr');
      console.log('Table rows found:', tableRows.length);
      
      tableRows.each((index, row) => {
        const $row = $(row);
        const linkElement = $row.find('a');
        
        if (linkElement.length > 0) {
          const linkText = linkElement.text().trim();
          console.log(`Found lesson link: ${linkText}`);
          
          // Get the actual link URL
          const linkUrl = linkElement.attr('href');
          console.log(`Lesson link URL: ${linkUrl}`);
          
          // Parse the lesson information
          const match = linkText.match(/^(3-\d{3})\s+(.*)$/);
          if (match) {
            const lessonId = match[1];
            const lessonTitle = match[2];
            
            console.log(`Parsed lesson: ${lessonId} - ${lessonTitle}`);
            
            // Create article with link information
            articles.push({
              id: articles.length + 1,
              title: `${lessonId} ${lessonTitle}`,
              link: linkUrl,
              sentences: [] // Empty sentences array - will be filled when lesson is selected
            });
            
            console.log(`Added lesson: ${lessonId} ${lessonTitle} with link: ${linkUrl}`);
          }
        }
      });
    }
    
    console.log('After strategy 1, articles found:', articles.length);
    
    // Strategy 2: If no articles found in table, try general approach
    if (articles.length === 0) {
      console.log('Trying strategy 2: general content extraction...');
      // Extract from main content
      const mainContent = $('main, article, .content, .container').first();
      if (mainContent.length > 0) {
        const contentText = mainContent.text().trim();
        if (contentText.length > 100) {
          const sentences = contentText
            .split(/[.!?]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0 && sentence.length < 200)
            .slice(0, 10);
          
          if (sentences.length > 0) {
            articles.push({
              id: 1,
              title: 'New Concept 3 Content',
              sentences: sentences
            });
            console.log('Added general content article');
          }
        }
      }
    }
    
    console.log('Final articles found before filtering:', articles.length);
    
    // Remove any articles that appear to be non-lesson content
    const filteredArticles = articles.filter(article => {
      // For New Concept 3 lessons, we don't check sentences length
      // because content will be fetched from the link later
      const hasQualityContent = true;
      
      // Filter out articles that seem to be copyright or navigation content
      const isNotCopyright = !article.title.toLowerCase().includes('copyright') && 
                            !article.title.toLowerCase().includes('©');
      
      // Filter out articles that appear to be website navigation or headers
      const isNotNavigation = !article.title.toLowerCase().includes('home') && 
                             !article.title.toLowerCase().includes('menu') &&
                             !article.title.toLowerCase().includes('导航');
      
      // For New Concept 3, we only need valid title and link
      const hasValidLink = article.link && article.link.length > 0;
      const hasValidTitle = article.title && article.title.length > 5;
      
      return hasQualityContent && isNotCopyright && isNotNavigation && hasValidLink && hasValidTitle;
    });
    
    // Use filtered articles
    const finalArticles = filteredArticles;
    
    // Check if we have any articles
    if (finalArticles.length === 0) {
      // Return error response when no articles found
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: '未能找到新概念三文章内容，请检查网页结构是否变化',
          articles: [],
          totalArticles: 0
        }),
        headers: CORS_HEADERS
      };
    }
    
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
      headers: CORS_HEADERS
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
      headers: CORS_HEADERS
    };
  }
}
