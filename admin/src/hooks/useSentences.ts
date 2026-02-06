import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sentencesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useSentences(params?: Record<string, any>) {
  return useQuery({
    queryKey: ['sentences', params],
    queryFn: () => sentencesApi.get(params.id).then((res) => res.data),
    enabled: !!params?.id,
  });
}

export function useSentence(id: number) {
  return useQuery({
    queryKey: ['sentences', id],
    queryFn: () => sentencesApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useUpdateSentence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      sentencesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sentences', variables.id] });
      toast.success('句子更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '更新失败');
    },
  });
}

export function useDeleteSentence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sentencesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences'] });
      toast.success('句子删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '删除失败');
    },
  });
}

export function useBatchUpdateSentences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sentences: any[]) => sentencesApi.batchUpdate(sentences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences'] });
      toast.success('批量更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '批量更新失败');
    },
  });
}

export function useBatchDeleteSentences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => sentencesApi.batchDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences'] });
      toast.success('批量删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '批量删除失败');
    },
  });
}
