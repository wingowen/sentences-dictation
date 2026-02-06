# 后台管理界面实现方案

## 概述

本文档描述了 sentences-dictation 项目后台管理界面的完整实现方案，包括技术选型、功能设计、组件架构和实现细节。

## 技术选型

### 核心框架
| 类别 | 技术 | 理由 |
|------|------|------|
| 前端框架 | React 19 | 与主项目保持一致 |
| 状态管理 | TanStack Query | 简化数据获取和缓存 |
| 路由 | React Router 7 | 现代化路由方案 |
| UI 组件库 | Shadcn/ui | 轻量、可定制、现代化 |
| 表单处理 | React Hook Form | 高性能表单验证 |
| HTTP 客户端 | Axios | 与现有项目保持一致 |
| 样式方案 | Tailwind CSS | 快速开发、响应式 |
| 图标 | Lucide React | 现代化图标库 |

### 技术优势
- **Shadcn/ui**: 非侵入式设计，可深度定制
- **TanStack Query**: 自动缓存、后台刷新、乐观更新
- **React Hook Form**: 减少重渲染，提升性能

---

## 项目结构

```
admin/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                    # 基础 UI 组件（shadcn）
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── form.tsx
│   │   │   ├── label.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                # 布局组件
│   │   │   ├── AdminLayout.tsx    # 后台主布局
│   │   │   ├── Sidebar.tsx       # 侧边栏
│   │   │   ├── Header.tsx        # 顶部导航
│   │   │   └── PageHeader.tsx    # 页面标题
│   │   │
│   │   ├── articles/              # 文章相关组件
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleForm.tsx
│   │   │   ├── ArticleDetail.tsx
│   │   │   └── SentenceEditor.tsx
│   │   │
│   │   ├── sentences/             # 句子相关组件
│   │   │   ├── SentenceCard.tsx
│   │   │   ├── SentenceEditor.tsx
│   │   │   └── ExtensionEditor.tsx
│   │   │
│   │   ├── tags/                  # 标签相关组件
│   │   │   ├── TagList.tsx
│   │   │   └── TagManager.tsx
│   │   │
│   │   ├── statistics/            # 统计相关组件
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── StatsCharts.tsx
│   │   │   └── ActivityGraph.tsx
│   │   │
│   │   └── common/                # 通用组件
│   │       ├── DataTable.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── pages/                     # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Articles.tsx
│   │   ├── ArticleDetail.tsx
│   │   ├── Sentences.tsx
│   │   ├── Tags.tsx
│   │   ├── Statistics.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                 # API 封装
│   │   ├── supabase.ts            # Supabase 客户端
│   │   ├── auth.ts                # 认证相关
│   │   ├── utils.ts               # 工具函数
│   │   └── constants.ts           # 常量定义
│   │
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── useArticles.ts
│   │   ├── useSentences.ts
│   │   ├── useTags.ts
│   │   ├── useStatistics.ts
│   │   └── useAuth.ts
│   │
│   ├── types/                     # TypeScript 类型定义
│   │   ├── article.ts
│   │   ├── sentence.ts
│   │   ├── tag.ts
│   │   └── api.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 功能模块

### 1. 登录认证

#### 功能描述
- 管理员登录页面
- JWT Token 管理
- 自动登出
- 记住登录状态

#### 页面：`Login.tsx`

```tsx
// 登录表单组件示例
interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });
  
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      toast.error('登录失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>后台管理登录</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} />
                    </FormControl>
                  </FormField>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormField>
                )}
              />
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 2. 仪表盘

#### 功能描述
- 统计概览卡片
- 数据可视化图表
- 近期活动列表
- 快捷操作入口

#### 页面：`Dashboard.tsx`

```tsx
function Dashboard() {
  const { data: stats, isLoading } = useStatistics();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="仪表盘"
        description="欢迎使用后台管理系统"
      />
      
      {/* 统计概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="文章总数"
          value={stats?.overview.total_articles}
          icon={FileText}
          trend={+12}
        />
        <StatsCard
          title="句子总数"
          value={stats?.overview.total_sentences}
          icon={MessageSquare}
          trend={+156}
        />
        <StatsCard
          title="已发布"
          value={stats?.overview.published_articles}
          icon={CheckCircle}
        />
        <StatsCard
          title="草稿"
          value={stats?.overview.draft_articles}
          icon={Edit}
        />
      </div>
      
      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>按来源分布</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceTypeChart data={stats?.by_source_type} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>按难度分布</CardTitle>
          </CardHeader>
          <CardContent>
            <DifficultyChart data={stats?.by_difficulty} />
          </CardContent>
        </Card>
      </div>
      
      {/* 近期活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近更新</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityList data={stats?.recent_articles} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 统计卡片组件

```tsx
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
}

function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend} 相比上周
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 3. 文章管理

#### 功能描述
- 文章列表（支持筛选、搜索、分页）
- 创建/编辑文章
- 文章详情查看
- 句子列表和编辑
- 批量操作

#### 页面：`Articles.tsx`

```tsx
function ArticlesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    source_type: '',
    is_published: undefined
  });
  
  const { data, isLoading, refetch } = useArticles(filters);
  
  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: 'title',
      header: '标题',
      cell: ({ row }) => (
        <Link to={`/articles/${row.original.id}`} className="hover:underline">
          {row.getValue('title')}
        </Link>
      )
    },
    {
      accessorKey: 'source_type',
      header: '来源',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('source_type')}</Badge>
      )
    },
    {
      accessorKey: 'total_sentences',
      header: '句子数',
      cell: ({ row }) => row.getValue('total_sentences')
    },
    {
      accessorKey: 'is_published',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_published') ? 'success' : 'secondary'}>
          {row.getValue('is_published') ? '已发布' : '草稿'}
        </Badge>
      )
    },
    {
      accessorKey: 'updated_at',
      header: '更新时间',
      cell: ({ row }) => formatDate(row.getValue('updated_at'))
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/articles/${row.original.id}`}>查看详情</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600"
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];
  
  return (
    <div className="space-y-4">
      <PageHeader
        title="文章管理"
        description="管理您的学习文章和句子"
        actions={
          <Button asChild>
            <Link to="/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              新建文章
            </Link>
          </Button>
        }
      />
      
      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <Input
              placeholder="搜索文章..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="max-w-xs"
            />
            <Select
              value={filters.source_type}
              onValueChange={(value) => setFilters({ ...filters, source_type: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="来源类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="local">本地</SelectItem>
                <SelectItem value="notion">Notion</SelectItem>
                <SelectItem value="new-concept">新概念</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.is_published}
              onValueChange={(value) => setFilters({ 
                ...filters, 
                is_published: value === '' ? undefined : value === 'true' 
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="true">已发布</SelectItem>
                <SelectItem value="false">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* 数据表格 */}
      <DataTable
        columns={columns}
        data={data?.data.articles || []}
        loading={isLoading}
        pagination={data?.data.pagination}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
}
```

#### 文章编辑页面：`ArticleEditor.tsx`

```tsx
function ArticleEditor({ articleId }: { articleId?: string }) {
  const isEditMode = !!articleId;
  const navigate = useNavigate();
  
  const { data: article, isLoading } = useArticle(articleId);
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  
  const form = useForm<ArticleForm>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      description: '',
      source_type: 'local',
      metadata: { difficulty: 1, tags: [] },
      is_published: false,
      sentences: []
    }
  });
  
  // 编辑模式：加载现有数据
  useEffect(() => {
    if (article && isEditMode) {
      form.reset({
        title: article.article.title,
        description: article.article.description || '',
        source_type: article.article.source_type,
        metadata: article.article.metadata,
        is_published: article.article.is_published,
        sentences: article.article.sentences
      });
    }
  }, [article, isEditMode]);
  
  const onSubmit = async (data: ArticleForm) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: articleId, ...data });
        toast.success('文章更新成功');
      } else {
        const result = await createMutation.mutateAsync(data);
        toast.success('文章创建成功');
        navigate(`/articles/${result.data.article_id}`);
      }
    } catch (error) {
      toast.error(isEditMode ? '更新失败' : '创建失败');
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="container max-w-4xl py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="输入文章标题" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="输入文章描述" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="source_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>来源类型</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="local">本地</SelectItem>
                          <SelectItem value="notion">Notion</SelectItem>
                          <SelectItem value="new-concept">新概念</SelectItem>
                          <SelectItem value="custom">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="published"
                      />
                      <label htmlFor="published" className="text-sm font-medium">
                        立即发布
                      </label>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* 句子列表 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>句子管理</CardTitle>
              <Button type="button" variant="outline" onClick={() => addSentence()}>
                <Plus className="mr-2 h-4 w-4" />
                添加句子
              </Button>
            </CardHeader>
            <CardContent>
              <SortableSentenceList
                sentences={form.watch('sentences') || []}
                onChange={(sentences) => form.setValue('sentences', sentences)}
                onRemove={(index) => {
                  const sentences = form.getValues('sentences');
                  sentences.splice(index, 1);
                  form.setValue('sentences', sentences);
                }}
              />
            </CardContent>
          </Card>
          
          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              取消
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? '保存中...' : isEditMode ? '更新文章' : '创建文章'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

#### 可排序句子列表组件

```tsx
function SortableSentenceList({
  sentences,
  onChange,
  onRemove
}: SortableSentenceListProps) {
  if (sentences.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无句子，点击上方按钮添加
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {sentences.map((sentence, index) => (
        <SentenceEditorRow
          key={sentence.tempId || index}
          index={index}
          sentence={sentence}
          onUpdate={(updated) => {
            const newSentences = [...sentences];
            newSentences[index] = { ...newSentences[index], ...updated };
            onChange(newSentences);
          }}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}

function SentenceEditorRow({
  index,
  sentence,
  onUpdate,
  onRemove
}: SentenceEditorRowProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-sm font-mono">{index + 1}.</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <Input
            value={sentence.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="输入句子内容"
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t bg-gray-50 p-3">
          <SentenceExtensionEditor
            extensions={sentence.extensions || {}}
            onChange={(extensions) => onUpdate({ extensions })}
          />
        </div>
      )}
    </Card>
  );
}
```

---

### 4. 句子管理

#### 功能描述
- 独立句子列表视图
- 批量编辑扩展信息
- 句子筛选和搜索

#### 页面：`Sentences.tsx`

```tsx
function SentencesPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data, isLoading } = useSentences();
  
  const batchUpdateMutation = useBatchUpdateSentences();
  
  const handleBatchUpdate = async (updates: Partial<Sentence>[]) => {
    await batchUpdateMutation.mutateAsync({ sentences: updates });
    setSelectedIds([]);
  };
  
  return (
    <div className="space-y-4">
      <PageHeader
        title="句子管理"
        description="管理所有句子"
        actions={
          selectedIds.length > 0 && (
            <BatchActions
              selectedCount={selectedIds.length}
              onBatchUpdate={handleBatchUpdate}
              onClear={() => setSelectedIds([])}
            />
          )
        }
      />
      
      <DataTable
        columns={sentenceColumns}
        data={data?.data.sentences || []}
        loading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
}
```

#### 扩展信息编辑器组件

```tsx
interface SentenceExtensionEditorProps {
  extensions: SentenceExtension;
  onChange: (extensions: SentenceExtension) => void;
}

function SentenceExtensionEditor({
  extensions,
  onChange
}: SentenceExtensionEditorProps) {
  const updateField = (field: keyof SentenceExtension, value: any) => {
    onChange({ ...extensions, [field]: value });
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 音标 */}
      <FormItem>
        <FormLabel>国际音标</FormLabel>
        <Input
          value={extensions.phonetic || ''}
          onChange={(e) => updateField('phonetic', e.target.value)}
          placeholder="/ðɪs ɪz maɪ bʊk/"
        />
      </FormItem>
      
      {/* 中文翻译 */}
      <FormItem>
        <FormLabel>中文翻译</FormLabel>
        <Input
          value={extensions.translation || ''}
          onChange={(e) => updateField('translation', e.target.value)}
          placeholder="这是我的书"
        />
      </FormItem>
      
      {/* 难度 */}
      <FormItem>
        <FormLabel>难度等级</FormLabel>
        <Select
          value={String(extensions.difficulty || 1)}
          onValueChange={(value) => updateField('difficulty', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - 入门</SelectItem>
            <SelectItem value="2">2 - 初级</SelectItem>
            <SelectItem value="3">3 - 中级</SelectItem>
            <SelectItem value="4">4 - 高级</SelectItem>
            <SelectItem value="5">5 - 专家</SelectItem>
          </SelectContent>
        </Select>
      </FormItem>
      
      {/* 标签 */}
      <FormItem>
        <FormLabel>标签</FormLabel>
        <TagInput
          value={extensions.tags || []}
          onChange={(tags) => updateField('tags', tags)}
        />
      </FormItem>
      
      {/* 语法分析 */}
      <div className="md:col-span-2">
        <FormLabel>语法分析</FormLabel>
        <Textarea
          value={extensions.analysis?.notes?.join('\n') || ''}
          onChange={(e) => updateField('analysis', {
            ...extensions.analysis,
            notes: e.target.value.split('\n').filter(Boolean)
          })}
          placeholder="输入语法笔记（每行一条）"
          rows={3}
        />
      </div>
      
      {/* 记忆技巧 */}
      <div className="md:col-span-2">
        <FormLabel>记忆技巧</FormLabel>
        <Textarea
          value={extensions.memorization_tip || ''}
          onChange={(e) => updateField('memorization_tip', e.target.value)}
          placeholder="输入记忆技巧"
          rows={2}
        />
      </div>
      
      {/* 备注 */}
      <div className="md:col-span-2">
        <FormLabel>备注</FormLabel>
        <Textarea
          value={extensions.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="输入额外备注"
          rows={2}
        />
      </div>
    </div>
  );
}
```

---

### 5. 标签管理

#### 功能描述
- 标签列表
- 创建/编辑/删除标签
- 标签颜色自定义

#### 页面：`Tags.tsx`

```tsx
function TagsPage() {
  const { data: tags, isLoading } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();
  
  const handleCreate = async (data: { name: string; color: string }) => {
    await createMutation.mutateAsync(data);
  };
  
  const handleUpdate = async (id: number, data: { name: string; color: string }) => {
    await updateMutation.mutateAsync({ id, ...data });
  };
  
  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };
  
  return (
    <div className="space-y-4">
      <PageHeader
        title="标签管理"
        description="管理文章标签"
        actions={
          <CreateTagDialog onCreate={handleCreate} />
        }
      />
      
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {tags?.data.tags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            onEdit={(data) => handleUpdate(tag.id, data)}
            onDelete={() => handleDelete(tag.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TagCard({
  tag,
  onEdit,
  onDelete
}: TagCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <Input
              value={tag.name}
              onChange={(e) => {
                const newTag = { ...tag, name: e.target.value };
                // debounced save
              }}
              className="h-8"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium">{tag.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{tag.article_count}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? '完成' : '编辑'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={onDelete}
          >
            删除
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## API 客户端封装

### API 基础配置

```typescript
// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/.netlify/functions/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加认证 token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || '请求失败';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;

// 文章 API
export const articlesApi = {
  list: (params?: ArticleListParams) => 
    api.get<ApiResponse<PaginatedData<Article>>>('/admin/articles', { params }),
  
  get: (id: number) => 
    api.get<ApiResponse<{ article: ArticleWithSentences }>>(`/admin/articles/${id}`),
  
  create: (data: CreateArticleData) => 
    api.post<ApiResponse<{ article_id: number }>>('/admin/articles', data),
  
  update: (id: number, data: UpdateArticleData) => 
    api.put<ApiResponse>(`/admin/articles/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse>(`/admin/articles/${id}`),
  
  importSentences: (id: number, data: ImportSentencesData) => 
    api.post<ApiResponse>(`/admin/articles/${id}/sentences/batch`, data),
  
  reorderSentences: (id: number, mappings: ReorderMapping[]) => 
    api.put<ApiResponse>(`/admin/articles/${id}/sentences/reorder`, { mappings }),
  
  importJson: (articles: ImportArticle[]) => 
    api.post<ApiResponse>('/admin/articles/import/json', { articles })
};

// 句子 API
export const sentencesApi = {
  get: (id: number) => 
    api.get<ApiResponse<{ sentence: Sentence }>>(`/admin/sentences/${id}`),
  
  update: (id: number, data: UpdateSentenceData) => 
    api.put<ApiResponse>(`/admin/sentences/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse>(`/admin/sentences/${id}`),
  
  batchUpdate: (sentences: BatchUpdateSentence[]) => 
    api.put<ApiResponse>('/admin/sentences/batch', { sentences }),
  
  batchDelete: (ids: number[]) => 
    api.delete<ApiResponse>('/admin/sentences/batch', { data: { ids } })
};

// 标签 API
export const tagsApi = {
  list: () => 
    api.get<ApiResponse<{ tags: Tag[] }>>('/admin/tags'),
  
  create: (data: CreateTagData) => 
    api.post<ApiResponse<{ tag: Tag }>>('/admin/tags', data),
  
  update: (id: number, data: UpdateTagData) => 
    api.put<ApiResponse>(`/admin/tags/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse>(`/admin/tags/${id}`),
  
  addToArticle: (articleId: number, tagId: number) => 
    api.post<ApiResponse>('/admin/tags/article', { article_id: articleId, tag_id: tagId }),
  
  removeFromArticle: (articleId: number, tagId: number) => 
    api.delete<ApiResponse>('/admin/tags/article', { 
      data: { article_id: articleId, tag_id: tagId } 
    })
};

// 统计 API
export const statisticsApi = {
  get: () => 
    api.get<ApiResponse<Statistics>>('/admin/statistics')
};
```

---

## React Query Hooks

```typescript
// src/hooks/useArticles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useArticles(params?: ArticleListParams) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articlesApi.list(params).then(res => res.data),
    staleTime: 5 * 60 * 1000 // 5 分钟内不重新请求
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: ['articles', id],
    queryFn: () => articlesApi.get(id).then(res => res.data),
    enabled: !!id
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateArticleData) => articlesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('文章创建成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '创建失败');
    }
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & UpdateArticleData) => 
      articlesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles', variables.id] });
      toast.success('文章更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '更新失败');
    }
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('文章删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '删除失败');
    }
  });
}
```

---

## 类型定义

```typescript
// src/types/article.ts
export interface Article {
  id: number;
  title: string;
  description: string | null;
  source_url: string | null;
  source_type: ArticleSourceType;
  cover_image: string | null;
  total_sentences: number;
  metadata: ArticleMetadata;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithSentences extends Article {
  sentences: Sentence[];
  tags: Tag[];
}

export type ArticleSourceType = 'local' | 'notion' | 'new-concept' | 'custom';

export interface ArticleMetadata {
  difficulty?: number;
  tags?: string[];
  category?: string;
  [key: string]: any;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  search?: string;
  source_type?: string;
  is_published?: boolean;
  order_by?: string;
  order?: 'asc' | 'desc';
}

export interface CreateArticleData {
  title: string;
  description?: string;
  source_url?: string;
  source_type?: ArticleSourceType;
  cover_image?: string;
  metadata?: ArticleMetadata;
  is_published?: boolean;
  sentences?: CreateSentenceData[];
}

export interface UpdateArticleData {
  title?: string;
  description?: string;
  source_url?: string;
  source_type?: ArticleSourceType;
  cover_image?: string;
  metadata?: ArticleMetadata;
  is_published?: boolean;
}
```

```typescript
// src/types/sentence.ts
export interface Sentence {
  id: number;
  article_id: number;
  content: string;
  sequence_order: number;
  extensions: SentenceExtension;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SentenceExtension {
  phonetic?: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  translation?: string;
  translation_en?: string;
  audio_url?: string;
  audio_speed?: number;
  analysis?: SentenceAnalysis;
  vocabulary?: VocabularyItem[];
  tags?: string[];
  difficulty?: number;
  notes?: string;
  memorization_tip?: string;
  related_sentences?: number[];
  statistics?: SentenceStatistics;
}

export interface SentenceAnalysis {
  grammar_point?: string;
  structure?: string;
  notes?: string[];
}

export interface VocabularyItem {
  word: string;
  phonetic?: string;
  meaning: string;
  pos?: string;
  examples?: string[];
}

export interface SentenceStatistics {
  practice_count: number;
  correct_count: number;
  last_practiced_at?: string;
}

export interface CreateSentenceData {
  content: string;
  sequence_order?: number;
  extensions?: SentenceExtension;
}

export interface UpdateSentenceData {
  content?: string;
  sequence_order?: number;
  extensions?: SentenceExtension;
  is_active?: boolean;
}

export interface BatchUpdateSentence {
  id: number;
  content?: string;
  sequence_order?: number;
  extensions?: SentenceExtension;
  is_active?: boolean;
}
```

```typescript
// src/types/tag.ts
export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at?: string;
  article_count?: number;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}
```

```typescript
// src/types/statistics.ts
export interface Statistics {
  overview: {
    total_articles: number;
    total_sentences: number;
    published_articles: number;
    draft_articles: number;
  };
  by_source_type: { source_type: string; count: number }[];
  by_difficulty: { difficulty: number; count: number }[];
  by_sentence_length: {
    short: number;
    medium: number;
    long: number;
    very_long: number;
  };
  recent_activity: {
    articles_created_last_week: number;
    sentences_added_last_week: number;
    last_updated: string | null;
  };
  recent_articles: { id: number; title: string; updated_at: string }[];
  top_tags: { id: number; name: string; count: number }[];
}
```

---

## 环境配置

```env
# .env.example
VITE_API_URL=/.netlify/functions/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 部署

### Netlify 部署

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 构建命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## 总结

本方案提供了一个完整的后台管理界面实现方案，包含：

1. **现代化技术栈**：React 19 + TanStack Query + Shadcn/ui
2. **清晰的架构**：组件、页面、hooks、类型分离
3. **完善的功能**：仪表盘、文章管理、句子管理、标签管理、统计
4. **良好的开发体验**：TypeScript 类型安全、React Query 简化数据获取
5. **易于部署**：支持 Netlify 一键部署

后续可根据实际需求进行调整和扩展。
