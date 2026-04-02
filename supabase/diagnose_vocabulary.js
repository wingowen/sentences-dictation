/**
 * 诊断工具：检查数据库连接和生词本数据
 */

const API_BASE = '/api/vocabulary';

function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

async function diagnose() {
  console.log('=== 生词本诊断工具 ===');
  console.log('1. 检查认证 token...');
  
  const token = getAuthToken();
  if (!token) {
    console.error('❌ 未找到认证 token，请先登录');
    return;
  }
  
  console.log('✅ Token 存在:', token.substring(0, 20) + '...');
  
  console.log('2. 检查 API 连接...');
  
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ API 返回错误:', result.error?.message || result);
      return;
    }
    
    console.log('✅ API 连接正常');
    console.log('3. 检查生词数据...');
    
    const vocabularies = result.data || [];
    console.log(`找到 ${vocabularies.length} 条生词记录`);
    
    if (vocabularies.length === 0) {
      console.warn('⚠️ 没有找到任何生词，请先添加一些生词');
      return;
    }
    
    const now = new Date();
    const dueVocabularies = vocabularies.filter(v => {
      if (!v.next_review_at) return true;
      return new Date(v.next_review_at) <= now;
    });
    
    console.log(`其中 ${dueVocabularies.length} 条待复习`);
    
    console.log('4. 检查生词详情:');
    vocabularies.slice(0, 3).forEach((v, i) => {
      console.log(`  生词 ${i + 1}:`);
      console.log(`    单词: ${v.word}`);
      console.log(`    含义: ${v.meaning || '无'}`);
      console.log(`    下次复习: ${v.next_review_at || '未设置'}`);
      console.log(`    复习次数: ${v.review_count || 0}`);
    });
    
    console.log('=== 诊断完成 ===');
    
  } catch (error) {
    console.error('❌ API 请求失败:', error.message);
  }
}

diagnose();
