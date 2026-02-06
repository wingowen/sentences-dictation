import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)} />
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner />
    </div>
  );
}
