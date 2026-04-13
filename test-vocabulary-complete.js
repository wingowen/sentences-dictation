import axios from 'axios';

// 测试生词本完整功能
async function testVocabularyComplete() {
  const API_BASE = 'http://localhost:3001/api/vocabulary';
  const token = 'mock-test-token'; // 模拟 token
  
  try {
    console.log('=== 测试生词本完整功能 ===');
    
    // 1. 获取生词列表
    console.log('1. 获取生词列表...');
    try {
      const listResponse = await axios.get(API_BASE, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('生词列表响应:', listResponse.status, listResponse.data);
    } catch (error) {
      console.log('获取生词列表失败（可能是因为未登录）:', error.message);
    }
    
    // 2. 测试添加生词
    console.log('\n2. 测试添加生词...');
    const newVocab = {
      word: 'testword' + Date.now(),
      meaning: '测试单词',
      phonetic: '/test/',
      part_of_speech: 'noun'
    };
    
    try {
      const addResponse = await axios.post(API_BASE, newVocab, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('添加生词响应:', addResponse.status, addResponse.data);
      
      if (addResponse.data.success) {
        const addedVocab = addResponse.data.data;
        console.log('\n3. 测试编辑生词...');
        
        // 3. 测试编辑生词
        const updatedData = {
          word: addedVocab.word + '_edited',
          meaning: '测试编辑含义',
          phonetic: '/ˈtest/',
          part_of_speech: 'verb',
          notes: '测试编辑笔记'
        };
        
        try {
          const updateResponse = await axios.put(`${API_BASE}/${addedVocab.id}`, updatedData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('编辑生词响应:', updateResponse.status, updateResponse.data);
          
          if (updateResponse.data.success) {
            console.log('\n4. 测试获取生词详情...');
            
            // 4. 测试获取生词详情
            try {
              const detailResponse = await axios.get(`${API_BASE}/${addedVocab.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              console.log('获取生词详情响应:', detailResponse.status, detailResponse.data);
            } catch (error) {
              console.log('获取生词详情失败:', error.message);
              if (error.response) {
                console.log('响应数据:', error.response.data);
              }
            }
          }
        } catch (error) {
          console.log('编辑生词失败:', error.message);
          if (error.response) {
            console.log('响应数据:', error.response.data);
          }
        }
      }
    } catch (error) {
      console.log('添加生词失败:', error.message);
      if (error.response) {
        console.log('响应数据:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('状态码:', error.response.status);
    }
  }
}

// 运行测试
testVocabularyComplete();
