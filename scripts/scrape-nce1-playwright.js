/**
 * 使用 Playwright 爬取新概念一完整数据
 * 从 newconceptenglish.com 获取所有课程内容
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://newconceptenglish.com/index.php';
const LESSON_IDS = [];

// 只测试前5课
for (let i = 1; i <= 9; i += 2) {
  LESSON_IDS.push(`1-${String(i).padStart(3, '0')}`);
}

console.log(`准备测试爬取 ${LESSON_IDS.length} 课内容...`);

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchLesson(page, lessonId) {
  try {
    const url = `${BASE_URL}?id=${lessonId}`;
    console.log(`正在获取: ${lessonId}...`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    await delay(2000);
    
    // 获取标题
    const titleText = await page.title();
    console.log(`  页面标题: ${titleText}`);
    
    // 尝试获取课文内容 - 新概念一的课文可能在特定区域
    const content = await page.evaluate(() => {
      const results = [];
      
      // 尝试多种选择器找到课文内容
      const selectors = [
        'article p',
        '.article-content p',
        '.lesson-content p',
        '.content p',
        'main p'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 0 && text.length < 500) {
              results.push(text);
            }
          });
          if (results.length > 0) break;
        }
      }
      
      return results;
    });
    
    console.log(`  找到 ${content.length} 个段落`);
    content.slice(0, 10).forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.substring(0, 80)}`);
    });
    
    return {
      lesson_id: lessonId,
      content: content
    };
    
  } catch (error) {
    console.error(`获取 ${lessonId} 失败:`, error.message);
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (const lessonId of LESSON_IDS) {
    const lesson = await fetchLesson(page, lessonId);
    if (lesson) {
      results.push(lesson);
    }
    await delay(1000);
  }
  
  await browser.close();
  
  // 保存测试结果
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'nce1-test.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
  
  console.log(`\n✅ 测试完成！`);
  console.log(`📁 文件已保存: ${outputPath}`);
}

main().catch(console.error);
