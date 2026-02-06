import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';

export function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  const handleSave = () => {
    toast.success('设置已保存（请在 .env 文件中配置环境变量）');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="系统设置"
        description="配置系统参数"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <User className="mr-2 h-4 w-4" />
            通用
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            数据库
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>通用设置</CardTitle>
              <CardDescription>常规配置选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">应用名称</label>
                <Input defaultValue="句子听写 - 后台管理" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">每页显示数量</label>
                <Input type="number" defaultValue="20" className="mt-1 w-32" />
              </div>
              <Button onClick={handleSave}>保存设置</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Supabase 数据库配置</CardTitle>
              <CardDescription>配置 Supabase 连接信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project URL</label>
                <Input
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  在 .env 文件中配置: VITE_SUPABASE_URL
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Anon Key</label>
                <Input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="your-anon-key"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  在 .env 文件中配置: VITE_SUPABASE_ANON_KEY
                </p>
              </div>
              <Button onClick={handleSave}>保存配置</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API 配置</CardTitle>
              <CardDescription>API 端点配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">API Base URL</label>
                <Input
                  defaultValue="/.netlify/functions/api"
                  disabled
                  className="mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  API 请求将发送到 Netlify Functions
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Admin API 端点</label>
                <div className="mt-1 space-y-2">
                  <p className="text-sm text-muted-foreground">• GET /admin/articles - 文章列表</p>
                  <p className="text-sm text-muted-foreground">• POST /admin/articles - 创建文章</p>
                  <p className="text-sm text-muted-foreground">• GET /admin/sentences - 句子列表</p>
                  <p className="text-sm text-muted-foreground">• GET /admin/tags - 标签列表</p>
                  <p className="text-sm text-muted-foreground">• GET /admin/statistics - 统计数据</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
