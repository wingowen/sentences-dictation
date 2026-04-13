import { createClient } from '@supabase/supabase-js';

// 使用项目中已有的 Supabase 配置
const SUPABASE_URL = 'https://gtcnjqeloworstrimcsr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NrI8QhvxEGARuyEtQVVZfg_CAxFgxL7';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVocabularyCRUD() {
  console.log('=== 测试 Supabase 生词本功能 ===');
  
  try {
    // 1. 测试数据库连接
    console.log('\n1. 测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('user_vocabulary')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message);
      console.log('错误详情:', testError);
    } else {
      console.log('✅ 数据库连接成功');
      console.log('现有记录数:', testData?.length || 0);
    }
    
    // 2. 测试添加生词
    console.log('\n2. 测试添加生词...');
    const testWord = {
      user_id: '00000000-0000-0000-0000-000000000001',
      word: 'test_supabase_' + Date.now(),
      phonetic: '/test/',
      meaning: '测试 Supabase 单词',
      part_of_speech: 'noun',
      notes: '测试添加',
      review_count: 0,
      is_learned: false,
      next_review_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_vocabulary')
      .insert(testWord)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ 添加生词失败:', insertError.message);
    } else {
      console.log('✅ 添加生词成功:', insertData.word);
      const vocabId = insertData.id;
      
      // 3. 测试编辑生词
      console.log('\n3. 测试编辑生词...');
      const updateData = {
        word: insertData.word + '_edited',
        meaning: '测试编辑后的含义',
        part_of_speech: 'verb',
        notes: '测试编辑笔记',
        updated_at: new Date().toISOString()
      };
      
      const { data: updateResult, error: updateError } = await supabase
        .from('user_vocabulary')
        .update(updateData)
        .eq('id', vocabId)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ 编辑生词失败:', updateError.message);
      } else {
        console.log('✅ 编辑生词成功');
        console.log('更新后:', updateResult.word, '-', updateResult.meaning);
        
        // 4. 验证编辑结果
        console.log('\n4. 验证编辑结果...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_vocabulary')
          .select('*')
          .eq('id', vocabId)
          .single();
        
        if (verifyError) {
          console.error('❌ 验证失败:', verifyError.message);
        } else {
          console.log('✅ 验证成功');
          console.log('最终数据:', {
            id: verifyData.id,
            word: verifyData.word,
            meaning: verifyData.meaning,
            part_of_speech: verifyData.part_of_speech,
            notes: verifyData.notes
          });
        }
      }
      
      // 5. 清理测试数据
      console.log('\n5. 清理测试数据...');
      const { error: deleteError } = await supabase
        .from('user_vocabulary')
        .delete()
        .eq('id', vocabId);
      
      if (deleteError) {
        console.error('❌ 删除测试数据失败:', deleteError.message);
      } else {
        console.log('✅ 测试数据已清理');
      }
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
    console.error('错误堆栈:', error);
  }
}

testVocabularyCRUD();
