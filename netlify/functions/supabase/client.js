/**
 * Supabase 客户端配置
 */

const { createClient } = require('@supabase/supabase-js');

// 服务端环境变量
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('警告: SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 未设置');
  console.warn('请在根目录 .env 文件中设置这些变量');
}

// 创建服务端客户端（使用 service_role key，可跳过 RLS）
let supabaseAdmin = null;

try {
  if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        }
      }
    );
    console.log('[Supabase] Admin client initialized successfully');
  } else {
    console.warn('[Supabase] Admin client not initialized - missing environment variables');
  }
} catch (error) {
  console.error('[Supabase] Failed to initialize admin client:', error.message);
}

// 为了兼容性，也导出普通客户端变量（指向 admin 客户端）
const supabase = supabaseAdmin;
const supabaseAnonKey = supabaseServiceKey;

module.exports = {
  supabase,
  supabaseAdmin,
  supabaseUrl,
  supabaseAnonKey
};
