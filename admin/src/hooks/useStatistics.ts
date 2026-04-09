import { useQuery } from '@tanstack/react-query';
import { statisticsApi, ApiResponse, Statistics } from '@/lib/api';

export function useStatistics() {
  return useQuery<ApiResponse<Statistics>>({
    queryKey: ['statistics'],
    queryFn: () => statisticsApi.get(),  // axios interceptor already returns response.data
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
}
