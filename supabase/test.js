import { createClient } from '@supabase/supabase-js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(
  'https://gtcnjqeloworstrimcsr.supabase.co/rest/v1/sentence',
  'sb_publishable_NrI8QhvxEGARuyEtQVVZfg_CAxFgxL7'
)

const { data, error } = await supabase
        .from('articles')
        .select('*')
        .limit(1);

if (error) {
    console.log(error)
    console.error('查询失败:', error.message);
} else {
    console.log('查询成功:', data);
}