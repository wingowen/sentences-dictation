import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list().then((res) => res.data),
    staleTime: 10 * 60 * 1000, // 10 分钟
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; color?: string }) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('标签创建成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '创建失败');
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; name?: string; color?: string }) =>
      tagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('标签更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '更新失败');
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('标签删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '删除失败');
    },
  });
}

export function useAddTagToArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, tagId }: { articleId: number; tagId: number }) =>
      tagsApi.addToArticle(articleId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles', variables.articleId] });
      toast.success('标签添加成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '添加失败');
    },
  });
}

export function useRemoveTagFromArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, tagId }: { articleId: number; tagId: number }) =>
      tagsApi.removeFromArticle(articleId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles', variables.articleId] });
      toast.success('标签移除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '移除失败');
    },
  });
}
