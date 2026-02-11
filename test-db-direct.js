import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://db.gtcnjqeloworstrimcsr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y25qcWVsb3dvcnN0cmltY3NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIyNTU3NywiZXhwIjoyMDg1ODAxNTc3fQ.gI6gJeT5GlEcKZMAEThiSqT6S35k5lIFeKjp6LcA1YU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase database connection...\n');

// 测试表是否存在
const tables = ['articles', 'sentences', 'tags', 'article_tags', 'sentence_audios'];

for (const table of tables) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(1);
  
  if (error) {
    if (error.message.includes('does not exist')) {
      console.log(`❌ ${table}: 表不存在（需要运行 schema.sql）`);
    } else {
      console.log(`⚠️  ${table}: ${error.message}`);
    }
  } else {
    console.log(`✅ ${table}: 存在（${data.length} 条记录）`);
  }
}

// 检查数据库是否已初始化
console.log('\n📊 数据库状态总结：');
const { error: testError } = await supabase.from('articles').select('count').limit(1);
if (testError) {
  console.log('❌ 数据库未初始化');
  console.log('\n💡 下一步：');
  console.log('1. 打开 Supabase Dashboard');
  console.log('2. 进入 SQL Editor');
  console.log('3. 运行 supabase/schema.sql');
} else {
  console.log('✅ 数据库已初始化，可以正常使用！');
}
