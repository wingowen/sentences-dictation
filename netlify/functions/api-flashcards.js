const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase = null

try {
  const { createClient } = require('@supabase/supabase-js')
  supabase = createClient(supabaseUrl, supabaseServiceKey)
} catch (err) {
  console.warn('[Flashcards] Supabase not available, running in fallback mode:', err.message)
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
    return '00000000-0000-0000-0000-000000000001'
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (!isSupabaseAvailable()) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ success: false, error: { message: '闪卡功能暂不可用' } })
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
  const path = event.path.replace('/api/flashcards', '')

  try {
    if (method === 'GET' && (path === '' || path === '/')) {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) }
    }

    if (method === 'POST' && (path === '' || path === '/')) {
      const body = JSON.parse(event.body)
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{ ...body, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, data }) }
    }

    if (method === 'PUT') {
      const id = path.replace('/', '')
      const body = JSON.parse(event.body)
      const { data, error } = await supabase
        .from('flashcards')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) }
    }

    if (method === 'DELETE') {
      const id = path.replace('/', '')
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
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
    console.error('闪卡API错误:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: { message: error.message } })
    }
  }
}
