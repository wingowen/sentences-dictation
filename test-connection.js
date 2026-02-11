import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://db.gtcnjqeloworstrimcsr.supabase.co';
const supabaseKey = 'sb_publishable_NrI8QhvxEGARuyEtQVVZfg_CAxFgxL7';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing connection...');

// 测试表是否存在
const { data, error } = await supabase
  .from('articles')
  .select('count')
  .limit(1);

if (error) {
  console.log('❌ Error:', error.message);
  if (error.message.includes('does not exist')) {
    console.log('⚠️  Database schema not initialized!');
  }
} else {
  console.log('✅ Connection successful!');
  console.log('📊 Articles table exists');
}

// 测试其他表
const tables = ['sentences', 'tags', 'article_tags', 'sentence_audios'];
for (const table of tables) {
  const { error: tableError } = await supabase
    .from(table)
    .select('count')
    .limit(1);
  
  if (tableError) {
    console.log(`❌ ${table}: ${tableError.message}`);
  } else {
    console.log(`✅ ${table}: exists`);
  }
}
