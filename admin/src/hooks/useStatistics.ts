import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/lib/api';

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => statisticsApi.get().then((res) => res.data),
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
}
