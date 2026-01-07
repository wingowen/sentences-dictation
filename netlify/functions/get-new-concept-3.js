// Netlify Function to fetch New Concept English 3 articles
import axios from 'axios';
import cheerio from 'cheerio';

// Main handler
export async function handler(event, context) {
  try {
    // URL for New Concept English 3
    const url = 'https://newconceptenglish.com/index.php?id=nce-3';
    
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
    
    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        articles: articles,
        totalArticles: articles.length
      }),
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
