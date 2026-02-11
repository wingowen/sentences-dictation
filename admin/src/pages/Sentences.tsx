import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';

export function SentencesPage() {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('article_id');
  const [selectedSentences, setSelectedSentences] = useState<number[]>([]);
  const [editSentence, setEditSentence] = useState<any>(null);
  const [batchExtensions, setBatchExtensions] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sentences-list', articleId],
    queryFn: async () => {
      if (articleId) {
        const res = await articlesApi.get(Number(articleId));
        return res;
      }
      // If no article selected, fetch all articles and flatten
      const res = await articlesApi.list({ limit: 100 });
      return res;
    },
  });

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      articlesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences-list'] });
      setEditSentence(null);
      toast.success('更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '更新失败');
    },
  });

  const sentences = articleId
    ? data?.data?.article?.sentences || []
    : data?.data?.items?.flatMap((a: any) =>
        a.sentences?.map((s: any) => ({ ...s, article_title: a.title })) || []
      ) || [];

  const handleBatchUpdate = async () => {
    if (!batchExtensions.trim()) return;
    try {
      for (const id of selectedSentences) {
        await updateMutation.mutateAsync({
          id,
          data: { extensions: JSON.parse(batchExtensions) },
        });
      }
      setSelectedSentences([]);
      setBatchExtensions('');
    } catch (error) {
      toast.error('JSON 格式错误');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300"
        />
      ),
    },
    {
      accessorKey: 'content',
      header: '句子内容',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="truncate">{row.getValue('content')}</p>
          {!articleId && (
            <p className="text-xs text-muted-foreground mt-1">
              来自: {row.original.article_title || '未知文章'}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'extensions.translation',
      header: '翻译',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.extensions?.translation || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'extensions.phonetic',
      header: '音标',
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-1 rounded">
          {row.original.extensions?.phonetic || '-'}
        </code>
      ),
    },
    {
      accessorKey: 'extensions.difficulty',
      header: '难度',
      cell: ({ row }) => (
        row.original.extensions?.difficulty ? (
          <Badge variant="outline">Lv.{row.original.extensions.difficulty}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      accessorKey: 'sequence_order',
      header: '序号',
      cell: ({ row }) => <span className="text-muted-foreground">#{row.getValue('sequence_order')}</span>,
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
            <DropdownMenuItem onClick={() => setEditSentence(row.original)}>
              编辑详情
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/articles/${row.original.article_id}`}>
                查看文章
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: sentences,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="句子管理"
        description="管理所有句子的扩展信息"
        breadcrumbs={[
          { label: '句子管理' },
        ]}
        actions={
          selectedSentences.length > 0 && (
            <Button variant="outline" onClick={() => setSelectedSentences([])}>
              取消选择 ({selectedSentences.length})
            </Button>
          )
        }
      />

      {/* Info Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {articleId ? '查看单个文章的句子' : '查看所有句子（按文章分组）'}
            </div>
            {articleId && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/sentences">查看全部</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedSentences.length > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                已选择 {selectedSentences.length} 条句子
              </span>
              <Button size="sm" onClick={handleBatchUpdate}>
                批量更新
              </Button>
              <Textarea
                placeholder='{"translation": "翻译", "phonetic": "/音标/"}'
                value={batchExtensions}
                onChange={(e) => setBatchExtensions(e.target.value)}
                className="flex-1 h-10 text-xs"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {sentences.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-6 w-6" />}
          title="暂无句子"
          description={articleId ? '该文章暂无句子' : '请先创建文章和句子'}
          action={
            !articleId
              ? {
                  label: '创建文章',
                  onClick: () => {},
                }
              : undefined
          }
        />
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editSentence} onOpenChange={() => setEditSentence(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑句子</DialogTitle>
            <DialogDescription>修改句子的详细信息</DialogDescription>
          </DialogHeader>
          {editSentence && (
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium">句子内容</label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{editSentence.content}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">音标</label>
                  <Input
                    value={editSentence.extensions?.phonetic || ''}
                    onChange={(e) => setEditSentence({
                      ...editSentence,
                      extensions: { ...editSentence.extensions, phonetic: e.target.value }
                    })}
                    placeholder="/ðɪs ɪz maɪ bʊk/"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">翻译</label>
                  <Input
                    value={editSentence.extensions?.translation || ''}
                    onChange={(e) => setEditSentence({
                      ...editSentence,
                      extensions: { ...editSentence.extensions, translation: e.target.value }
                    })}
                    placeholder="这是我的书"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">备注</label>
                <Textarea
                  value={editSentence.extensions?.notes || ''}
                  onChange={(e) => setEditSentence({
                    ...editSentence,
                    extensions: { ...editSentence.extensions, notes: e.target.value }
                  })}
                  placeholder="输入备注信息"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSentence(null)}>
              取消
            </Button>
            <Button
              onClick={() => updateMutation.mutate({ id: editSentence.id, data: editSentence })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
