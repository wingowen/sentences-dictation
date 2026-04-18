/**
 * 统一爬取新概念英语数据（NCE1 + NCE3）
 * 从 newconceptenglish.com 获取所有课程内容
 * 输出格式统一为 NCE2 标准格式：
 * {
 *   lesson_id: "1-001",
 *   title: "Excuse me!",
 *   chinese_title: "对不起！",
 *   question: "Whose handbag is it?这是谁的手袋？",
 *   sentences: [{ text: "...", translation: "..." }],
 *   original_chinese: "完整中文译文段落"
 * }
 *
 * 用法：
 *   node scrape-nce-unified.js --book 1 --test 3    # 测试：爬取NCE1前3课
 *   node scrape-nce-unified.js --book 1              # 全量爬取NCE1
 *   node scrape-nce-unified.js --book 3 --test 3    # 测试：爬取NCE3前3课
 *   node scrape-nce-unified.js --book 3              # 全量爬取NCE3
 *   node scrape-nce-unified.js --book 1 --book 3     # 全量爬取NCE1+NCE3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://newconceptenglish.com/index.php';

// 解析命令行参数
const args = process.argv.slice(2);
const booksToScrape = [];
let testLimit = 0; // 0 = 全量

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--book') {
    booksToScrape.push(parseInt(args[++i]));
  } else if (args[i] === '--test') {
    testLimit = parseInt(args[++i]);
  }
}

if (booksToScrape.length === 0) {
  console.log('用法: node scrape-nce-unified.js --book <1|3> [--test <数量>]');
  process.exit(1);
}

// 生成课程ID列表
function generateLessonIds(book) {
  const ids = [];
  if (book === 1) {
    // NCE1: 单数课是正文，双数课是练习
    for (let i = 1; i <= 143; i += 2) {
      ids.push(`1-${String(i).padStart(3, '0')}`);
    }
  } else if (book === 3) {
    // NCE3: 全部60课
    for (let i = 1; i <= 60; i++) {
      ids.push(`3-${String(i).padStart(3, '0')}`);
    }
  }
  return ids;
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 清理HTML文本
function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, '')       // 移除HTML标签
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')           // 合并空白
    .trim();
}

// 解析课前问题
function parseQuestion(html) {
  const qMatch = html.match(/<div id="tapequestion">([\s\S]*?)<\/div>/);
  if (!qMatch) return '';

  const qContent = qMatch[1];
  // 提取所有 <p> 标签内容
  const paragraphs = [...qContent.matchAll(/<p>([\s\S]*?)<\/p>/g)];

  // 第一段是指令 "Listen to the tape then answer this question. 听录音..."
  // 第二段是实际问题 "Whose handbag is it? 这是谁的手袋？"
  if (paragraphs.length >= 2) {
    return cleanText(paragraphs[1][1]);
  }

  return '';
}

// 解析英文标题
function parseEnglishTitle(html) {
  // 从 <div class="course-title"> 中的 <p class="art-fonts"> 获取
  const titleMatch = html.match(/<div class="course-title"[^>]*>\s*<p class="art-fonts">([\s\S]*?)<\/p>/);
  if (titleMatch) {
    return cleanText(titleMatch[1]);
  }
  return '';
}

// 解析中文标题
function parseChineseTitle(html) {
  // 从 <div class="course-title-cn"> 中的 <p> 获取
  const cnTitleMatch = html.match(/<div class="course-title-cn"[^>]*>\s*<p>([\s\S]*?)<\/p>/);
  if (cnTitleMatch) {
    return cleanText(cnTitleMatch[1]);
  }
  return '';
}

// 解析英文课文（nce-lessons 区域）
function parseEnglishContent(html) {
  const lessonsMatch = html.match(/<div class="nce nce-lessons">([\s\S]*?)<\/div>\s*<\/div>/);
  if (!lessonsMatch) return [];

  const content = lessonsMatch[1];
  const sentences = [];

  // 检查是否是对话格式（有 message-bubble）
  const hasDialogue = content.includes('message-bubble');

  if (hasDialogue) {
    // 对话格式：提取每个 message-content
    const bubbles = [...content.matchAll(/<div class="message-bubble[^"]*">\s*<span class="message-sender">[\s\S]*?<\/span>\s*<span class="message-content">([\s\S]*?)<\/span>/g)];
    for (const bubble of bubbles) {
      const text = cleanText(bubble[1]);
      if (text && text.length > 0) {
        sentences.push(text);
      }
    }
  } else {
    // 叙述文格式：提取 <p> 段落，然后按句子拆分
    const paragraphs = [...content.matchAll(/<p>([\s\S]*?)<\/p>/g)];
    for (const para of paragraphs) {
      const paraText = cleanText(para[1]);
      if (!paraText || paraText.length === 0) continue;

      // 按句子拆分（句号、问号、感叹号、引号结尾）
      // 注意保留引号内的内容
      const rawSentences = paraText.match(/[^.!?]*[.!?]["']*/g) || [paraText];
      for (const s of rawSentences) {
        const cleaned = s.trim();
        if (cleaned.length > 1) {
          sentences.push(cleaned);
        }
      }
    }
  }

  return sentences;
}

// 解析中文翻译（nce-fanyi 区域）
function parseChineseContent(html) {
  const fanyiMatch = html.match(/<div class="nce nce-fanyi"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
  if (!fanyiMatch) return { sentences: [], original: '', isDialogue: false };

  const content = fanyiMatch[1];
  const sentences = [];
  let originalParts = [];

  // 检查是否是对话格式
  const hasDialogue = content.includes('message-bubble');

  if (hasDialogue) {
    // 对话格式：逐句配对是可行的
    const bubbles = [...content.matchAll(/<div class="message-bubble[^"]*">\s*<span class="message-sender">[\s\S]*?<\/span>\s*<span class="message-content">([\s\S]*?)<\/span>/g)];
    for (const bubble of bubbles) {
      const text = cleanText(bubble[1]);
      if (text && text.length > 0) {
        sentences.push(text);
        originalParts.push(text);
      }
    }
    return { sentences, original: originalParts.join(''), isDialogue: true };
  } else {
    // 叙述文格式：提取完整段落作为 original_chinese
    // 跳过 course-title-cn 中的标题段落
    const paragraphs = [...content.matchAll(/<p>([\s\S]*?)<\/p>/g)];
    for (const para of paragraphs) {
      const paraText = cleanText(para[1]);
      if (!paraText || paraText.length === 0) continue;
      originalParts.push(paraText);
    }
    // 叙述文不做逐句配对，返回空 sentences，仅保留 original
    return { sentences: [], original: originalParts.join(''), isDialogue: false };
  }
}

// 将英文句子和中文翻译配对（仅用于对话格式）
function pairDialogueSentences(enSentences, cnSentences) {
  const pairs = [];
  const maxLen = Math.max(enSentences.length, cnSentences.length);

  for (let i = 0; i < maxLen; i++) {
    pairs.push({
      text: enSentences[i] || '',
      translation: cnSentences[i] || ''
    });
  }

  return pairs;
}

// 构建叙述文格式的句子（英文逐句，翻译留空，完整翻译放 original_chinese）
function buildNarrativeSentences(enSentences) {
  return enSentences.map(text => ({
    text,
    translation: ''
  }));
}

// 获取单课内容
async function fetchLesson(lessonId) {
  try {
    const url = `${BASE_URL}?id=${lessonId}`;
    console.log(`  正在获取: ${lessonId}...`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // 解析各部分
    const title = parseEnglishTitle(html);
    const chineseTitle = parseChineseTitle(html);
    const question = parseQuestion(html);
    const enSentences = parseEnglishContent(html);
    const { sentences: cnSentences, original: originalChinese, isDialogue } = parseChineseContent(html);

    // 根据内容类型配对句子
    let sentences;
    if (isDialogue) {
      // 对话格式：可以逐句配对
      sentences = pairDialogueSentences(enSentences, cnSentences);
    } else {
      // 叙述文格式：英文逐句，翻译留空，完整翻译放 original_chinese
      sentences = buildNarrativeSentences(enSentences);
    }

    // 过滤空句子对
    const filteredSentences = sentences.filter(s => s.text || s.translation);

    await delay(300);

    return {
      lesson_id: lessonId,
      title: title,
      chinese_title: chineseTitle,
      question: question,
      sentences: filteredSentences,
      original_chinese: originalChinese
    };

  } catch (error) {
    console.error(`  获取 ${lessonId} 失败:`, error.message);
    return null;
  }
}

// 爬取指定册
async function scrapeBook(book, testLimit) {
  const lessonIds = generateLessonIds(book);
  const idsToProcess = testLimit > 0 ? lessonIds.slice(0, testLimit) : lessonIds;

  console.log(`\n📚 开始爬取新概念第${book}册 (${testLimit > 0 ? `测试模式: 前${testLimit}课` : `全量模式: ${idsToProcess.length}课`})...`);

  const articles = [];
  let failCount = 0;

  for (let i = 0; i < idsToProcess.length; i++) {
    const lessonId = idsToProcess[i];
    const lesson = await fetchLesson(lessonId);

    if (lesson && lesson.sentences.length > 0) {
      articles.push(lesson);
      console.log(`  ✓ ${lesson.lesson_id}: ${lesson.title || '(无标题)'} | ${lesson.chinese_title || ''} (${lesson.sentences.length}句)`);
    } else if (lesson && lesson.sentences.length === 0) {
      console.log(`  ⚠ ${lessonId}: 无句子内容`);
      failCount++;
    } else {
      console.log(`  ✗ ${lessonId}: 获取失败`);
      failCount++;
    }
  }

  // 构建最终数据
  const data = {
    success: true,
    articles: articles,
    totalArticles: articles.length,
    lastUpdated: new Date().toISOString()
  };

  // 保存文件
  const outputPath = path.join(__dirname, '..', 'src', 'data', `new-concept-${book}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n✅ 第${book}册完成！成功: ${articles.length}课, 失败: ${failCount}课`);
  console.log(`📁 文件已保存: ${outputPath}`);

  // 显示前3课作为示例
  console.log(`\n📖 第${book}册前3课示例:`);
  articles.slice(0, 3).forEach(a => {
    console.log(`\n  ${a.lesson_id}: ${a.title}`);
    console.log(`    中文: ${a.chinese_title}`);
    console.log(`    问题: ${a.question || '(无)'}`);
    console.log(`    句子: ${a.sentences.length}句`);
    a.sentences.slice(0, 3).forEach((s, i) => {
      console.log(`      ${i + 1}. ${s.text}`);
      if (s.translation) console.log(`         ${s.translation}`);
    });
    if (a.sentences.length > 3) {
      console.log(`      ... (共${a.sentences.length}句)`);
    }
  });

  return data;
}

// 主函数
async function main() {
  console.log('🚀 新概念英语统一爬虫');
  console.log(`📋 待爬取册别: ${booksToScrape.join(', ')}`);
  console.log(`🧪 测试模式: ${testLimit > 0 ? `前${testLimit}课` : '关闭（全量）'}`);

  for (const book of booksToScrape) {
    await scrapeBook(book, testLimit);
  }

  console.log('\n🎉 全部完成！');
}

main().catch(console.error);
