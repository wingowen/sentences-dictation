/**
 * 句子管理 API
 * GET    /api/admin/sentences/:id      - 获取句子详情
 * PUT    /api/admin/sentences/:id     - 更新句子
 * DELETE /api/admin/sentences/:id      - 删除句子
 * PUT    /api/admin/sentences/batch   - 批量更新句子
 * DELETE /api/admin/sentences/batch    - 批量删除句子
 */

const { supabaseAdmin } = require('./supabase/client');
const response = require('./supabase/response');

/**
 * 验证句子数据
 */
function validateSentence(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.content || data.content.trim() === '') {
      errors.push({ field: 'content', message: '句子内容不能为空' });
    }
  }
  
  if (data.sequence_order !== undefined && (isNaN(data.sequence_order) || data.sequence_order < 1)) {
    errors.push({ field: 'sequence_order', message: '序号必须是大于 0 的数字' });
  }
  
  if (data.extensions !== undefined && typeof data.extensions !== 'object') {
    errors.push({ field: 'extensions', message: '扩展信息必须是对象类型' });
  }
  
  return errors;
}

/**
 * 获取句子详情
 */
async function getSentence(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的句子 ID' }]);
  }
  
  const { data: sentence, error } = await supabaseAdmin
    .from('sentences')
    .select(`
      id,
      article_id,
      content,
      sequence_order,
      extensions,
      is_active,
      created_at,
      updated_at,
      article:articles(
        id,
        title,
        source_type
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('获取句子详情失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('句子');
    }
    return response.error('获取句子详情失败', 'DATABASE_ERROR');
  }
  
  return response.success({ sentence });
}

/**
 * 更新句子
 */
async function updateSentence(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的句子 ID' }]);
  }
  
  const body = JSON.parse(event.body || '{}');
  
  // 验证
  const errors = validateSentence(body, true);
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 准备更新数据
  const updates = {};
  
  if (body.content !== undefined) updates.content = body.content.trim();
  if (body.sequence_order !== undefined) updates.sequence_order = body.sequence_order;
  if (body.extensions !== undefined) updates.extensions = body.extensions;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  
  if (Object.keys(updates).length === 0) {
    return response.error('没有需要更新的字段', 'VALIDATION_ERROR');
  }
  
  const { data, error } = await supabaseAdmin
    .from('sentences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('更新句子失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('句子');
    }
    return response.error('更新句子失败', 'DATABASE_ERROR');
  }
  
  return response.success({ sentence: data }, '句子更新成功');
}

/**
 * 删除句子（软删除）
 */
async function deleteSentence(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的句子 ID' }]);
  }
  
  // 软删除：设置 is_active = false
  const { error } = await supabaseAdmin
    .from('sentences')
    .update({ is_active: false })
    .eq('id', id);
  
  if (error) {
    console.error('删除句子失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('句子');
    }
    return response.error('删除句子失败', 'DATABASE_ERROR');
  }
  
  return response.success(null, '句子删除成功');
}

/**
 * 批量更新句子
 */
async function batchUpdateSentences(event) {
  const body = JSON.parse(event.body || '{}');
  
  if (!body.sentences || !Array.isArray(body.sentences)) {
    return response.validationError([{ field: 'sentences', message: 'sentences 必须是数组' }]);
  }
  
  if (body.sentences.length === 0) {
    return response.validationError([{ field: 'sentences', message: '至少需要更新一条句子' }]);
  }
  
  const results = {
    updated: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < body.sentences.length; i++) {
    const s = body.sentences[i];
    
    if (!s.id) {
      results.failed++;
      results.errors.push({ index: i, error: '缺少句子 ID' });
      continue;
    }
    
    const updates = {};
    
    if (s.content !== undefined) updates.content = s.content.trim();
    if (s.sequence_order !== undefined) updates.sequence_order = s.sequence_order;
    if (s.extensions !== undefined) updates.extensions = s.extensions;
    if (s.is_active !== undefined) updates.is_active = s.is_active;
    
    if (Object.keys(updates).length === 0) {
      results.failed++;
      results.errors.push({ index: i, error: '没有需要更新的字段' });
      continue;
    }
    
    const { error } = await supabaseAdmin
      .from('sentences')
      .update(updates)
      .eq('id', s.id);
    
    if (error) {
      results.failed++;
      results.errors.push({ index: i, error: error.message });
    } else {
      results.updated++;
    }
  }
  
  return response.success(results, `批量更新完成：成功 ${results.updated} 条，失败 ${results.failed} 条`);
}

/**
 * 批量删除句子
 */
async function batchDeleteSentences(event) {
  const body = JSON.parse(event.body || '{}');
  
  if (!body.ids || !Array.isArray(body.ids)) {
    return response.validationError([{ field: 'ids', message: 'ids 必须是数组' }]);
  }
  
  if (body.ids.length === 0) {
    return response.validationError([{ field: 'ids', message: '至少需要删除一条句子' }]);
  }
  
  // 批量软删除
  const { error } = await supabaseAdmin
    .from('sentences')
    .update({ is_active: false })
    .in('id', body.ids);
  
  if (error) {
    console.error('批量删除句子失败:', error);
    return response.error('批量删除句子失败', 'DATABASE_ERROR');
  }
  
  return response.success({
    deleted_count: body.ids.length
  }, `成功删除 ${body.ids.length} 条句子`);
}

/**
 * 路由处理
 */
exports.handler = async (event) => {
  const method = event.httpMethod;
  let path = event.path.replace('/.netlify/functions/api-admin-sentences', '');
  
  // 处理 /sentences 后缀
  if (path === '/sentences') {
    path = '';
  } else if (path.startsWith('/sentences/')) {
    path = path.replace('/sentences', '');
  }
  
  // CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // 处理 OPTIONS 请求
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    // /batch 路由
    if (path === '/batch') {
      if (method === 'PUT') {
        return { ...await batchUpdateSentences(event), headers };
      }
      if (method === 'DELETE') {
        return { ...await batchDeleteSentences(event), headers };
      }
    }
    
    // /:id 路由
    const idMatch = path.match(/^\/(\d+)/);
    if (idMatch) {
      if (method === 'GET') {
        return { ...await getSentence({ ...event, pathParameters: { id: idMatch[1] } }), headers };
      }
      if (method === 'PUT') {
        return { ...await updateSentence({ ...event, pathParameters: { id: idMatch[1] } }), headers };
      }
      if (method === 'DELETE') {
        return { ...await deleteSentence({ ...event, pathParameters: { id: idMatch[1] } }), headers };
      }
    }
    
    return { ...response.notFound('接口'), headers };
    
  } catch (error) {
    console.error('API 处理错误:', error);
    return { ...response.error('服务器内部错误', 'INTERNAL_ERROR', null, 500), headers };
  }
};
