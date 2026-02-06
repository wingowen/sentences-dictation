# 后台管理 API 设计

## 概述

- **Base URL**: `/.netlify/functions/`
- **认证方式**: Bearer Token (Supabase JWT)
- **Content-Type**: `application/json`

## 认证中间件

```javascript
// netlify/functions/_middleware/auth.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: '无效的认证令牌' });
    }
    
    // 检查用户角色（需要在 Supabase 中配置）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: '权限不足' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: '认证验证失败' });
  }
};
```

---

## 文章管理 API

### 1. 获取文章列表

**Endpoint**: `GET /api/admin/articles`

**Query Parameters**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |
| source_type | string | 否 | 按来源筛选 |
| is_published | boolean | 否 | 按发布状态筛选 |
| search | string | 否 | 搜索标题 |
| order_by | string | 否 | 排序字段，默认 created_at |
| order | asc/desc | 否 | 排序方向，默认 desc |

**Response**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": 1,
        "title": "简单句练习",
        "description": "基础英语简单句练习",
        "source_type": "local",
        "total_sentences": 50,
        "is_published": true,
        "metadata": {
          "difficulty": 1,
          "tags": ["简单句"],
          "category": "入门"
        },
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

### 2. 获取单篇文章详情

**Endpoint**: `GET /api/admin/articles/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "article": {
      "id": 1,
      "title": "简单句练习",
      "description": "基础英语简单句练习",
      "source_url": null,
      "source_type": "local",
      "cover_image": null,
      "total_sentences": 50,
      "metadata": {
        "difficulty": 1,
        "tags": ["简单句"],
        "category": "入门"
      },
      "is_published": true,
      "sentences": [
        {
          "id": 1,
          "content": "Hello, how are you?",
          "sequence_order": 1,
          "extensions": {
            "phonetic": "/həˈloʊ haʊ ɑːr juː/",
            "translation": "你好，你好吗？",
            "difficulty": 1,
            "tags": ["日常用语"]
          }
        }
      ],
      "tags": [
        { "id": 1, "name": "简单句", "color": "#10B981" }
      ],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 3. 创建文章

**Endpoint**: `POST /api/admin/articles`

**Request Body**:
```json
{
  "title": "新文章标题",
  "description": "文章描述",
  "source_url": "https://...",
  "source_type": "local",
  "cover_image": "https://...",
  "metadata": {
    "difficulty": 2,
    "tags": ["新概念"],
    "category": "教材"
  },
  "is_published": false,
  "sentences": [
    {
      "content": "第一句",
      "sequence_order": 1,
      "extensions": {
        "translation": "翻译",
        "phonetic": "/fɔːrst seɪnt/"
      }
    },
    {
      "content": "第二句",
      "sequence_order": 2,
      "extensions": {}
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "article_id": 101,
    "sentences_created": 2,
    "message": "文章创建成功"
  }
}
```

---

### 4. 更新文章

**Endpoint**: `PUT /api/admin/articles/:id`

**Request Body**:
```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "metadata": {
    "difficulty": 3,
    "tags": ["进阶"],
    "category": "高级"
  },
  "is_published": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "文章更新成功"
}
```

---

### 5. 删除文章

**Endpoint**: `DELETE /api/admin/articles/:id`

**Response**:
```json
{
  "success": true,
  "message": "文章删除成功",
  "data": {
    "deleted_sentences_count": 50
  }
}
```

---

### 6. 批量导入句子

**Endpoint**: `POST /api/admin/articles/:id/sentences/batch`

**Request Body**:
```json
{
  "sentences": [
    {
      "content": "新句子1",
      "sequence_order": 51,
      "extensions": {
        "translation": "翻译1",
        "phonetic": "/.../"
      }
    },
    {
      "content": "新句子2",
      "sequence_order": 52,
      "extensions": {
        "translation": "翻译2"
      }
    }
  ],
  "strategy": "append"  // append | prepend | replace | insert_at
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "imported_count": 2,
    "sentences": [
      { "id": 151, "content": "新句子1", "sequence_order": 51 },
      { "id": 152, "content": "新句子2", "sequence_order": 52 }
    ]
  }
}
```

---

### 7. 重新排序句子

**Endpoint**: `PUT /api/admin/articles/:id/sentences/reorder`

**Request Body**:
```json
{
  "mappings": [
    { "sentence_id": 1, "new_order": 5 },
    { "sentence_id": 5, "new_order": 1 },
    { "sentence_id": 2, "new_order": 2 },
    { "sentence_id": 3, "new_order": 3 },
    { "sentence_id": 4, "new_order": 4 }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "句子排序更新成功"
}
```

---

### 8. 批量导入文章（从 JSON 文件）

**Endpoint**: `POST /api/admin/articles/import/json`

**Request Body**:
```json
{
  "articles": [
    {
      "title": "文章1",
      "description": "描述1",
      "source_type": "local",
      "metadata": { "difficulty": 1 },
      "sentences": ["句子1", "句子2", "句子3"]
    },
    {
      "title": "文章2",
      "description": "描述2",
      "source_type": "new-concept",
      "metadata": { "difficulty": 2 },
      "sentences": ["句子A", "句子B"]
    }
  ]
}
```

---

## 句子管理 API

### 9. 获取句子详情

**Endpoint**: `GET /api/admin/sentences/:id`

**Response**:
```json
{
  "success": true,
  "data": {
    "sentence": {
      "id": 1,
      "article_id": 1,
      "content": "Hello, how are you?",
      "sequence_order": 1,
      "extensions": {
        "phonetic": "/həˈloʊ haʊ ɑːr juː/",
        "translation": "你好，你好吗？",
        "audio_url": "https://...",
        "analysis": {
          "grammar_point": "一般疑问句",
          "structure": "How + be + ...",
          "notes": ["how are you 是问候语"]
        },
        "vocabulary": [
          {
            "word": "hello",
            "phonetic": "/həˈloʊ/",
            "meaning": "你好",
            "pos": "int.",
            "examples": ["Hello! How are you?"]
          }
        ],
        "tags": ["日常用语", "问候"],
        "difficulty": 1
      },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 10. 更新句子

**Endpoint**: `PUT /api/admin/sentences/:id`

**Request Body**:
```json
{
  "content": "更新后的句子",
  "sequence_order": 5,
  "extensions": {
    "phonetic": "/.../",
    "translation": "新翻译",
    "analysis": {
      "grammar_point": "新语法点"
    },
    "vocabulary": [],
    "tags": ["新标签"],
    "difficulty": 2
  },
  "is_active": true
}
```

---

### 11. 批量更新句子

**Endpoint**: `PUT /api/admin/sentences/batch`

**Request Body**:
```json
{
  "sentences": [
    {
      "id": 1,
      "content": "更新内容1",
      "extensions": { "translation": "翻译1" }
    },
    {
      "id": 2,
      "content": "更新内容2",
      "extensions": { "translation": "翻译2" }
    }
  ]
}
```

---

### 12. 删除句子

**Endpoint**: `DELETE /api/admin/sentences/:id`

**Response**:
```json
{
  "success": true,
  "message": "句子删除成功"
}
```

---

### 13. 批量删除句子

**Endpoint**: `DELETE /api/admin/sentences/batch`

**Request Body**:
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

---

## 标签管理 API

### 14. 获取标签列表

**Endpoint**: `GET /api/admin/tags`

**Response**:
```json
{
  "success": true,
  "data": {
    "tags": [
      { "id": 1, "name": "简单句", "color": "#10B981", "article_count": 10 },
      { "id": 2, "name": "复合句", "color": "#F59E0B", "article_count": 5 },
      { "id": 3, "name": "日常用语", "color": "#3B82F6", "article_count": 20 }
    ]
  }
}
```

---

### 15. 创建标签

**Endpoint**: `POST /api/admin/tags`

**Request Body**:
```json
{
  "name": "新标签名",
  "color": "#EC4899"
}
```

---

### 16. 更新标签

**Endpoint**: `PUT /api/admin/tags/:id`

**Request Body**:
```json
{
  "name": "更新后的标签名",
  "color": "#8B5CF6"
}
```

---

### 17. 删除标签

**Endpoint**: `DELETE /api/admin/tags/:id`

---

## 统计 API

### 18. 获取统计数据

**Endpoint**: `GET /api/admin/statistics`

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_articles": 50,
      "total_sentences": 2500,
      "published_articles": 45,
      "draft_articles": 5
    },
    "by_source_type": [
      { "source_type": "local", "count": 30 },
      { "source_type": "new-concept", "count": 15 },
      { "source_type": "notion", "count": 5 }
    ],
    "by_difficulty": [
      { "difficulty": 1, "count": 500 },
      { "difficulty": 2, "count": 800 },
      { "difficulty": 3, "count": 700 },
      { "difficulty": 4, "count": 300 },
      { "difficulty": 5, "count": 200 }
    ],
    "recent_activity": {
      "articles_created_last_week": 3,
      "sentences_added_last_week": 150,
      "last_updated": "2024-01-20T15:30:00Z"
    }
  }
}
```

---

## 公共 API (无需认证)

### 19. 获取已发布文章列表

**Endpoint**: `GET /api/articles`

---

### 20. 获取已发布文章详情

**Endpoint**: `GET /api/articles/:id`

---

### 21. 获取句子（用于前台练习）

**Endpoint**: `GET /api/sentences/:id`

---

### 22. 随机获取句子

**Endpoint**: `GET /api/sentences/random`

**Query Parameters**:
| 参数 | 类型 | 说明 |
|------|------|------|
| article_id | number | 指定文章 |
| difficulty | number | 难度等级 |
| limit | number | 数量限制 |

---

## 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求数据验证失败",
    "details": [
      {
        "field": "title",
        "message": "标题不能为空"
      }
    ]
  }
}
```

### 错误码说明

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| VALIDATION_ERROR | 400 | 请求数据验证失败 |
| NOT_FOUND | 404 | 资源不存在 |
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 权限不足 |
| CONFLICT | 409 | 资源冲突 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 速率限制

- **普通用户**: 100 次/分钟
- **管理员**: 1000 次/分钟
