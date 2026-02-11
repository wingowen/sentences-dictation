import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://db.gtcnjqeloworstrimcsr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y25qcWVsb3dvcnN0cmltY3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjU1NzcsImV4cCI6MjA4NTgwMTU3N30.xuJnu-eASM9kob3quGCijiWZRyWNQNKq8Neax9rTD5A';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase connection...');

// 测试表是否存在
const { data, error } = await supabase
  .from('articles')
  .select('count')
  .limit(1);

if (error) {
  console.log('❌ Error:', error.message);
  if (error.message.includes('does not exist')) {
    console.log('⚠️  Database schema not initialized!');
    console.log('💡 Run supabase/schema.sql in Supabase Dashboard');
  }
} else {
  console.log('✅ Connection successful!');
  console.log('📊 Database is ready');
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
