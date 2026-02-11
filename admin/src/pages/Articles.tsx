import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useArticles, useDeleteArticle } from '@/hooks/useArticles';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  description: string | null;
  source_type: string;
  total_sentences: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function ArticlesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    source_type: 'all',
    is_published: 'all',
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useArticles(filters);
  const deleteMutation = useDeleteArticle();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const articles = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const sourceTypeLabels: Record<string, string> = {
    local: '本地',
    notion: 'Notion',
    'new-concept': '新概念',
    custom: '自定义',
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="文章管理"
        description="管理您的学习文章"
        actions={
          <Button onClick={() => navigate('/articles/new')}>
            <Plus className="mr-2 h-4 w-4" />
            新建文章
          </Button>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文章..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
              className="pl-9"
            />
          </div>
          <Select
            value={filters.source_type}
            onValueChange={(value) => setFilters({ ...filters, source_type: value, page: 1 })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="来源类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="local">本地</SelectItem>
              <SelectItem value="notion">Notion</SelectItem>
              <SelectItem value="new-concept">新概念</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.is_published}
            onValueChange={(value) => setFilters({ ...filters, is_published: value, page: 1 })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">已发布</SelectItem>
              <SelectItem value="false">草稿</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      {articles.length === 0 ? (
        <EmptyState
          title="暂无文章"
          description="点击上方按钮创建您的第一篇文章"
          action={{
            label: '创建文章',
            onClick: () => navigate('/articles/new'),
          }}
        />
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">标题</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">来源</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">句子数</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">状态</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">更新时间</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article: Article) => (
                <tr key={article.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <Link
                      to={`/articles/${article.id}`}
                      className="font-medium hover:underline"
                    >
                      {article.title || '无标题'}
                    </Link>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant="outline">
                      {sourceTypeLabels[article.source_type] || article.source_type}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {article.total_sentences} 条
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={article.is_published ? 'success' : 'secondary'}>
                      {article.is_published ? '已发布' : '草稿'}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground text-sm">
                    {formatDate(article.updated_at)}
                  </td>
                  <td className="p-4 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/articles/${article.id}`)}>
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/articles/${article.id}/edit`)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(article.id)}
                          className="text-red-600"
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">共 {pagination.total} 条</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  {filters.page} / {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={!pagination.has_next}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>此操作将删除该文章及其所有句子，且无法撤销。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>取消</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
