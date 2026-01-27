// Netlify Serverless Function - 从 Notion 获取句子数据
// 使用 Notion API 安全地获取数据，避免在前端暴露 API key

import { Client } from '@notionhq/client';
import { readCache, writeCache, generateCacheKey } from '../shared/cache.js';
import { CORS_HEADERS, handleCorsPreflight, validateHttpMethod } from '../shared/cors.js';



export async function handler(event, context) {
  // 处理CORS预检
  const preflightResponse = handleCorsPreflight(event);
  if (preflightResponse) return preflightResponse;

  // 验证HTTP方法
  const methodError = validateHttpMethod(event, ['GET']);
  if (methodError) return methodError;

  try {
    // 从环境变量获取 Notion API 配置
    const notionToken = process.env.NOTION_API_KEY;
    const notionPageId = process.env.NOTION_PAGE_ID;

    if (!notionToken || !notionPageId) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Notion API configuration missing',
          message: 'Please configure NOTION_API_KEY and NOTION_PAGE_ID in Netlify environment variables',
        }),
      };
    }

    // 检查缓存
    const cacheKey = generateCacheKey('get-notion-sentences', { notionPageId });
    const cachedData = readCache('get-notion-sentences', { notionPageId });
    
    if (cachedData) {
      console.log('Using cached Notion data');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cachedData),
      };
    }

    // 初始化 Notion 客户端
    const notion = new Client({
      auth: notionToken,
      timeoutMs: 60000, // 增加超时时间到 60 秒
    });

    // 获取页面内容
    const pageId = notionPageId;
    let sentences = [];

    // 尝试获取页面块内容
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    // 提取文本内容
    const extractTextFromBlock = (block) => {
      if (block.type === 'paragraph' && block.paragraph) {
        return block.paragraph.rich_text
          .map((text) => text.plain_text)
          .join('');
      }
      if (block.type === 'bulleted_list_item' && block.bulleted_list_item) {
        return block.bulleted_list_item.rich_text
          .map((text) => text.plain_text)
          .join('');
      }
      if (block.type === 'numbered_list_item' && block.numbered_list_item) {
        return block.numbered_list_item.rich_text
          .map((text) => text.plain_text)
          .join('');
      }
      if (block.type === 'heading_1' && block.heading_1) {
        return block.heading_1.rich_text
          .map((text) => text.plain_text)
          .join('');
      }
      if (block.type === 'heading_2' && block.heading_2) {
        return block.heading_2.rich_text
          .map((text) => text.plain_text)
          .join('');
      }
      if (block.type === 'heading_3' && block.heading_3) {
        return block.heading_3.rich_text
          .map((text) => text.plain_text)
          .join('');
      }
      return '';
    };

    // 处理所有块
    for (const block of blocks.results) {
      const text = extractTextFromBlock(block);
      if (text.trim()) {
        // 如果块有子块，递归处理
        if (block.has_children) {
          const childBlocks = await notion.blocks.children.list({
            block_id: block.id,
            page_size: 100,
          });
          for (const childBlock of childBlocks.results) {
            const childText = extractTextFromBlock(childBlock);
            if (childText.trim()) {
              sentences.push(childText.trim());
            }
          }
        } else {
          sentences.push(text.trim());
        }
      }
    }

    // 如果页面是数据库，尝试作为数据库查询
    try {
      const page = await notion.pages.retrieve({ page_id: pageId });
      if (page.parent && page.parent.type === 'database_id') {
        // 这是一个数据库页面，查询数据库
        const databaseId = page.parent.database_id;
        const response = await notion.databases.query({
          database_id: databaseId,
        });

        // 提取数据库中的文本字段
        response.results.forEach((page) => {
          Object.values(page.properties).forEach((prop) => {
            if (prop.type === 'title' && prop.title.length > 0) {
              sentences.push(prop.title.map((t) => t.plain_text).join(''));
            } else if (prop.type === 'rich_text' && prop.rich_text.length > 0) {
              sentences.push(prop.rich_text.map((t) => t.plain_text).join(''));
            }
          });
        });
      }
    } catch (dbError) {
      // 不是数据库页面，继续使用块内容
      console.log('Not a database page, using blocks');
    }

    // 过滤空句子并去重
    sentences = [...new Set(sentences.filter((s) => s.length > 0))];

    // 如果仍然没有句子，尝试从页面标题获取
    if (sentences.length === 0) {
      try {
        const page = await notion.pages.retrieve({ page_id: pageId });
        if (page.properties && page.properties.title) {
          const title = page.properties.title.title
            .map((t) => t.plain_text)
            .join('');
          if (title) {
            sentences.push(title);
          }
        }
      } catch (error) {
        console.error('Error retrieving page title:', error);
      }
    }

    if (sentences.length === 0) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'No sentences found',
          message: 'Could not extract sentences from the Notion page',
        }),
      };
    }

    const result = {
      sentences,
      count: sentences.length,
    };

    // 写入缓存
    writeCache('get-notion-sentences', result, { notionPageId });
    console.log('Notion data cached successfully');

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error fetching Notion data:', error);
    
    let errorMessage = error.message;
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      errorMessage = '连接 Notion API 超时。如果您在中国大陆，可能需要配置代理或检查网络连接。';
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Failed to fetch Notion data',
        message: errorMessage,
        originalError: error.message
      }),
    };
  }
};

