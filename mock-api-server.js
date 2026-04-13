import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据库
let vocabularies = [
  {
    id: 1,
    word: 'test',
    phonetic: '/test/',
    meaning: '测试',
    part_of_speech: 'noun',
    notes: '测试单词',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// 模拟用户认证
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: { message: '请先登录' } });
  }
  next();
}

// API 路由
app.get('/api/vocabulary', authenticate, (req, res) => {
  res.json({ success: true, data: { items: vocabularies } });
});

app.post('/api/vocabulary', authenticate, (req, res) => {
  const newVocab = {
    id: vocabularies.length + 1,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  vocabularies.push(newVocab);
  res.json({ success: true, data: newVocab, message: '生词添加成功' });
});

app.get('/api/vocabulary/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const vocab = vocabularies.find(v => v.id === id);
  if (!vocab) {
    return res.status(404).json({ success: false, error: { message: '生词不存在' } });
  }
  res.json({ success: true, data: vocab });
});

app.put('/api/vocabulary/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = vocabularies.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: { message: '生词不存在' } });
  }
  
  const updatedVocab = {
    ...vocabularies[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  vocabularies[index] = updatedVocab;
  res.json({ success: true, data: updatedVocab, message: '生词更新成功' });
});

app.delete('/api/vocabulary/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = vocabularies.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: { message: '生词不存在' } });
  }
  vocabularies.splice(index, 1);
  res.json({ success: true, message: '生词删除成功' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
