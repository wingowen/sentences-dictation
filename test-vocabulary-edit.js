const axios = require('axios');

// 测试生词本编辑功能
async function testVocabularyEdit() {
  const API_BASE = 'http://localhost:8888/api/vocabulary';
  const token = 'mock-test-token'; // 模拟 token
  
  try {
    console.log('=== 测试生词本编辑功能 ===');
    
    // 1. 获取生词列表
    console.log('1. 获取生词列表...');
    const listResponse = await axios.get(API_BASE, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('生词列表:', listResponse.data);
    
    if (listResponse.data.data && listResponse.data.data.length > 0) {
      const firstVocab = listResponse.data.data[0];
      console.log('\n2. 编辑第一个生词:', firstVocab);
      
      // 2. 编辑生词
      const updatedData = {
        word: firstVocab.word + '_edited',
        meaning: '测试编辑含义',
        phonetic: '/ˈtest/',
        part_of_speech: 'noun',
        notes: '测试编辑笔记'
      };
      
      const updateResponse = await axios.put(`${API_BASE}/${firstVocab.id}`, updatedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('编辑结果:', updateResponse.data);
      
      // 3. 验证编辑是否成功
      console.log('\n3. 验证编辑结果...');
      const verifyResponse = await axios.get(`${API_BASE}/${firstVocab.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('验证结果:', verifyResponse.data);
      
    } else {
      console.log('\n没有找到生词，先添加一个...');
      
      // 添加一个生词用于测试
      const newVocab = {
        word: 'testword',
        meaning: '测试单词',
        phonetic: '/test/',
        part_of_speech: 'noun'
      };
      
      const addResponse = await axios.post(API_BASE, newVocab, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('添加结果:', addResponse.data);
      
      if (addResponse.data.success) {
        const addedVocab = addResponse.data.data;
        console.log('\n4. 编辑新添加的生词...');
        
        const updatedData = {
          word: 'testword_edited',
          meaning: '测试编辑含义',
          phonetic: '/ˈtest/',
          part_of_speech: 'verb',
          notes: '测试编辑笔记'
        };
        
        const updateResponse = await axios.put(`${API_BASE}/${addedVocab.id}`, updatedData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('编辑结果:', updateResponse.data);
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
testVocabularyEdit();
