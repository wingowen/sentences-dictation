/**
 * 获取 Supabase 内容（标签和文章）
 * GET /api/supabase/tags - 获取所有标签
 * GET /api/supabase/articles?tag_id=X - 按标签获取文章
 * GET /api/supabase/sentences?article_id=X - 获取文章句子
 */

const { supabaseAdmin } = require('./supabase/client');
const { CORS_HEADERS, handleCorsPreflight, validateHttpMethod } = require('./shared/cors');

/**
 * 获取所有标签
 */
async function getTags() {
  const { data, error } = await supabaseAdmin
    .from('tags')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

/**
 * 按标签获取文章
 */
async function getArticlesByTag(tagId) {
  let query = supabaseAdmin
    .from('articles')
    .select('id, title, description, total_sentences, created_at');
  
  if (tagId) {
    // 通过 article_tags 关联查询
    const { data: articleTags, error: atError } = await supabaseAdmin
      .from('article_tags')
      .select('article_id')
      .eq('tag_id', tagId);
    
    if (atError) throw atError;
    
    const articleIds = (articleTags || []).map(at => at.article_id);
    if (articleIds.length === 0) return [];
    
    query = query.in('id', articleIds);
  }
  
  const { data, error } = await query.order('title');
  
  if (error) throw error;
  return data || [];
}

/**
 * 获取文章的句子
 */
async function getSentencesByArticle(articleId) {
  const { data, error } = await supabaseAdmin
    .from('sentences')
    .select('id, content, sequence_order, extensions')
    .eq('article_id', articleId)
    .eq('is_active', true)
    .order('sequence_order');
  
  if (error) throw error;
  
  // 转换为应用需要的格式
  return (data || []).map(s => ({
    id: s.id,
    text: s.content,
    translation: s.extensions?.translation || '',
    sequence: s.sequence_order
  }));
}

/**
 * 主处理函数
 */
export async function handler(event, context) {
  // 处理 CORS 预检
  const preflightResponse = handleCorsPreflight(event);
  if (preflightResponse) return preflightResponse;
  
  // 验证 HTTP 方法
  const methodError = validateHttpMethod(event, ['GET']);
  if (methodError) return methodError;
  
  try {
    const path = event.path.replace('/.netlify/functions/get-supabase-content', '');
    const params = event.queryStringParameters || {};
    
    let result;
    
    // 路由处理
    if (path.includes('/tags') || params.action === 'tags') {
      // 获取标签列表
      result = {
        success: true,
        tags: await getTags()
      };
    } else if (path.includes('/sentences') || params.action === 'sentences') {
      // 获取文章句子
      const articleId = params.article_id;
      if (!articleId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: '缺少 article_id 参数' }),
          headers: CORS_HEADERS
        };
      }
      result = {
        success: true,
        sentences: await getSentencesByArticle(articleId)
      };
    } else {
      // 默认：获取文章列表
      const tagId = params.tag_id || null;
      result = {
        success: true,
        articles: await getArticlesByTag(tagId),
        tagId: tagId
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: CORS_HEADERS
    };
    
  } catch (error) {
    console.error('Error in get-supabase-content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || '获取数据失败'
      }),
      headers: CORS_HEADERS
    };
  }
}
