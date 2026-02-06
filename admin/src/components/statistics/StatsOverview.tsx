import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, className }: StatsCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value?.toLocaleString() || 0}</p>
        {trend !== undefined && (
          <p className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}{trendLabel && ` ${trendLabel}`}
          </p>
        )}
      </div>
    </div>
  );
}
