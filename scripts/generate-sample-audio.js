#!/usr/bin/env node
/**
 * 生成示例音频文件用于试听
 */

import { EdgeTTS } from 'node-edge-tts';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 示例句子
const SAMPLE_SENTENCES = [
  { id: 1, text: "Hello, how are you today?" },
  { id: 2, text: "The quick brown fox jumps over the lazy dog." },
  { id: 3, text: "Practice makes perfect." },
  { id: 4, text: "Every cloud has a silver lining." },
  { id: 5, text: "Where there's a will, there's a way." },
];

const OUTPUT_DIR = join(__dirname, '../.temp-audio');

async function generateAudio(text, outputPath) {
  const tts = new EdgeTTS({
    voice: 'en-US-AriaNeural',
    lang: 'en-US',
    rate: '+0%',
    pitch: 'default',
    volume: 'default',
    timeout: 30000,
  });
  
  await tts.ttsPromise(text, outputPath);
}

async function main() {
  console.log('🎙️  生成示例音频文件\n');
  
  // 创建输出目录
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  for (const sentence of SAMPLE_SENTENCES) {
    const outputPath = join(OUTPUT_DIR, `sample-${sentence.id}.mp3`);
    console.log(`[${sentence.id}/5] ${sentence.text}`);
    
    try {
      await generateAudio(sentence.text, outputPath);
      console.log(`    ✅ 已生成: ${outputPath}`);
    } catch (error) {
      console.error(`    ❌ 失败:`, error.message);
    }
  }
  
  console.log('\n✅ 完成！音频文件保存在 .temp-audio/ 目录');
}

main().catch(console.error);
