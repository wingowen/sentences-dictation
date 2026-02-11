import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingPage } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function TagsPage() {
  const { data, isLoading, error } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6' });

  const handleOpenCreate = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '#3B82F6' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('标签名称不能为空');
      return;
    }

    try {
      if (editingTag) {
        await updateMutation.mutateAsync({ id: editingTag.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此标签吗？相关文章不会被删除。')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="p-8 text-center text-red-500">加载失败</div>;

  const tags = data?.data?.tags || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="标签管理"
        description="管理文章标签"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建标签
          </Button>
        }
      />

      {/* Tag Grid */}
      {tags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无标签</h3>
            <p className="text-muted-foreground mb-4">创建标签来更好地组织您的文章</p>
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              创建标签
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag: any) => (
            <Card key={tag.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium truncate">{tag.name}</span>
                  </div>
                  <Badge variant="secondary">{tag.article_count || 0}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? '编辑标签' : '新建标签'}</DialogTitle>
            <DialogDescription>
              {editingTag ? '修改标签名称和颜色' : '创建新标签用于分类文章'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">标签名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入标签名称"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">颜色</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      formData.color === color
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
