import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useArticle, useDeleteArticle } from '@/hooks/useArticles';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingPage } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';

export function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useArticle(Number(id));
  const deleteMutation = useDeleteArticle();

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(Number(id));
      navigate('/articles');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) return <LoadingPage />;
  if (error || !data?.data?.article) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-red-500 mb-4">文章不存在或加载失败</p>
        <Button onClick={() => navigate('/articles')}>返回列表</Button>
      </div>
    );
  }

  const { article } = data.data;
  const sourceTypeLabels: Record<string, string> = {
    local: '本地',
    notion: 'Notion',
    'new-concept': '新概念',
    custom: '自定义',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={article.title}
        description={article.description || '文章详情'}
        breadcrumbs={[
          { label: '文章管理', path: '/articles' },
          { label: article.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/articles')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <Button onClick={() => navigate(`/articles/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">句子数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{article.total_sentences}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">来源类型</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">
              {sourceTypeLabels[article.source_type] || article.source_type}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">发布状态</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={article.is_published ? 'success' : 'secondary'}>
              {article.is_published ? '已发布' : '草稿'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">更新时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{formatDate(article.updated_at)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sentences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>句子列表</span>
            <span className="text-sm font-normal text-muted-foreground">
              共 {article.sentences?.length || 0} 条
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {article.sentences?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无句子</div>
          ) : (
            <div className="space-y-3">
              {article.sentences?.map((sentence: any, index: number) => (
                <div
                  key={sentence.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base">{sentence.content}</p>
                      {(sentence.extensions?.phonetic || sentence.extensions?.translation) && (
                        <div className="mt-2 space-y-1">
                          {sentence.extensions?.phonetic && (
                            <p className="text-sm text-muted-foreground">
                              /{sentence.extensions.phonetic}/
                            </p>
                          )}
                          {sentence.extensions?.translation && (
                            <p className="text-sm text-muted-foreground">
                              {sentence.extensions.translation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
