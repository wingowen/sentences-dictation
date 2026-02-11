import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
      toast.success('登录成功');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || '登录失败');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      // 即使失败也清除状态
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
}
