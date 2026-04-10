
const fs = require('fs');
const path = require('path');

console.log('检查 API 修复验证');
console.log('='.repeat(50));

console.log('\n1. 检查 api-vocabulary.js 文件是否存在...');
const apiPath = path.join(__dirname, 'netlify', 'functions', 'api-vocabulary.js');
if (fs.existsSync(apiPath)) {
  console.log('✅ api-vocabulary.js 文件存在');
  
  const content = fs.readFileSync(apiPath, 'utf8');
  
  console.log('\n2. 检查关键修复点：');
  
  if (content.includes("normalizedPath.replace('/api/vocabulary', '')")) {
    console.log('✅ 已添加 /api/vocabulary 路径处理');
  } else {
    console.log('❌ 缺少 /api/vocabulary 路径处理');
  }
  
  if (content.includes('const id = event.pathParameters?.id;')) {
    console.log('✅ 统一使用 event.pathParameters.id');
  } else {
    console.log('❌ 未统一使用 event.pathParameters.id');
  }
  
  if (content.includes('if (id) {')) {
    console.log('✅ 路由匹配逻辑已简化');
  } else {
    console.log('❌ 路由匹配逻辑可能有问题');
  }
  
  console.log('\n3. 检查函数是否完整：');
  const functions = ['getVocabulary', 'updateVocabulary', 'deleteVocabulary'];
  functions.forEach(func => {
    if (content.includes(`async function ${func}(event)`)) {
      console.log(`✅ ${func} 函数存在`);
    } else {
      console.log(`❌ ${func} 函数缺失`);
    }
  });
  
} else {
  console.log('❌ api-vocabulary.js 文件不存在');
}

console.log('\n' + '='.repeat(50));
console.log('检查完成！请部署到 Netlify 后测试生词编辑功能');
