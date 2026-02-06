import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi, CreateArticleData } from '@/lib/api';
import { toast } from 'sonner';

export function useArticles(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articlesApi.list(params).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: ['articles', id],
    queryFn: () => articlesApi.get(id).then((res) => res.data),
    enabled: !!id,
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
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateArticleData>) =>
      articlesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles', variables.id] });
      toast.success('文章更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '更新失败');
    },
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
    },
  });
}

export function useImportSentences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      articlesApi.importSentences(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('句子导入成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '导入失败');
    },
  });
}

export function useReorderSentences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, mappings }: { id: number; mappings: any[] }) =>
      articlesApi.reorderSentences(id, mappings),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['articles', variables.id] });
      toast.success('句子排序更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '排序更新失败');
    },
  });
}

export function useImportArticles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articles: any[]) => articlesApi.importJson(articles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('文章导入成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '导入失败');
    },
  });
}
