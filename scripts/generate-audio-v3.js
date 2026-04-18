#!/usr/bin/env node
/**
 * 批量生成句子音频并上传到 Supabase Storage (V3 - 统一ID格式)
 * 
 * 统一ID格式: {数据源}-{课程ID}-{句子索引}
 * 例如: nce2-L001-000, nce3-L001-000, simple-0001
 * 
 * 使用方法:
 *   node scripts/generate-audio-v3.js
 */

import { createClient } from '@supabase/supabase-js';
import { EdgeTTS } from 'node-edge-tts';
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL || 'https://gtcnjqeloworstrimcsr.supabase.co',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  bucketName: 'sentence-audios',
  voice: 'en-US-AriaNeural',
  rate: '+0%',
  batchSize: 10,
  delayBetweenBatches: 2000,
  tempDir: join(__dirname, '../.temp-audio'),
};

// 导入数据
const newConcept2Data = JSON.parse(readFileSync(join(__dirname, '../netlify/data/new-concept-2.json'), 'utf-8'));
const newConcept3Data = JSON.parse(readFileSync(join(__dirname, '../netlify/data/new-concept-3.json'), 'utf-8'));

/**
 * 生成统一格式的句子ID
 * @param {string} source - 数据源 (如 'nce2', 'nce3')
 * @param {string|number} lessonId - 课程ID (如 '001', 'L001', 1, '2-001')
 * @param {number} sentenceIndex - 句子索引
 */
function generateSentenceId(source, lessonId, sentenceIndex) {
  const normalizedSource = source.toLowerCase().trim();

  let normalizedLessonId;
  if (typeof lessonId === 'number') {
    normalizedLessonId = `L${String(lessonId).padStart(3, '0')}`;
  } else if (typeof lessonId === 'string') {
    if (lessonId.match(/^L\d{3}$/)) {
      normalizedLessonId = lessonId;
    } else if (lessonId.match(/^\d+-\d+$/)) {
      // 处理 "2-001" 格式，提取最后的数字部分
      const parts = lessonId.split('-');
      const num = parseInt(parts[parts.length - 1], 10) || 1;
      normalizedLessonId = `L${String(num).padStart(3, '0')}`;
    } else {
      const num = parseInt(lessonId.replace(/\D/g, ''), 10) || 1;
      normalizedLessonId = `L${String(num).padStart(3, '0')}`;
    }
  } else {
    normalizedLessonId = 'L001';
  }

  const normalizedIndex = String(sentenceIndex).padStart(3, '0');
  return `${normalizedSource}-${normalizedLessonId}-${normalizedIndex}`;
}

/**
 * 初始化 Supabase 客户端
 */
function initSupabase() {
  if (!CONFIG.supabaseKey) {
    console.error('❌ 错误: 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
    process.exit(1);
  }
  return createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

/**
 * 获取新概念2的句子（使用与 dataService.js 相同的逻辑）
 */
function getNewConcept2Sentences() {
  if (!newConcept2Data.success || !newConcept2Data.articles) {
    throw new Error('新概念2数据格式错误');
  }

  return newConcept2Data.articles.flatMap(article =>
    (article.sentences || []).map((sentence, index) => ({
      text: sentence.text || sentence,
      translation: sentence.translation || '',
      id: generateSentenceId('nce2', article.lesson_id, index),
      source: 'nce2'
    }))
  ).filter(s => s.text && s.text.trim().length > 0);
}

/**
 * 获取新概念3的句子（使用与 dataService.js 相同的逻辑）
 */
function getNewConcept3Sentences() {
  if (!newConcept3Data.success || !newConcept3Data.articles) {
    throw new Error('新概念3数据格式错误');
  }

  let lessonIndex = 0;
  return newConcept3Data.articles.flatMap(article => {
    lessonIndex++;
    return (article.sentences || []).map((sentence, index) => ({
      text: sentence.text || sentence,
      translation: sentence.translation || '',
      id: generateSentenceId('nce3', lessonIndex, index),
      source: 'nce3'
    }));
  }).filter(s => s.text && s.text.trim().length > 0);
}

/**
 * 生成音频
 */
async function generateAudio(text, outputPath) {
  const tts = new EdgeTTS({
    voice: CONFIG.voice,
    lang: 'en-US',
    rate: CONFIG.rate,
    pitch: 'default',
    volume: 'default',
    timeout: 30000,
  });
  
  await tts.ttsPromise(text, outputPath);
}

/**
 * 转换为 Opus 格式
 */
async function convertToOpus(inputPath, outputPath) {
  try {
    execSync(`ffmpeg -i "${inputPath}" -c:a libopus -b:a 24k "${outputPath}" -y`, {
      stdio: 'pipe'
    });
    return true;
  } catch (error) {
    writeFileSync(outputPath, readFileSync(inputPath));
    return false;
  }
}

/**
 * 上传到 Supabase
 */
async function uploadToSupabase(supabase, filePath, sentenceId) {
  const fileContent = readFileSync(filePath);
  const fileName = `${sentenceId}.opus`;
  
  const { error } = await supabase
    .storage
    .from(CONFIG.bucketName)
    .upload(fileName, fileContent, {
      contentType: 'audio/opus',
      upsert: true
    });
  
  if (error) throw error;
  
  return `${CONFIG.supabaseUrl}/storage/v1/object/public/${CONFIG.bucketName}/${fileName}`;
}

/**
 * 检查音频是否已存在
 */
async function checkAudioExists(supabase, sentenceId) {
  const { data } = await supabase
    .storage
    .from(CONFIG.bucketName)
    .list();
  
  if (!data) return false;
  return data.some(file => file.name === `${sentenceId}.opus`);
}

/**
 * 处理单个句子
 */
async function processSentence(supabase, sentence, index, total) {
  const { id, text, source } = sentence;
  const tempMp3Path = join(CONFIG.tempDir, `${id}.mp3`);
  const tempOpusPath = join(CONFIG.tempDir, `${id}.opus`);
  
  console.log(`[${index + 1}/${total}] 处理句子 ${id}:`);
  console.log(`    文本: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`);
  console.log(`    来源: ${source}`);
  
  if (await checkAudioExists(supabase, id)) {
    console.log(`    ⏭️  已存在，跳过`);
    return { success: true, skipped: true };
  }
  
  try {
    console.log(`    🎙️  生成音频...`);
    await generateAudio(text, tempMp3Path);
    
    console.log(`    🔄 转换为 Opus...`);
    const converted = await convertToOpus(tempMp3Path, tempOpusPath);
    
    console.log(`    📤 上传到 Supabase...`);
    const publicUrl = await uploadToSupabase(supabase, tempOpusPath, id);
    console.log(`    ✅ 上传成功`);
    
    return { success: true, format: converted ? 'opus' : 'mp3' };
  } catch (error) {
    console.error(`    ❌ 失败:`, error.message);
    return { success: false, error: error.message };
  } finally {
    try {
      if (existsSync(tempMp3Path)) unlinkSync(tempMp3Path);
      if (existsSync(tempOpusPath)) unlinkSync(tempOpusPath);
    } catch {}
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 句子音频批量生成工具 V3 (统一ID格式)\n');
  console.log('========================\n');
  
  const supabase = initSupabase();
  mkdirSync(CONFIG.tempDir, { recursive: true });
  
  console.log('📚 加载句子数据...\n');
  
  const nce2Sentences = getNewConcept2Sentences();
  const nce3Sentences = getNewConcept3Sentences();
  
  console.log(`✅ 新概念2: ${nce2Sentences.length} 个句子`);
  console.log(`✅ 新概念3: ${nce3Sentences.length} 个句子`);
  
  const allSentences = [...nce2Sentences, ...nce3Sentences];
  console.log(`\n📊 总计: ${allSentences.length} 个句子\n`);
  
  console.log('📝 ID格式示例:');
  console.log(`   新概念2: ${nce2Sentences[0]?.id || 'N/A'}`);
  console.log(`   新概念3: ${nce3Sentences[0]?.id || 'N/A'}`);
  console.log('');
  
  const stats = { success: 0, skipped: 0, failed: 0 };
  const totalBatches = Math.ceil(allSentences.length / CONFIG.batchSize);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * CONFIG.batchSize;
    const end = Math.min(start + CONFIG.batchSize, allSentences.length);
    const batch = allSentences.slice(start, end);
    
    console.log(`\n📦 批次 ${batchIndex + 1}/${totalBatches}`);
    
    for (let i = 0; i < batch.length; i++) {
      const sentence = batch[i];
      const globalIndex = start + i;
      
      const result = await processSentence(supabase, sentence, globalIndex, allSentences.length);
      
      if (result.success) {
        if (result.skipped) stats.skipped++;
        else stats.success++;
      } else {
        stats.failed++;
      }
    }
    
    if (batchIndex < totalBatches - 1) {
      console.log(`\n⏳ 等待 ${CONFIG.delayBetweenBatches}ms...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }
  
  console.log('\n\n========================');
  console.log('📊 处理完成!');
  console.log(`   ✅ 成功: ${stats.success}`);
  console.log(`   ⏭️  跳过: ${stats.skipped}`);
  console.log(`   ❌ 失败: ${stats.failed}`);
  console.log(`   📈 总计: ${allSentences.length}`);
  console.log('========================\n');
}

main().catch(error => {
  console.error('❌ 程序执行失败:', error);
  process.exit(1);
});
