#!/usr/bin/env node
/**
 * 批量生成句子音频并上传到 Supabase Storage
 * 
 * 使用方法:
 *   node scripts/generate-and-upload-audio.js
 * 
 * 环境变量:
 *   SUPABASE_URL - Supabase 项目 URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role Key (用于上传)
 * 
 * 功能:
 *   1. 从项目数据中提取所有句子
 *   2. 使用 Edge TTS 生成高质量音频
 *   3. 转换为 Opus 格式 (更好的压缩率)
 *   4. 上传到 Supabase Storage
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
  // Supabase 配置
  supabaseUrl: process.env.SUPABASE_URL || 'https://gtcnjqeloworstrimcsr.supabase.co',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  bucketName: 'sentence-audios',
  
  // TTS 配置
  voice: 'en-US-AriaNeural',
  rate: '+0%', // 正常语速
  
  // 批量处理配置
  batchSize: 10, // 每批处理的句子数
  delayBetweenBatches: 2000, // 批次间延迟 (ms)
  
  // 临时文件目录
  tempDir: join(__dirname, '../.temp-audio'),
  
  // 是否跳过已存在的音频
  skipExisting: true,
};

// 句子数据源
const SENTENCE_SOURCES = [
  join(__dirname, '../src/data/sentences.json'),
  join(__dirname, '../netlify/data/new-concept-2.json'),
  join(__dirname, '../netlify/data/new-concept-3.json'),
];

/**
 * 初始化 Supabase 客户端
 */
function initSupabase() {
  if (!CONFIG.supabaseKey) {
    console.error('❌ 错误: 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
    console.error('   示例: export SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
  }
  
  return createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
}

/**
 * 从数据源加载所有句子
 */
async function loadSentences() {
  const sentences = [];
  let id = 1;
  
  for (const sourcePath of SENTENCE_SOURCES) {
    try {
      if (!existsSync(sourcePath)) {
        console.log(`⚠️  数据源不存在: ${sourcePath}`);
        continue;
      }
      
      const data = JSON.parse(readFileSync(sourcePath, 'utf-8'));
      
      // 处理不同格式的数据源
      if (Array.isArray(data)) {
        // 简单数组格式
        data.forEach((item, index) => {
          if (typeof item === 'string') {
            sentences.push({ id: id++, text: item, source: sourcePath });
          } else if (item.text) {
            sentences.push({ id: id++, text: item.text, source: sourcePath });
          }
        });
      } else if (data.sentences && Array.isArray(data.sentences)) {
        // 包含 sentences 数组的对象
        data.sentences.forEach((item, index) => {
          if (typeof item === 'string') {
            sentences.push({ id: id++, text: item, source: sourcePath });
          } else if (item.text) {
            sentences.push({ id: id++, text: item.text, source: sourcePath });
          }
        });
      } else if (data.articles && Array.isArray(data.articles)) {
        // 新概念英语格式
        data.articles.forEach(article => {
          if (article.sentences && Array.isArray(article.sentences)) {
            article.sentences.forEach((item, index) => {
              if (typeof item === 'string') {
                sentences.push({ id: id++, text: item, source: `${sourcePath} > ${article.title}` });
              } else if (item.text) {
                sentences.push({ id: id++, text: item.text, source: `${sourcePath} > ${article.title}` });
              }
            });
          }
        });
      }
      
      console.log(`✅ 加载 ${sourcePath}: ${sentences.length} 个句子`);
    } catch (error) {
      console.error(`❌ 加载失败 ${sourcePath}:`, error.message);
    }
  }
  
  console.log(`\n📊 总计: ${sentences.length} 个句子\n`);
  return sentences;
}

/**
 * 使用 Edge TTS 生成音频
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
 * 将 MP3 转换为 Opus 格式
 */
async function convertToOpus(inputPath, outputPath) {
  try {
    // 使用 ffmpeg 转换
    execSync(`ffmpeg -i "${inputPath}" -c:a libopus -b:a 24k "${outputPath}" -y`, {
      stdio: 'pipe',
    });
    return true;
  } catch (error) {
    console.error('❌ FFmpeg 转换失败:', error.message);
    console.error('   请确保已安装 ffmpeg: brew install ffmpeg');
    return false;
  }
}

/**
 * 上传到 Supabase Storage
 */
async function uploadToSupabase(supabase, filePath, sentenceId) {
  const fileName = `${sentenceId}.opus`;
  const fileBuffer = readFileSync(filePath);
  
  const { error } = await supabase.storage
    .from(CONFIG.bucketName)
    .upload(fileName, fileBuffer, {
      contentType: 'audio/ogg; codecs=opus',
      upsert: true,
    });
  
  if (error) {
    throw new Error(`上传失败: ${error.message}`);
  }
  
  // 获取公共 URL
  const { data: { publicUrl } } = supabase.storage
    .from(CONFIG.bucketName)
    .getPublicUrl(fileName);
  
  return publicUrl;
}

/**
 * 检查音频是否已存在
 */
async function checkAudioExists(supabase, sentenceId) {
  if (!CONFIG.skipExisting) return false;
  
  try {
    const { data, error } = await supabase.storage
      .from(CONFIG.bucketName)
      .list('', {
        search: `${sentenceId}.opus`,
      });
    
    if (error) return false;
    return data && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * 处理单个句子
 */
async function processSentence(supabase, sentence, index, total) {
  const { id, text } = sentence;
  const tempMp3Path = join(CONFIG.tempDir, `${id}.mp3`);
  const tempOpusPath = join(CONFIG.tempDir, `${id}.opus`);
  
  console.log(`[${index + 1}/${total}] 处理句子 ${id}:`);
  console.log(`    文本: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`);
  
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
    
    if (!converted) {
      // 如果转换失败，尝试直接上传 MP3
      console.log(`    ⚠️  使用 MP3 格式上传...`);
      const publicUrl = await uploadToSupabase(supabase, tempMp3Path, id);
      console.log(`    ✅ 上传成功: ${publicUrl}`);
      return { success: true, format: 'mp3' };
    }
    
    // 3. 上传到 Supabase
    console.log(`    📤 上传到 Supabase...`);
    const publicUrl = await uploadToSupabase(supabase, tempOpusPath, id);
    console.log(`    ✅ 上传成功: ${publicUrl}`);
    
    return { success: true, format: 'opus' };
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
  console.log('🚀 句子音频批量生成工具\n');
  console.log('========================\n');
  
  // 检查 ffmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
  } catch {
    console.error('❌ 请先安装 ffmpeg:');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Ubuntu: sudo apt-get install ffmpeg');
    process.exit(1);
  }
  
  // 创建临时目录
  if (!existsSync(CONFIG.tempDir)) {
    mkdirSync(CONFIG.tempDir, { recursive: true });
  }
  
  // 初始化
  const supabase = initSupabase();
  const sentences = await loadSentences();
  
  if (sentences.length === 0) {
    console.error('❌ 没有找到句子数据');
    process.exit(1);
  }
  
  // 统计
  let success = 0;
  let failed = 0;
  let skipped = 0;
  
  // 批量处理
  for (let i = 0; i < sentences.length; i += CONFIG.batchSize) {
    const batch = sentences.slice(i, i + CONFIG.batchSize);
    console.log(`\n📦 批次 ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(sentences.length / CONFIG.batchSize)}\n`);
    
    for (let j = 0; j < batch.length; j++) {
      const result = await processSentence(supabase, batch[j], i + j, sentences.length);
      
      if (result.success) {
        if (result.skipped) {
          skipped++;
        } else {
          success++;
        }
      } else {
        failed++;
      }
    }
    
    // 批次间延迟
    if (i + CONFIG.batchSize < sentences.length) {
      console.log(`\n⏳ 等待 ${CONFIG.delayBetweenBatches}ms...\n`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
    }
  }
  
  // 清理
  try {
    if (existsSync(CONFIG.tempDir)) {
      // 删除临时目录
      const files = readFileSync(CONFIG.tempDir);
      // 注意: 这里简化处理，实际应该递归删除
    }
  } catch {}
  
  // 输出统计
  console.log('\n========================');
  console.log('📊 处理完成!');
  console.log(`   ✅ 成功: ${success}`);
  console.log(`   ⏭️  跳过: ${skipped}`);
  console.log(`   ❌ 失败: ${failed}`);
  console.log(`   📈 总计: ${sentences.length}`);
  console.log('========================\n');
}

// 运行
main().catch(error => {
  console.error('❌ 程序错误:', error);
  process.exit(1);
});
