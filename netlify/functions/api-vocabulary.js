/**
 * 用户生词本 API
 * GET    /api/vocabulary           - 获取用户生词列表
 * POST   /api/vocabulary           - 添加生词
 * GET    /api/vocabulary/:id      - 获取生词详情
 * PUT    /api/vocabulary/:id      - 更新生词
 * DELETE /api/vocabulary/:id       - 删除生词
 * POST   /api/vocabulary/review   - 标记复习
 */

const { supabaseAdmin } = require('./supabase/client');
const response = require('./supabase/response');

// 检查 Supabase 是否可用
function isSupabaseAvailable() {
  return !!supabaseAdmin;
}

// 获取请求体中的用户ID（从 Authorization header 或请求体）
async function getUserId(event) {
  const authHeader = event.headers.authorization;
  
  // 如果没有认证，返回 null
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  // 如果是模拟 token
  if (token && (token.startsWith('mock-') || token.startsWith('env-'))) {
    return '00000000-0000-0000-0000-000000000001'
  }
  
  // 如果配置了 Supabase，验证 token 并获取用户 ID
  if (supabaseAdmin) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    } catch (err) {
      console.error('获取用户失败:', err);
    }
  }
  
  // 如果无法验证 token，返回 null
  return null;
}

/**
 * 验证生词数据
 */
function validateVocabulary(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    if (!data.word || data.word.trim() === '') {
      errors.push({ field: 'word', message: '单词不能为空' });
    }
  }
  
  if (data.word && data.word.length > 255) {
    errors.push({ field: 'word', message: '单词长度不能超过 255 个字符' });
  }
  
  if (data.part_of_speech && data.part_of_speech.length > 50) {
    errors.push({ field: 'part_of_speech', message: '词性长度不能超过 50 个字符' });
  }
  
  return errors;
}

/**
 * 获取生词列表
 */
async function getVocabularies(event) {
  if (!isSupabaseAvailable()) {
    return response.error('生词本功能暂不可用', 'SERVICE_UNAVAILABLE', 'Supabase 服务未配置', 503);
  }
  
  const userId = await getUserId(event);
  if (!userId) {
    return response.unauthorized('请先登录');
  }
  
  const params = event.queryStringParameters || {};
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
  const offset = (page - 1) * limit;
  
  let query = supabaseAdmin
    .from('user_vocabulary')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);
  
  // 搜索
  if (params.search) {
    query = query.ilike('word', `%${params.search}%`);
  }
  
  // 筛选未掌握的生词
  if (params.learned === 'true') {
    query = query.eq('is_learned', true);
  } else if (params.learned === 'false') {
    query = query.eq('is_learned', false);
  }
  
  // 待复习的生词
  if (params.review === 'due') {
    query = query.lte('next_review_at', new Date().toISOString());
  }
  
  // 排序
  const orderBy = params.order_by || 'created_at';
  const order = params.order || 'desc';
  query = query.order(orderBy, { ascending: order === 'asc' });
  
  // 分页
  query = query.range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('[Vocabulary] Get list error:', error);
    return response.error('获取生词列表失败', 'DB_ERROR', error.message);
  }
  
  return response.paginate(data || [], count || 0, page, limit);
}

/**
 * 添加生词
 */
async function addVocabulary(event) {
  if (!isSupabaseAvailable()) {
    return response.error('生词本功能暂不可用', 'SERVICE_UNAVAILABLE', 'Supabase 服务未配置', 503);
  }
  
  const userId = await getUserId(event);
  if (!userId) {
    return response.unauthorized('请先登录');
  }
  
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return response.validationError([{ field: 'body', message: '请求体格式错误' }]);
  }
  
  const { word, phonetic, meaning, part_of_speech, sentence_context, source_sentence_id, source_article_id, notes } = body;
  
  // 验证
  const errors = validateVocabulary({ word });
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 检查是否已存在（忽略大小写）
  const { data: existing } = await supabaseAdmin
    .from('user_vocabulary')
    .select('id')
    .eq('user_id', userId)
    .ilike('word', word)
    .limit(1);
  
  if (existing && existing.length > 0) {
    return response.conflict('该生词已存在');
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_vocabulary')
    .insert({
      user_id: userId,
      word: word.trim(),
      phonetic,
      meaning,
      part_of_speech,
      sentence_context,
      source_sentence_id,
      source_article_id,
      notes,
      review_count: 0,
      is_learned: false,
      next_review_at: new Date().toISOString() // 立即可复习
    })
    .select()
    .single();
  
  if (error) {
    console.error('[Vocabulary] Add error:', error);
    return response.error('添加生词失败', 'DB_ERROR', error.message);
  }
  
  return response.success(data, '生词添加成功');
}

/**
 * 获取生词详情
 */
async function getVocabulary(event) {
  if (!isSupabaseAvailable()) {
    return response.error('生词本功能暂不可用', 'SERVICE_UNAVAILABLE', 'Supabase 服务未配置', 503);
  }
  
  const userId = await getUserId(event);
  if (!userId) {
    return response.unauthorized('请先登录');
  }
  
  // 直接从路径中提取 ID，不依赖于 pathParameters
  const path = event.path || '/';
  const parts = path.split('/').filter(Boolean);
  const id = parts[parts.length - 1];
  
  if (!id) {
    return response.validationError([{ field: 'id', message: '生词ID不能为空' }]);
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_vocabulary')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return response.notFound('生词');
    }
    console.error('[Vocabulary] Get error:', error);
    return response.error('获取生词详情失败', 'DB_ERROR', error.message);
  }
  
  return response.success(data);
}

/**
 * 更新生词
 */
async function updateVocabulary(event) {
  if (!isSupabaseAvailable()) {
    return response.error('生词本功能暂不可用', 'SERVICE_UNAVAILABLE', 'Supabase 服务未配置', 503);
  }
  
  const userId = await getUserId(event);
  if (!userId) {
    return response.unauthorized('请先登录');
  }
  
  // 直接从路径中提取 ID，不依赖于 pathParameters
  const path = event.path || '/';
  const parts = path.split('/').filter(Boolean);
  const id = parts[parts.length - 1];
  
  if (!id) {
    return response.validationError([{ field: 'id', message: '生词ID不能为空' }]);
  }
  
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return response.validationError([{ field: 'body', message: '请求体格式错误' }]);
  }
  
  const { word, phonetic, meaning, part_of_speech, sentence_context, notes, is_learned } = body;
  
  // 验证
  const errors = validateVocabulary(body, true);
  if (errors.length > 0) {
    return response.validationError(errors);
  }
  
  // 更新
  const updateData = {};
  if (word !== undefined) updateData.word = word.trim();
  if (phonetic !== undefined) updateData.phonetic = phonetic;
  if (meaning !== undefined) updateData.meaning = meaning;
  if (part_of_speech !== undefined) updateData.part_of_speech = part_of_speech;
  if (sentence_context !== undefined) updateData.sentence_context = sentence_context;
  if (notes !== undefined) updateData.notes = notes;
  if (is_learned !== undefined) updateData.is_learned = is_learned;
  
  const { data, error } = await supabaseAdmin
    .from('user_vocabulary')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return response.notFound('生词');
    }
    console.error('[Vocabulary] Update error:', error);
    return response.error('更新生词失败', 'DB_ERROR', error.message);
  }
  
  return response.success(data, '生词更新成功');
}

/**
 * 删除生词
 */
async function deleteVocabulary(event) {
  if (!isSupabaseAvailable()) {
    return response.error('生词本功能暂不可用', 'SERVICE_UNAVAILABLE', 'Supabase 服务未配置', 503);
  }
  
  const userId = await getUserId(event);
  if (!userId) {
    return response.unauthorized('请先登录');
  }
  
  // 从路径中提取 ID
  const path = event.path || '/';
  const match = path.match(/\/api\/vocabulary\/([^/]+)$/);
  const id = match ? match[1] : event.pathParameters?.id;
  
  if (!id) {
    console.error('[Vocabulary] Delete: ID not found in path:', path);
    return response.validationError([{ field: 'id', message: '生词 ID 不能为空' }]);
  }
  
  console.log(`[Vocabulary] Delete: Deleting vocabulary ID ${id} for user ${userId}`);
  
  const { error } = await supabaseAdmin
    .from('user_vocabulary')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('[Vocabulary] Delete error:', error);
    return response.error('删除生词失败', 'DB_ERROR', error.message);
  }
  
  return response.success(null, '生词删除成功');
}

/**
 * 标记复习
 */
async function reviewVocabulary(event) {
  if (!isSupabaseAvailable()) {
    return response.error('生词本功能暂不可用', 'SERVICE_UNAVAILABLE', 'Supabase 服务未配置', 503);
  }
  
  const userId = await getUserId(event);
  if (!userId) {
    return response.unauthorized('请先登录');
  }
  
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return response.validationError([{ field: 'body', message: '请求体格式错误' }]);
  }
  
  const { id, is_correct, next_review_days } = body;
  
  if (!id) {
    return response.validationError([{ field: 'id', message: '生词ID不能为空' }]);
  }
  
  // 获取当前生词
  const { data: vocab, error: fetchError } = await supabaseAdmin
    .from('user_vocabulary')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError || !vocab) {
    return response.notFound('生词');
  }
  
  // 计算下次复习时间（间隔时间基于艾宾浩斯遗忘曲线：1, 3, 7, 14, 30天）
  const reviewDays = next_review_days || (is_correct ? Math.min(30, (vocab.review_count + 1) * 2) : 1);
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + reviewDays);
  
  // 更新复习次数和下次复习时间
  const { data, error } = await supabaseAdmin
    .from('user_vocabulary')
    .update({
      review_count: vocab.review_count + 1,
      next_review_at: nextReviewAt.toISOString(),
      is_learned: vocab.review_count >= 4 && is_correct // 复习4次以上且正确视为掌握
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('[Vocabulary] Review error:', error);
    return response.error('标记复习失败', 'DB_ERROR', error.message);
  }
  
  return response.success(data, '复习记录已更新');
}

/**
 * 路由处理
 */
exports.handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path || '/';
  
  console.log(`[Vocabulary] ${method} ${path}`);
  
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
    // 处理Netlify函数路径
    let normalizedPath = path.replace('/.netlify/functions/api-vocabulary', '');
    
    // 路由匹配
    if (method === 'GET' && (normalizedPath === '' || normalizedPath === '/')) {
      return { ...await getVocabularies(event), headers };
    }
    
    if (method === 'POST' && (normalizedPath === '' || normalizedPath === '/')) {
      // 检查是否是复习操作
      const body = JSON.parse(event.body || '{}');
      if (body.action === 'review') {
        return { ...await reviewVocabulary(event), headers };
      }
      return { ...await addVocabulary(event), headers };
    }
    
    // 处理带 ID 的路由
    // 直接从原始路径中提取 ID，确保能正确处理 /api/vocabulary/1 格式的路径
    console.log('[Vocabulary] Original path:', path);
    const parts = path.split('/').filter(Boolean);
    console.log('[Vocabulary] Path parts:', parts);
    const id = parts[parts.length - 1];
    console.log('[Vocabulary] Extracted ID:', id);
    
    if (id) {
      // 直接修改 event 对象，确保 pathParameters 存在
      event.pathParameters = event.pathParameters || {};
      event.pathParameters.id = id;
      console.log('[Vocabulary] event.pathParameters:', event.pathParameters);
      
      if (method === 'GET') {
        return { ...await getVocabulary(event), headers };
      }
      
      if (method === 'PUT') {
        return { ...await updateVocabulary(event), headers };
      }
      
      if (method === 'DELETE') {
        return { ...await deleteVocabulary(event), headers };
      }
    }
    
    return { ...response.error('接口不存在', 'NOT_FOUND', null, 404), headers };
    
  } catch (err) {
    console.error('[Vocabulary] Handler error:', err);
    return { ...response.error('服务器内部错误', 'INTERNAL_ERROR', null, 500), headers };
  }
};