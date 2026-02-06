/**
 * 标签管理 API
 * GET    /api/admin/tags     - 获取标签列表
 * POST   /api/admin/tags     - 创建标签
 * PUT    /api/admin/tags/:id - 更新标签
 * DELETE /api/admin/tags/:id - 删除标签
 */

const { supabaseAdmin } = require('./supabase/client');
const response = require('./supabase/response');

/**
 * 验证标签数据
 */
function validateTag(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.name || data.name.trim() === '') {
      errors.push({ field: 'name', message: '标签名称不能为空' });
    }
  }
  
  if (data.name && data.name.length > 100) {
    errors.push({ field: 'name', message: '标签名称长度不能超过 100 个字符' });
  }
  
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.push({ field: 'color', message: '颜色格式无效（需要 #RRGGBB 格式）' });
  }
  
  return errors;
}

/**
 * 获取标签列表
 */
async function getTags(event) {
  const { data: tags, error } = await supabaseAdmin
    .from('tags')
    .select(`
      id,
      name,
      color,
      created_at,
      article_count:article_tags(count)
    `)
    .order('name');
  
  if (error) {
    console.error('获取标签列表失败:', error);
    return response.error('获取标签列表失败', 'DATABASE_ERROR');
  }
  
  // 处理 article_count
  const formattedTags = tags.map(t => ({
    ...t,
    article_count: t.article_count?.[0]?.count || 0
  }));
  
  return response.success({ tags: formattedTags });
}

/**
 * 创建标签
 */
async function createTag(event) {
  const body = JSON.parse(event.body || '{}');
  
  // 验证
  const errors = validateTag(body);
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 检查标签名是否已存在
  const { data: existing } = await supabaseAdmin
    .from('tags')
    .select('id')
    .ilike('name', body.name.trim())
    .single();
  
  if (existing) {
    return response.conflict('标签名称已存在');
  }
  
  const { data: tag, error } = await supabaseAdmin
    .from('tags')
    .insert({
      name: body.name.trim(),
      color: body.color || '#3B82F6'
    })
    .select()
    .single();
  
  if (error) {
    console.error('创建标签失败:', error);
    return response.error('创建标签失败', 'DATABASE_ERROR');
  }
  
  return response.success({ tag }, '标签创建成功');
}

/**
 * 更新标签
 */
async function updateTag(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的标签 ID' }]);
  }
  
  const body = JSON.parse(event.body || '{}');
  
  // 验证
  const errors = validateTag(body, true);
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 准备更新数据
  const updates = {};
  
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.color !== undefined) updates.color = body.color;
  
  if (Object.keys(updates).length === 0) {
    return response.error('没有需要更新的字段', 'VALIDATION_ERROR');
  }
  
  // 检查名称是否与其他标签冲突
  if (body.name) {
    const { data: existing } = await supabaseAdmin
      .from('tags')
      .select('id')
      .ilike('name', body.name.trim())
      .neq('id', id)
      .single();
    
    if (existing) {
      return response.conflict('标签名称已存在');
    }
  }
  
  const { data: tag, error } = await supabaseAdmin
    .from('tags')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('更新标签失败:', error);
    if (error.code === 'PGRST116') {
      return response.notFound('标签');
    }
    return response.error('更新标签失败', 'DATABASE_ERROR');
  }
  
  return response.success({ tag }, '标签更新成功');
}

/**
 * 删除标签
 */
async function deleteTag(event) {
  const id = event.pathParameters?.id;
  
  if (!id || isNaN(parseInt(id))) {
    return response.validationError([{ field: 'id', message: '无效的标签 ID' }]);
  }
  
  // 先删除关联
  await supabaseAdmin
    .from('article_tags')
    .delete()
    .eq('tag_id', id);
  
  const { error } = await supabaseAdmin
    .from('tags')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('删除标签失败:', error);
    return response.error('删除标签失败', 'DATABASE_ERROR');
  }
  
  return response.success(null, '标签删除成功');
}

/**
 * 为文章添加标签
 */
async function addTagToArticle(event) {
  const body = JSON.parse(event.body || '{}');
  
  if (!body.article_id || !body.tag_id) {
    return response.validationError([
      { field: 'article_id', message: 'article_id 不能为空' },
      { field: 'tag_id', message: 'tag_id 不能为空' }
    ]);
  }
  
  const { error } = await supabaseAdmin
    .from('article_tags')
    .insert({
      article_id: body.article_id,
      tag_id: body.tag_id
    })
    .onConflict('article_id, tag_id')
    .ignore();
  
  if (error) {
    console.error('添加标签到文章失败:', error);
    return response.error('添加标签失败', 'DATABASE_ERROR');
  }
  
  return response.success(null, '标签添加成功');
}

/**
 * 从文章移除标签
 */
async function removeTagFromArticle(event) {
  const body = JSON.parse(event.body || '{}');
  
  if (!body.article_id || !body.tag_id) {
    return response.validationError([
      { field: 'article_id', message: 'article_id 不能为空' },
      { field: 'tag_id', message: 'tag_id 不能为空' }
    ]);
  }
  
  const { error } = await supabaseAdmin
    .from('article_tags')
    .delete()
    .match({
      article_id: body.article_id,
      tag_id: body.tag_id
    });
  
  if (error) {
    console.error('从文章移除标签失败:', error);
    return response.error('移除标签失败', 'DATABASE_ERROR');
  }
  
  return response.success(null, '标签移除成功');
}

/**
 * 路由处理
 */
exports.handler = async (event) => {
  const method = event.httpMethod;
  let path = event.path.replace('/.netlify/functions/api-admin-tags', '');
  
  // 处理 /tags 后缀
  if (path === '/tags') {
    path = '';
  } else if (path.startsWith('/tags/')) {
    path = path.replace('/tags', '');
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
    // /article 路由：添加/移除文章标签
    if (path === '/article') {
      if (method === 'POST') {
        return { ...await addTagToArticle(event), headers };
      }
      if (method === 'DELETE') {
        return { ...await removeTagFromArticle(event), headers };
      }
    }
    
    // /:id 路由
    const idMatch = path.match(/^\/(\d+)/);
    if (idMatch) {
      if (method === 'GET') {
        return { ...await getTags({ ...event, pathParameters: { id: idMatch[1] } }), headers };
      }
      if (method === 'PUT') {
        return { ...await updateTag({ ...event, pathParameters: { id: idMatch[1] } }), headers };
      }
      if (method === 'DELETE') {
        return { ...await deleteTag({ ...event, pathParameters: { id: idMatch[1] } }), headers };
      }
    }
    
    // 列表和创建
    if (method === 'GET') {
      return { ...await getTags(event), headers };
    }
    if (method === 'POST') {
      return { ...await createTag(event), headers };
    }
    
    return { ...response.notFound('接口'), headers };
    
  } catch (error) {
    console.error('API 处理错误:', error);
    return { ...response.error('服务器内部错误', 'INTERNAL_ERROR', null, 500), headers };
  }
};
