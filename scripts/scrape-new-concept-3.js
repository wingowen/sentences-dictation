// Script to scrape New Concept English 3 articles and save to local JSON
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const url = 'https://newconceptenglish.com/index.php?id=nce-3';

async function scrapeNewConcept3() {
  try {
    console.log('Starting to scrape New Concept English 3...');

    // Fetch the main page
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

      for (const row of tableRows.toArray()) {
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

            // Scrape sentences from the lesson page
            try {
              const lessonSentences = await scrapeLessonSentences(linkUrl);
              console.log(`Scraped ${lessonSentences.length} sentences for ${lessonId}`);

              // Create article with sentences included
              articles.push({
                id: articles.length + 1,
                title: `${lessonId} ${lessonTitle}`,
                link: linkUrl,
                sentences: lessonSentences
              });

              console.log(`Added lesson: ${lessonId} ${lessonTitle} with ${lessonSentences.length} sentences`);
            } catch (error) {
              console.error(`Failed to scrape sentences for ${lessonId}:`, error);
              // Add article without sentences
              articles.push({
                id: articles.length + 1,
                title: `${lessonId} ${lessonTitle}`,
                link: linkUrl,
                sentences: []
              });
            }
          }
        }
      }
    }

    console.log('Final articles found:', articles.length);
    console.log('Total sentences scraped:', articles.reduce((sum, article) => sum + article.sentences.length, 0));

    // Save to JSON file
    const result = {
      success: true,
      articles: articles,
      totalArticles: articles.length,
      lastUpdated: new Date().toISOString()
    };

    const outputPath = path.join(process.cwd(), 'src', 'data', 'new-concept-3.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Saved ${articles.length} articles to ${outputPath}`);

    return result;

  } catch (error) {
    console.error('Error scraping New Concept English 3:', error);
    throw error;
  }
}

async function scrapeLessonSentences(linkUrl) {
  try {
    // Convert relative URL to absolute URL
    const fullUrl = linkUrl.startsWith('http') ? linkUrl : `https://newconceptenglish.com/${linkUrl}`;
    console.log(`Scraping sentences from: ${fullUrl}`);

    const response = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const sentences = [];

    // Try different selectors to find content
    const contentSelectors = [
      '.lesson-content',
      '.content',
      'main',
      'article',
      '.container',
      'body'
    ];

    for (const selector of contentSelectors) {
      const content = $(selector);
      if (content.length > 0) {
        // Extract text and split into sentences
        const text = content.text().trim();

        if (text.length > 100) {
          // Split by sentence endings and clean up
          const rawSentences = text
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && s.length < 300) // Reasonable sentence length
            .filter(s => !/^\d+$/.test(s)) // Filter out pure numbers
            .filter(s => !/^[\s\-\—]+$/.test(s)) // Filter out separator lines
            .slice(0, 50); // Limit to 50 sentences per lesson

          if (rawSentences.length > 0) {
            sentences.push(...rawSentences);
            console.log(`Found ${rawSentences.length} sentences using selector: ${selector}`);
            break; // Use the first successful selector
          }
        }
      }
    }

    return sentences;

  } catch (error) {
    console.error(`Error scraping lesson ${linkUrl}:`, error);
    return [];
  }
}

// Run the scraper
scrapeNewConcept3().catch(console.error);