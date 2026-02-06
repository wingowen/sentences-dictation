import { useStatistics } from '@/hooks/useStatistics';
import { LoadingPage } from '@/components/ui/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber } from '@/lib/utils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function StatisticsPage() {
  const { data: stats, isLoading, error } = useStatistics();

  if (isLoading) return <LoadingPage />;
  if (error || !stats?.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-red-500 mb-4">加载统计数据失败</p>
      </div>
    );
  }

  const { overview, by_source_type, by_difficulty, recent_activity } = stats.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="统计分析"
        description="数据统计与可视化"
      />

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              文章总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overview.total_articles)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已发布 {formatNumber(overview.published_articles)} / 草稿 {formatNumber(overview.draft_articles)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              句子总数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overview.total_sentences)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本周新增文章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +{formatNumber(recent_activity.articles_created_last_week)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              本周新增句子
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +{formatNumber(recent_activity.sentences_added_last_week)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle>按来源分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={by_source_type || []}
                    dataKey="count"
                    nameKey="source_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(by_source_type || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Chart */}
        <Card>
          <CardHeader>
            <CardTitle>按难度分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={by_difficulty || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="difficulty"
                    tickFormatter={(value) => `难度 ${value}`}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tags */}
      <Card>
        <CardHeader>
          <CardTitle>热门标签 Top 10</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {(stats.data.top_tags || []).slice(0, 10).map((tag: any, index: number) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate">{tag.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(tag.count)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle>最近更新的文章</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats.data.recent_articles || []).map((article: any) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.updated_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
