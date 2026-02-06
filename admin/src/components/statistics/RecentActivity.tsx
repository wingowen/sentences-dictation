import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface RecentArticle {
  id: number;
  title: string;
  updated_at: string;
}

interface RecentActivityProps {
  articles: RecentArticle[];
}

export function RecentActivity({ articles }: RecentActivityProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">最近更新</h3>
        <p className="text-sm text-muted-foreground">暂无更新记录</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">最近更新</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/articles">查看全部</Link>
        </Button>
      </div>
      <div className="space-y-3">
        {articles.slice(0, 5).map((article) => (
          <Link
            key={article.id}
            to={`/articles/${article.id}`}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{article.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(article.updated_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface TopTag {
  id: number;
  name: string;
  count: number;
}

interface TopTagsProps {
  tags: TopTag[];
}

export function TopTags({ tags }: TopTagsProps) {
  if (!tags || tags.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">热门标签</h3>
        <p className="text-sm text-muted-foreground">暂无标签</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">热门标签</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/tags">管理标签</Link>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 8).map((tag) => (
          <Link
            key={tag.id}
            to={`/tags?search=${tag.name}`}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm hover:bg-muted transition-colors"
          >
            <span>{tag.name}</span>
            <span className="text-xs text-muted-foreground">{tag.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
