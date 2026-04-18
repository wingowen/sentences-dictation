#!/usr/bin/env node
/**
 * 批量生成句子音频并上传到 Supabase Storage (V2)
 * 
 * 这个版本使用与应用完全相同的ID生成逻辑，确保音频和句子正确对应
 * 
 * 使用方法:
 *   node scripts/generate-audio-v2.js
 * 
 * 环境变量:
 *   SUPABASE_URL - Supabase 项目 URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role Key (用于上传)
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

// 导入数据（使用与应用程序相同的数据源）
const newConcept2Data = JSON.parse(readFileSync(join(__dirname, '../netlify/data/new-concept-2.json'), 'utf-8'));
const newConcept3Data = JSON.parse(readFileSync(join(__dirname, '../netlify/data/new-concept-3.json'), 'utf-8'));

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
 * 获取新概念2的句子（使用与 dataService.js 完全相同的逻辑）
 */
function getNewConcept2Sentences() {
  if (!newConcept2Data.success || !newConcept2Data.articles) {
    throw new Error('新概念2数据格式错误');
  }

  return newConcept2Data.articles.flatMap(article =>
    (article.sentences || []).map((sentence, index) => ({
      text: sentence.text || sentence,
      translation: sentence.translation || '',
      id: `nce2-${article.lesson_id || article.title}-${index}`,
      source: 'nce2'
    }))
  ).filter(s => s.text && s.text.trim().length > 0);
}

/**
 * 获取新概念3的句子（使用与 dataService.js 完全相同的逻辑）
 */
function getNewConcept3Sentences() {
  if (!newConcept3Data.success || !newConcept3Data.articles) {
    throw new Error('新概念3数据格式错误');
  }

  // 扁平化所有文章的句子，使用 index + 1 作为ID（与 AppContext.jsx 一致）
  let globalIndex = 0;
  return newConcept3Data.articles.flatMap(article => 
    (article.sentences || []).map(sentence => {
      globalIndex++;
      return {
        text: sentence.text || sentence,
        translation: sentence.translation || '',
        id: globalIndex, // 使用数字ID，与 AppContext 中的 index + 1 一致
        source: 'nce3'
      };
    })
  ).filter(s => s.text && s.text.trim().length > 0);
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
    // 如果转换失败，复制原文件
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
  
  // 检查是否已存在
  if (await checkAudioExists(supabase, id)) {
    console.log(`    ⏭️  已存在，跳过`);
    return { success: true, skipped: true };
  }
  
  try {
    // 1. 生成音频
    console.log(`    🎙️  生成音频...`);
    await generateAudio(text, tempMp3Path);
    
    // 2. 转换为 Opus
    console.log(`    🔄 转换为 Opus...`);
    const converted = await convertToOpus(tempMp3Path, tempOpusPath);
    
    // 3. 上传到 Supabase
    console.log(`    📤 上传到 Supabase...`);
    const publicUrl = await uploadToSupabase(supabase, tempOpusPath, id);
    console.log(`    ✅ 上传成功: ${publicUrl}`);
    
    return { success: true, format: converted ? 'opus' : 'mp3' };
  } catch (error) {
    console.error(`    ❌ 失败:`, error.message);
    return { success: false, error: error.message };
  } finally {
    // 清理临时文件
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
  console.log('🚀 句子音频批量生成工具 V2\n');
  console.log('========================\n');
  
  // 初始化
  const supabase = initSupabase();
  mkdirSync(CONFIG.tempDir, { recursive: true });
  
  // 加载句子
  console.log('📚 加载句子数据...\n');
  
  const nce2Sentences = getNewConcept2Sentences();
  const nce3Sentences = getNewConcept3Sentences();
  
  console.log(`✅ 新概念2: ${nce2Sentences.length} 个句子`);
  console.log(`✅ 新概念3: ${nce3Sentences.length} 个句子`);
  
  const allSentences = [...nce2Sentences, ...nce3Sentences];
  console.log(`\n📊 总计: ${allSentences.length} 个句子\n`);
  
  // 显示ID示例
  console.log('📝 ID示例:');
  console.log(`   新概念2: ${nce2Sentences[0]?.id || 'N/A'}`);
  console.log(`   新概念3: ${nce3Sentences[0]?.id || 'N/A'}`);
  console.log('');
  
  // 处理统计
  const stats = { success: 0, skipped: 0, failed: 0 };
  
  // 分批处理
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
    
    // 批次间延迟
    if (batchIndex < totalBatches - 1) {
      console.log(`\n⏳ 等待 ${CONFIG.delayBetweenBatches}ms...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }
  
  // 输出统计
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
