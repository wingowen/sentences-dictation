/**
 * Express Server - 模拟 Netlify Functions
 * 将 Netlify Functions 转换为 Express 路由
 */

// 加载环境变量
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 环境变量 - 从 process.env 读取，兼容 Netlify Functions 模式
const {
  SUPABASE_URL = process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY,
  NOTION_API_KEY = process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID
} = process.env;

// 设置环境变量供子模块使用
process.env.SUPABASE_URL = SUPABASE_URL;
process.env.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY;
process.env.NOTION_API_KEY = NOTION_API_KEY;
process.env.NOTION_DATABASE_ID = NOTION_DATABASE_ID;

// 模拟 Netlify Functions 加载器
async function loadFunction(funcPath) {
  const fullPath = path.join(__dirname, 'netlify/functions', funcPath);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  try {
    // 尝试 CommonJS
    const func = require(fullPath);
    return func;
  } catch (e) {
    // 如果 CommonJS 失败，尝试 ES 模块动态导入
    if (e.code === 'ERR_REQUIRE_ESM' || e.message.includes('export')) {
      try {
        const func = await import(fullPath);
        return func.default || func;
      } catch (e2) {
        console.log(`⚠️ ES module load failed for ${funcPath}: ${e2.message}`);
        return null;
      }
    }
    throw e;
  }
}

// 加载所有 Functions
const functions = {
  'get-supabase-content': null,
  'get-notion-sentences': null,
  'get-new-concept-2': null,
  'get-new-concept-2-lesson': null,
  'get-new-concept-3': null,
  'get-new-concept-3-lesson': null,
  'get-real-article-link': null,
  'get-tts-audio': null,
  'api-vocabulary': null,
  'api-admin-articles': null,
  'api-admin-sentences': null,
  'api-admin-statistics': null,
  'api-admin-tags': null,
  'auth': null
};

// 初始化 Functions
Object.keys(functions).forEach(async (name) => {
  try {
    const func = await loadFunction(`${name}.js`);
    if (func) {
      functions[name] = func;
      console.log(`✅ Loaded function: ${name}`);
    }
  } catch (e) {
    console.log(`⚠️ Failed to load ${name}: ${e.message}`);
  }
});

// 静态文件服务 (前端)
app.use(express.static(path.join(__dirname, 'dist')));

// API 路由 - 模拟 /api/* → Netlify Functions
app.all('/api/*', async (req, res) => {
  const pathParts = req.path.replace(/^\/api\//, '').split('/');
  const baseName = pathParts[0];
  
  let func = functions[baseName];
  if (!func && functions[`api-${baseName}`]) {
    func = functions[`api-${baseName}`];
  }
  
  if (!func) {
    return res.status(404).json({ error: 'Function not found' });
  }
  
  const pathParameters = {};
  if (pathParts.length > 1) {
    pathParameters.id = pathParts[1];
  }
  
  const event = {
    httpMethod: req.method,
    path: req.path,
    queryStringParameters: req.query,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : null,
    isBase64Encoded: false,
    pathParameters
  };
  
  try {
    const result = await (typeof func.handler === 'function' 
      ? func.handler(event, {}) 
      : func(event, {}));
    
    res.status(result.statusCode || 200)
       .set(result.headers || {})
       .send(result.body || '');
  } catch (e) {
    console.error(`Error in ${baseName}:`, e);
    res.status(500).json({ error: e.message });
  }
});

// API-Admin 路由
app.all('/api-admin/:func(*)', async (req, res) => {
  const funcName = `api-${req.params.func.replace('/', '-')}`;
  const func = functions[funcName];
  
  if (!func) {
    return res.status(404).json({ error: 'Function not found' });
  }
  
  const event = {
    httpMethod: req.method,
    path: req.path,
    queryStringParameters: req.query,
    headers: req.headers,
    body: req.body ? JSON.stringify(req.body) : null
  };
  
  try {
    const result = await (typeof func.handler === 'function' 
      ? func.handler(event, {}) 
      : func(event, {}));
    
    res.status(result.statusCode || 200)
       .set(result.headers || {})
       .send(result.body || '');
  } catch (e) {
    console.error(`Error in ${funcName}:`, e);
    res.status(500).json({ error: e.message });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/*`);
});