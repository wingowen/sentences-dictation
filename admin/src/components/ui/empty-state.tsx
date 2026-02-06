import { FileQuestion, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('flex flex-col items-center justify-center p-8', className)}>
      <CardContent className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
        </div>
        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function NotFound({ title = '资源不存在' }: { title?: string }) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-6 w-6" />}
      title={title}
      description="您访问的资源可能已被删除或不存在"
    />
  );
}
