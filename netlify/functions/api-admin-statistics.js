/**
 * 统计数据 API
 * GET /api/admin/statistics - 获取统计数据
 */

const { supabaseAdmin } = require('./supabase/client');
const response = require('./supabase/response');

/**
 * 获取统计数据
 */
async function getStatistics(event) {
  try {
    // 1. 总体统计
    const [
      { count: totalArticles },
      { count: totalSentences },
      { count: publishedArticles },
      { count: draftArticles }
    ] = await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('sentences').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', false)
    ]);
    
    // 2. 按来源类型统计
    const { data: bySourceType } = await supabaseAdmin
      .from('articles')
      .select('source_type');

    const sourceTypeCounts = {};
    bySourceType?.forEach(item => {
      sourceTypeCounts[item.source_type] = (sourceTypeCounts[item.source_type] || 0) + 1;
    });
    
    const bySourceTypeFormatted = Object.entries(sourceTypeCounts).map(([source_type, count]) => ({
      source_type,
      count
    }));
    
    // 3. 按难度统计
    const { data: byDifficultyRaw } = await supabaseAdmin
      .from('sentences')
      .select('extensions->difficulty')
      .not('extensions', 'is', null);
    
    const difficultyCounts = {};
    byDifficultyRaw.forEach(item => {
      const difficulty = item.extensions?.difficulty || 0;
      difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
    });
    
    const byDifficultyFormatted = Object.entries(difficultyCounts)
      .filter(([difficulty]) => difficulty > 0)
      .map(([difficulty, count]) => ({
        difficulty: parseInt(difficulty),
        count
      }))
      .sort((a, b) => a.difficulty - b.difficulty);
    
    // 4. 近期活动（最近 7 天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: articlesLastWeek } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());
    
    const { count: sentencesLastWeek } = await supabaseAdmin
      .from('sentences')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());
    
    // 5. 最新更新的文章
    const { data: recentArticles } = await supabaseAdmin
      .from('articles')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    // 6. 标签统计
    const { data: tagStats } = await supabaseAdmin
      .from('tags')
      .select(`
        id,
        name,
        article_tags!inner(count)
      `);
    
    const topTags = tagStats
      ?.map(t => ({
        id: t.id,
        name: t.name,
        count: t.article_tags?.[0]?.count || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) || [];
    
    // 7. 句子长度分布
    const { data: sentenceLengths } = await supabaseAdmin
      .from('sentences')
      .select('content');
    
    const lengthDistribution = {
      short: 0,      // 1-10 字符
      medium: 0,     // 11-30 字符
      long: 0,       // 31-50 字符
      very_long: 0   // 50+ 字符
    };
    
    sentenceLengths?.forEach(s => {
      const length = s.content.length;
      if (length <= 10) lengthDistribution.short++;
      else if (length <= 30) lengthDistribution.medium++;
      else if (length <= 50) lengthDistribution.long++;
      else lengthDistribution.very_long++;
    });
    
    return response.success({
      overview: {
        total_articles: totalArticles || 0,
        total_sentences: totalSentences || 0,
        published_articles: publishedArticles || 0,
        draft_articles: draftArticles || 0
      },
      by_source_type: bySourceTypeFormatted,
      by_difficulty: byDifficultyFormatted,
      by_sentence_length: lengthDistribution,
      recent_activity: {
        articles_created_last_week: articlesLastWeek || 0,
        sentences_added_last_week: sentencesLastWeek || 0,
        last_updated: recentArticles?.[0]?.updated_at || null
      },
      recent_articles: recentArticles?.map(a => ({
        id: a.id,
        title: a.title,
        updated_at: a.updated_at
      })),
      top_tags: topTags
    });
    
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return response.error('获取统计数据失败', 'DATABASE_ERROR');
  }
}

/**
 * 路由处理
 */
exports.handler = async (event) => {
  let path = event.path.replace('/.netlify/functions/api-admin-statistics', '');
  
  // 处理 /statistics 后缀
  if (path === '/statistics' || path === '') {
    path = '/';
  }
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    if (event.httpMethod !== 'GET') {
      return { ...response.notFound('接口'), headers };
    }
    
    return { ...await getStatistics(event), headers };
    
  } catch (error) {
    console.error('API 处理错误:', error);
    return { ...response.error('服务器内部错误', 'INTERNAL_ERROR', null, 500), headers };
  }
};
