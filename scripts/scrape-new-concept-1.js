/**
 * 爬取新概念一完整数据
 * 从 newconceptenglish.com 获取所有课程内容
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://newconceptenglish.com/index.php';
const LESSON_IDS = [];

// 生成课程ID列表（单数课是正文，双数课是练习）
for (let i = 1; i <= 143; i += 2) {
  LESSON_IDS.push(`1-${String(i).padStart(3, '0')}`);
}

console.log(`准备爬取 ${LESSON_IDS.length} 课内容...`);

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取单课内容
async function fetchLesson(lessonId) {
  try {
    const url = `${BASE_URL}?id=${lessonId}`;
    console.log(`正在获取: ${lessonId}...`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // 解析标题 - 从 title 标签获取
    const titleMatch = html.match(/<title>([^<|]+)\|/);
    let fullTitle = titleMatch ? titleMatch[1].trim() : '';
    
    // 移除课程编号前缀 (如 "1-001 ")
    const titleWithoutId = fullTitle.replace(/^\d+-\d+\s*/, '').trim();
    
    // 分离英文和中文标题
    // 查找第一个中文字符的位置
    let englishTitle = titleWithoutId;
    let chineseTitle = '';
    
    const firstChineseMatch = titleWithoutId.match(/[\u4e00-\u9fa5]/);
    if (firstChineseMatch) {
      const firstChineseIndex = titleWithoutId.indexOf(firstChineseMatch[0]);
      englishTitle = titleWithoutId.substring(0, firstChineseIndex).trim();
      chineseTitle = titleWithoutId.substring(firstChineseIndex).trim();
    }
    
    // 解析课文内容
    // 新概念一的课文内容在 article 标签内，对话格式
    let sentences = [];
    
    // 提取 article 内容
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
    if (articleMatch) {
      const article = articleMatch[1];
      
      // 查找所有段落，新概念一的对话通常是简单的一问一答
      const paraMatches = [...article.matchAll(/<p>([\s\S]*?)<\/p>/g)];
      
      for (const match of paraMatches) {
        let text = match[1]
          .replace(/<[^>]+>/g, '') // 移除HTML标签
          .replace(/&nbsp;/g, ' ')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
        
        // 过滤无效内容
        if (!text || text.length === 0) continue;
        if (text.includes('版权') || text.includes('程序：') || 
            text.includes('解析：') || text.includes('地址：') ||
            text.includes('服务：') || text.includes('Apache') ||
            text.includes('DeepSeek') || text.includes('今日访问') ||
            text.includes('当前在线')) continue;
        
        // 新概念一的课文特点：
        // 1. 第一行通常是问句（英文+中文）
        // 2. 后面是对话（纯英文）
        
        // 检查是否包含中英文混合（通常是问句）
        const hasChinese = /[\u4e00-\u9fa5]/.test(text);
        const hasEnglish = /[a-zA-Z]/.test(text);
        
        if (hasChinese && hasEnglish) {
          // 分离英文和中文
          // 找到第一个中文字符的位置
          const firstChineseIdx = text.search(/[\u4e00-\u9fa5]/);
          if (firstChineseIdx > 0) {
            const engPart = text.substring(0, firstChineseIdx).trim();
            const cnPart = text.substring(firstChineseIdx).trim();
            
            if (engPart && cnPart) {
              sentences.push({
                text: engPart,
                translation: cnPart
              });
            }
          }
        } else if (hasEnglish && !hasChinese) {
          // 纯英文句子（对话）
          // 检查是否是有效的英文句子
          if (/^[A-Z][a-zA-Z\s,'.!?-]+$/i.test(text) && text.length > 2 && text.length < 200) {
            sentences.push({
              text: text,
              translation: ''
            });
          }
        } else if (hasChinese && !hasEnglish) {
          // 纯中文句子（可能是对话的翻译或旁白）
          // 检查是否是简短的中文句子（可能是对话）
          if (text.length < 100 && !text.includes('，') && !text.includes('。')) {
            sentences.push({
              text: '',
              translation: text
            });
          }
        }
      }
    }
    
    // 清理句子
    sentences = sentences.filter((s, index, self) => {
      // 去重
      const isDuplicate = index !== self.findIndex(t => 
        t.text === s.text && t.translation === s.translation
      );
      if (isDuplicate) return false;
      
      // 过滤无效内容
      if (s.text && s.text.match(/^\d+\.\d+\.\d+/)) return false; // IP地址
      if (s.text && s.text.includes('ns1.22.cn')) return false;
      if (s.text && s.text.includes('ns2.22.cn')) return false;
      
      return true;
    });
    
    // 限制句子数量
    sentences = sentences.slice(0, 30);
    
    await delay(200);
    
    return {
      lesson_id: lessonId,
      title: englishTitle,
      chinese_title: chineseTitle,
      sentences: sentences
    };
    
  } catch (error) {
    console.error(`获取 ${lessonId} 失败:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  const articles = [];
  
  for (const lessonId of LESSON_IDS) {
    const lesson = await fetchLesson(lessonId);
    if (lesson && lesson.sentences.length > 0) {
      articles.push(lesson);
      console.log(`  ✓ ${lesson.title || lessonId} (${lesson.sentences.length} 句)`);
    } else {
      console.log(`  ✗ ${lessonId} 无内容`);
    }
  }
  
  // 构建最终数据结构（与新概念二、三格式一致）
  const data = {
    success: true,
    articles: articles
  };
  
  // 保存文件
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'new-concept-1.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\n✅ 完成！共爬取 ${articles.length} 课`);
  console.log(`📁 文件已保存: ${outputPath}`);
  
  // 统计信息
  const totalSentences = articles.reduce((sum, a) => sum + a.sentences.length, 0);
  console.log(`📊 总句子数: ${totalSentences}`);
  console.log(`📊 平均每课句子数: ${(totalSentences / articles.length).toFixed(1)}`);
  
  // 显示前5课作为示例
  console.log('\n📖 前5课示例:');
  articles.slice(0, 5).forEach(a => {
    console.log(`\n  ${a.lesson_id}: ${a.title}`);
    console.log(`    中文: ${a.chinese_title}`);
    console.log(`    句子: ${a.sentences.length} 句`);
    a.sentences.slice(0, 3).forEach((s, i) => {
      console.log(`      ${i + 1}. ${s.text}`);
      if (s.translation) console.log(`         ${s.translation}`);
    });
  });
}

main().catch(console.error);
