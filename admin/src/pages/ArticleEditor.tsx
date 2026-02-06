import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useArticle, useCreateArticle, useUpdateArticle } from '@/hooks/useArticles';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingPage } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const articleSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  source_type: z.string().default('local'),
  is_published: z.boolean().default(false),
  sentences: z.array(z.object({
    content: z.string().min(1, '句子内容不能为空'),
    sequence_order: z.number(),
    extensions: z.object({
      phonetic: z.string().optional(),
      translation: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
  })).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export function ArticleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id && id !== 'new';

  const { data: articleData, isLoading } = useArticle(Number(id));
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const [expandedSentence, setExpandedSentence] = useState<number | null>(null);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      source_type: 'local',
      is_published: false,
      sentences: [],
    },
  });

  const { handleSubmit, watch, setValue, formState: { errors } } = form;
  const sentences = watch('sentences') || [];

  // Load existing data for edit mode
  if (isEditMode && articleData?.data?.article && !form.formState.isDirty) {
    const article = articleData.data.article;
    form.reset({
      title: article.title,
      description: article.description || '',
      source_type: article.source_type,
      is_published: article.is_published,
      sentences: article.sentences?.map((s: any) => ({
        content: s.content,
        sequence_order: s.sequence_order,
        extensions: s.extensions || {},
      })) || [],
    });
  }

  const onSubmit = async (data: any) => {
    try {
      const sentencesData = data.sentences?.map((s: any, i: number) => ({
        content: s.content,
        sequence_order: s.sequence_order || i + 1,
        extensions: s.extensions || {},
      })) || [];

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: Number(id), ...data, sentences: sentencesData });
        toast.success('文章更新成功');
      } else {
        const result = await createMutation.mutateAsync({ ...data, sentences: sentencesData });
        toast.success('文章创建成功');
        // 确保正确获取文章 ID，处理不同的返回数据结构
        const articleId = result?.data?.article_id || result?.data?.id;
        if (articleId) {
          navigate(`/articles/${articleId}`);
        } else {
          // 如果无法获取文章 ID，导航到文章列表页面
          navigate('/articles');
        }
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAddSentence = () => {
    const currentSentences = watch('sentences') || [];
    setValue('sentences', [
      ...currentSentences,
      { content: '', sequence_order: currentSentences.length + 1, extensions: {} },
    ]);
    setExpandedSentence(sentences.length);
  };

  const handleRemoveSentence = (index: number) => {
    const currentSentences = watch('sentences') || [];
    currentSentences.splice(index, 1);
    setValue('sentences', currentSentences);
  };

  if (isEditMode && isLoading) return <LoadingPage />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PageHeader
        title={isEditMode ? '编辑文章' : '新建文章'}
        description={isEditMode ? '修改文章信息和句子内容' : '创建新文章'}
        breadcrumbs={[
          { label: '文章管理', path: '/articles' },
          { label: isEditMode ? '编辑' : '新建' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>取消</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <Input
                  {...form.register('title')}
                  placeholder="输入文章标题"
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">描述</label>
                <Textarea
                  {...form.register('description')}
                  placeholder="输入文章描述（可选）"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">来源类型</label>
                  <select
                    {...form.register('source_type')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="local">本地</option>
                    <option value="notion">Notion</option>
                    <option value="new-concept">新概念</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_published"
                    {...form.register('is_published')}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium">立即发布</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sentences */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>句子管理</CardTitle>
              <Button type="button" size="sm" onClick={handleAddSentence}>
                <Plus className="mr-2 h-4 w-4" />
                添加句子
              </Button>
            </CardHeader>
            <CardContent>
              {sentences.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无句子，点击上方按钮添加
                </div>
              ) : (
                <div className="space-y-3">
                  {sentences.map((sentence: any, index: number) => (
                    <SentenceRow
                      key={index}
                      index={index}
                      sentence={sentence}
                      expanded={expandedSentence === index}
                      onToggleExpand={() => setExpandedSentence(
                        expandedSentence === index ? null : index
                      )}
                      onUpdate={(value) => {
                        const current = [...sentences];
                        current[index] = { ...current[index], ...value };
                        setValue('sentences' as any, current);
                      }}
                      onRemove={() => handleRemoveSentence(index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">句子数量</span>
                <span className="font-medium">{sentences.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

interface SentenceRowProps {
  index: number;
  sentence: any;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (value: any) => void;
  onRemove: () => void;
}

function SentenceRow({ index, sentence, expanded, onToggleExpand, onUpdate, onRemove }: SentenceRowProps) {
  return (
    <Card className={cn('overflow-hidden', expanded && 'ring-2 ring-primary')}>
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <Input
            value={sentence?.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={`第 ${index + 1} 句`}
          />
          {expanded && (
            <div className="mt-3 space-y-3 pt-3 border-t">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">音标</label>
                  <Input
                    value={sentence?.extensions?.phonetic || ''}
                    onChange={(e) => onUpdate({
                      extensions: { ...sentence.extensions, phonetic: e.target.value }
                    })}
                    placeholder="/ðɪs ɪz maɪ bʊk/"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">翻译</label>
                  <Input
                    value={sentence?.extensions?.translation || ''}
                    onChange={(e) => onUpdate({
                      extensions: { ...sentence.extensions, translation: e.target.value }
                    })}
                    placeholder="这是我的书"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">备注</label>
                <Textarea
                  value={sentence?.extensions?.notes || ''}
                  onChange={(e) => onUpdate({
                    extensions: { ...sentence.extensions, notes: e.target.value }
                  })}
                  placeholder="可选备注信息"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={onToggleExpand}>
            {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
