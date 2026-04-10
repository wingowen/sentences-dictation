const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null

try {
  const { createClient } = require('@supabase/supabase-js')
  supabase = createClient(supabaseUrl, supabaseServiceKey)
} catch (err) {
  console.warn('[Flashcard History] Supabase not available, running in fallback mode:', err.message)
}

// 检查 Supabase 是否可用
function isSupabaseAvailable() {
  return !!supabase
}

const getUserId = async (event) => {
  const authHeader = event.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  
  // 如果是模拟 token
  if (token && (token.startsWith('mock-') || token.startsWith('env-'))) {
    return 'mock-user-1'
  }
  
  if (!isSupabaseAvailable()) {
    return null
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) {
      return user.id
    }
  } catch (err) {
    console.error('获取用户失败:', err)
  }
  return null
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (!isSupabaseAvailable()) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ success: false, error: { message: '学习记录功能暂不可用' } })
    }
  }

  const userId = await getUserId(event)
  if (!userId) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: { message: '请先登录' } })
    }
  }

  const method = event.httpMethod

  try {
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('flashcard_learning_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) }
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body)
      const { data, error } = await supabase
        .from('flashcard_learning_history')
        .insert([{ ...body, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, data }) }
    }

    if (method === 'DELETE') {
      const { error } = await supabase
        .from('flashcard_learning_history')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: { message: '未找到' } })
    }
  } catch (error) {
    console.error('学习记录API错误:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: error.message } })
    }
  }
}
