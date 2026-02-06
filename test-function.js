// 测试 Netlify Function 的简单脚本
const http = require('http');

function testFunction() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:8888/.netlify/functions/get-notion-sentences', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      console.error('Error:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 先启动服务器，然后运行这个测试
console.log('请在另一个终端运行: netlify dev');
console.log('等待服务器启动后，再运行此测试');