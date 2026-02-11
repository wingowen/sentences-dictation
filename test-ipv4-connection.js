import { createClient } from '@supabase/supabase-js';

// 使用连接池（IPv4）
const supabaseUrl = 'https://aws-0-ap-southeast-1.pooler.supabase.com:6543';
const supabaseKey = 'sb_publishable_NrI8QhvxEGARuyEtQVVZfg_CAxFgxL7';

console.log('Testing IPv4 connection via pooler...');

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase.from('articles').select('count').limit(1);

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log('✅ IPv4 connection successful!');
}
