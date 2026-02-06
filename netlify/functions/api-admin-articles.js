/**
 * 文章管理 API
 * GET    /api/admin/articles          - 获取文章列表
 * POST   /api/admin/articles          - 创建文章
 * GET    /api/admin/articles/:id      - 获取文章详情
 * PUT    /api/admin/articles/:id     - 更新文章
 * DELETE /api/admin/articles/:id     - 删除文章
 */

const { supabaseAdmin } = require('./supabase/client');
const response = require('./supabase/response');

/**
 * 验证请求数据
 */
function validateArticle(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.title || data.title.trim() === '') {
      errors.push({ field: 'title', message: '标题不能为空' });
    }
  }
  
  if (data.title && data.title.length > 255) {
    errors.push({ field: 'title', message: '标题长度不能超过 255 个字符' });
  }
  
  if (data.source_type && !['local', 'notion', 'new-concept', 'custom'].includes(data.source_type)) {
    errors.push({ field: 'source_type', message: '无效的来源类型' });
  }
  
  if (data.metadata && typeof data.metadata !== 'object') {
    errors.push({ field: 'metadata', message: '元数据必须是对象类型' });
  }
  
  return errors;
}

/**
 * 获取文章列表
 */
async function getArticles(event) {
  const params = event.queryStringParameters || {};
  
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
  const offset = (page - 1) * limit;
  
  const orderBy = params.order_by || 'created_at';
  const order = params.order || 'desc';
  
  let query = supabaseAdmin
    .from('articles')
    .select(`
      id,
      title,
      description,
      source_url,
      source_type,
      cover_image,
      total_sentences,
      is_published,
      metadata,
      created_at,
      updated_at
    `, { count: 'exact' });
  
  // 筛选条件
  if (params.source_type && params.source_type !== 'all') {
    query = query.eq('source_type', params.source_type);
  }

  if (params.is_published && params.is_published !== 'all') {
    query = query.eq('is_published', params.is_published === 'true');
  }
  
  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }
  
  // 排序和分页
  query = query
    .order(orderBy, { ascending: order === 'asc' })
    .range(offset, offset + limit - 1);
  
  const { data: articles, error, count } = await query;
  
  if (error) {
    console.error('获取文章列表失败:', error);
    return response.error('获取文章列表失败', 'DATABASE_ERROR');
  }
  
  return response.paginate(articles, count, page, limit);
}

/**
 * 创建文章
 */
async function createArticle(event) {
  const body = JSON.parse(event.body || '{}');
  
  // 验证
  const errors = validateArticle(body);
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 准备文章数据
  const articleData = {
    title: body.title.trim(),
    description: body.description?.trim() || null,
    source_url: body.source_url?.trim() || null,
    source_type: body.source_type || 'local',
    cover_image: body.cover_image?.trim() || null,
    metadata: body.metadata || {},
    is_published: body.is_published || false
  };
  
  // 插入文章
  const { data: article, error: articleError } = await supabaseAdmin
    .from('articles')
    .insert(articleData)
    .select()
    .single();
  
  if (articleError) {
    console.error('创建文章失败:', articleError);
    return response.error('创建文章失败', 'DATABASE_ERROR');
  }
  
  // 批量插入句子
  let sentencesCreated = 0;
  if (body.sentences && Array.isArray(body.sentences) && body.sentences.length > 0) {
    const sentencesData = body.sentences.map((s, index) => ({
      article_id: article.id,
      content: s.content?.trim(),
      sequence_order: s.sequence_order || index + 1,
      extensions: s.extensions || {}
    })).filter(s => s.content); // 过滤空句子
    
    if (sentencesData.length > 0) {
      const { error: sentencesError } = await supabaseAdmin
        .from('sentences')
        .insert(sentencesData);
      
      if (sentencesError) {
        console.error('插入句子失败:', sentencesError);
        // 句子插入失败不影響文章创建，只记录日志
      } else {
        sentencesCreated = sentencesData.length;
      }
    }
  }
  
  return response.success({
    article_id: article.id,
    sentences_created: sentencesCreated
  }, '文章创建成功');
}

/**
 * 获取文章详情
 */
async function getArticle(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的文章 ID' }]);
  }
  
  // 获取文章
  const { data: article, error } = await supabaseAdmin
    .from('articles')
    .select(`
      id,
      title,
      description,
      source_url,
      source_type,
      cover_image,
      total_sentences,
      metadata,
      is_published,
      created_at,
      updated_at,
      tags:article_tags(
        tags:tags(id, name, color)
      ),
      sentences(
        id,
        content,
        sequence_order,
        extensions,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('获取文章详情失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('文章');
    }
    return response.error('获取文章详情失败', 'DATABASE_ERROR');
  }
  
  // 处理标签数据
  if (article.tags) {
    article.tags = article.tags.map(t => t.tags).filter(Boolean);
  }
  
  // 按 sequence_order 排序句子
  if (article.sentences) {
    article.sentences.sort((a, b) => a.sequence_order - b.sequence_order);
  }
  
  return response.success({ article });
}

/**
 * 更新文章
 */
async function updateArticle(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的文章 ID' }]);
  }
  
  const body = JSON.parse(event.body || '{}');
  
  // 验证
  const errors = validateArticle(body, true);
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 准备更新数据
  const updates = {};
  
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.source_url !== undefined) updates.source_url = body.source_url?.trim() || null;
  if (body.source_type !== undefined) updates.source_type = body.source_type;
  if (body.cover_image !== undefined) updates.cover_image = body.cover_image?.trim() || null;
  if (body.metadata !== undefined) updates.metadata = body.metadata;
  if (body.is_published !== undefined) updates.is_published = body.is_published;
  
  if (Object.keys(updates).length === 0) {
    return response.error('没有需要更新的字段', 'VALIDATION_ERROR');
  }
  
  const { error } = await supabaseAdmin
    .from('articles')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('更新文章失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('文章');
    }
    return response.error('更新文章失败', 'DATABASE_ERROR');
  }
  
  return response.success(null, '文章更新成功');
}

/**
 * 删除文章
 */
async function deleteArticle(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的文章 ID' }]);
  }
  
  // 先获取句子数量
  const { count } = await supabaseAdmin
    .from('sentences')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', id);
  
  // 删除文章（级联删除句子）
  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('删除文章失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('文章');
    }
    return response.error('删除文章失败', 'DATABASE_ERROR');
  }
  
  return response.success({
    deleted_sentences_count: count || 0
  }, '文章删除成功');
}

/**
 * 批量导入文章
 */
async function importArticles(event) {
  const body = JSON.parse(event.body || '{}');
  
  if (!body.articles || !Array.isArray(body.articles)) {
    return response.validationError([{ field: 'articles', message: 'articles 必须是数组' }]);
  }
  
  if (body.articles.length === 0) {
    return response.validationError([{ field: 'articles', message: '至少需要导入一篇文章' }]);
  }
  
  const results = {
    imported: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < body.articles.length; i++) {
    const articleData = body.articles[i];
    
    try {
      // 验证
      const errors = validateArticle(articleData);
      if (errors.length > 0) {
        results.failed++;
        results.errors.push({ index: i, errors });
        continue;
      }
      
      // 插入文章
      const { data: article, error } = await supabaseAdmin
        .from('articles')
        .insert({
          title: articleData.title.trim(),
          description: articleData.description?.trim() || null,
          source_type: articleData.source_type || 'local',
          metadata: articleData.metadata || {},
          is_published: articleData.is_published || false
        })
        .select()
        .single();
      
      if (error) {
        results.failed++;
        results.errors.push({ index: i, error: error.message });
        continue;
      }
      
      // 插入句子
      if (articleData.sentences && Array.isArray(articleData.sentences)) {
        const sentencesData = articleData.sentences.map((content, idx) => ({
          article_id: article.id,
          content: content.trim(),
          sequence_order: idx + 1,
          extensions: {}
        })).filter(s => s.content);
        
        if (sentencesData.length > 0) {
          await supabaseAdmin.from('sentences').insert(sentencesData);
        }
      }
      
      results.imported++;
    } catch (err) {
      results.failed++;
      results.errors.push({ index: i, error: err.message });
    }
  }
  
  return response.success(results, `导入完成：成功 ${results.imported} 篇，失败 ${results.failed} 篇`);
}

/**
 * 批量导入句子
 */
async function batchImportSentences(event) {
  const articleId = event.pathParameters?.id;
  
  if (!articleId || isNaN(parseInt(articleId))) {
    return response.validationError([{ field: 'id', message: '无效的文章 ID' }]);
  }
  
  const body = JSON.parse(event.body || '{}');
  
  if (!body.sentences || !Array.isArray(body.sentences)) {
    return response.validationError([{ field: 'sentences', message: 'sentences 必须是数组' }]);
  }
  
  const strategy = body.strategy || 'append';
  
  // 获取当前最大 sequence_order
  const { data: lastSentence } = await supabaseAdmin
    .from('sentences')
    .select('sequence_order')
    .eq('article_id', articleId)
    .eq('is_active', true)
    .order('sequence_order', { ascending: false })
    .limit(1)
    .single();
  
  let startOrder = lastSentence?.sequence_order || 0;
  
  const sentencesData = body.sentences.map((s, idx) => {
    let order;
    
    switch (strategy) {
      case 'prepend':
        order = idx + 1;
        break;
      case 'insert_at':
        order = s.sequence_order || startOrder + idx + 1;
        break;
      case 'replace':
        order = s.sequence_order || idx + 1;
        break;
      case 'append':
      default:
        order = startOrder + idx + 1;
    }
    
    return {
      article_id: parseInt(articleId),
      content: s.content?.trim(),
      sequence_order: order,
      extensions: s.extensions || {},
      is_active: true
    };
  }).filter(s => s.content);
  
  if (sentencesData.length === 0) {
    return response.validationError([{ field: 'sentences', message: '没有有效的句子需要导入' }]);
  }
  
  const { data, error } = await supabaseAdmin
    .from('sentences')
    .insert(sentencesData)
    .select('id, content, sequence_order');
  
  if (error) {
    console.error('批量导入句子失败:', error);
    return response.error('批量导入句子失败', 'DATABASE_ERROR');
  }
  
  return response.success({
    imported_count: data.length,
    sentences: data
  }, '句子导入成功');
}

/**
 * 重新排序句子
 */
async function reorderSentences(event) {
  const articleId = event.pathParameters?.id;
  
  if (!articleId || isNaN(parseInt(articleId))) {
    return response.validationError([{ field: 'id', message: '无效的文章 ID' }]);
  }
  
  const body = JSON.parse(event.body || '{}');
  
  if (!body.mappings || !Array.isArray(body.mappings)) {
    return response.validationError([{ field: 'mappings', message: 'mappings 必须是数组' }]);
  }
  
  // 验证所有 sentence_id 存在且属于该文章
  const sentenceIds = body.mappings.map(m => m.sentence_id);
  const { data: existingSentences } = await supabaseAdmin
    .from('sentences')
    .select('id')
    .eq('article_id', articleId)
    .in('id', sentenceIds);
  
  const existingIds = new Set(existingSentences.map(s => s.id));
  const invalidIds = sentenceIds.filter(id => !existingIds.has(id));
  
  if (invalidIds.length > 0) {
    return response.validationError([{ 
      field: 'mappings', 
      message: `以下句子 ID 不属于该文章: ${invalidIds.join(', ')}` 
    }]);
  }
  
  // 执行批量更新
  const updates = body.mappings.map(m => ({
    id: m.sentence_id,
    sequence_order: m.new_order
  }));
  
  for (const update of updates) {
    const { error } = await supabaseAdmin
      .from('sentences')
      .update({ sequence_order: update.sequence_order })
      .eq('id', update.id);
    
    if (error) {
      console.error(`更新句子 ${update.id} 排序失败:`, error);
      return response.error(`更新句子排序失败: ${error.message}`, 'DATABASE_ERROR');
    }
  }
  
  return response.success(null, '句子排序更新成功');
}

/**
 * 路由处理
 */
exports.handler = async (event) => {
  const method = event.httpMethod;
  let path = event.path.replace('/.netlify/functions/api-admin-articles', '');
  
  // 处理 /articles 后缀
  if (path === '/articles') {
    path = '';
  } else if (path.startsWith('/articles/')) {
    path = path.replace('/articles', '');
  }
  
  // CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // 处理 OPTIONS 请求
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    // 路由分发
    if (method === 'GET' && path === '') {
      return { ...await getArticles(event), headers };
    }
    
    if (method === 'POST' && path === '') {
      return { ...await createArticle(event), headers };
    }
    
    if (method === 'POST' && path === '/import/json') {
      return { ...await importArticles(event), headers };
    }
    
    // /:id 路由
    const idMatch = path.match(/^\/(\d+)/);
    if (idMatch) {
      const id = idMatch[1];
      const remainingPath = path.slice(idMatch[0].length);
      
      if (method === 'GET') {
        return { ...await getArticle({ ...event, pathParameters: { id } }), headers };
      }
      
      if (method === 'PUT') {
        return { ...await updateArticle({ ...event, pathParameters: { id } }), headers };
      }
      
      if (method === 'DELETE') {
        return { ...await deleteArticle({ ...event, pathParameters: { id } }), headers };
      }
      
      // /:id/sentences/batch
      if (remainingPath === '/sentences/batch' && method === 'POST') {
        return { ...await batchImportSentences({ ...event, pathParameters: { id } }), headers };
      }
      
      // /:id/sentences/reorder
      if (remainingPath === '/sentences/reorder' && method === 'PUT') {
        return { ...await reorderSentences({ ...event, pathParameters: { id } }), headers };
      }
    }
    
    return { ...response.notFound('接口'), headers };
    
  } catch (error) {
    console.error('API 处理错误:', error);
    return { ...response.error('服务器内部错误', 'INTERNAL_ERROR', null, 500), headers };
  }
};
