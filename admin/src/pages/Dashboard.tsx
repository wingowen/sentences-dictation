import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/statistics/StatsOverview';
import { RecentActivity, TopTags } from '@/components/statistics/RecentActivity';
import { PageHeader } from '@/components/layout/PageHeader';
import { useStatistics } from '@/hooks/useStatistics';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useStatistics();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['statistics'] });
  };

  const statsData = stats?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="仪表盘"
        description="欢迎使用后台管理系统"
        actions={
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        }
      />

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="文章总数"
          value={statsData?.overview?.total_articles || 0}
          icon={() => <FileText className="h-4 w-4" />}
          trend={statsData?.recent_activity?.articles_created_last_week}
          trendLabel="本周新增"
        />
        <StatsCard
          title="句子总数"
          value={statsData?.overview?.total_sentences || 0}
          icon={() => <MessageSquare className="h-4 w-4" />}
          trend={statsData?.recent_activity?.sentences_added_last_week}
          trendLabel="本周新增"
        />
        <StatsCard
          title="已发布"
          value={statsData?.overview?.published_articles || 0}
          icon={() => <CheckCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="草稿"
          value={statsData?.overview?.draft_articles || 0}
          icon={() => <Edit className="h-4 w-4" />}
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity articles={statsData?.recent_articles || []} />
        <TopTags tags={statsData?.top_tags || []} />
      </div>
    </div>
  );
}

// Add missing imports
import { FileText, MessageSquare, CheckCircle, Edit } from 'lucide-react';
