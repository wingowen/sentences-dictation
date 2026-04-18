#!/usr/bin/env node
/**
 * 清空 Supabase Storage 中的音频文件
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gtcnjqeloworstrimcsr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'sentence-audios';

async function clearAllAudio() {
  if (!SUPABASE_KEY) {
    console.error('❌ 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('🗑️  正在清空 Supabase Storage...\n');

  // 获取所有文件
  const { data: files, error: listError } = await supabase
    .storage
    .from(BUCKET_NAME)
    .list();

  if (listError) {
    console.error('❌ 获取文件列表失败:', listError.message);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log('✅ Storage 已经是空的');
    return;
  }

  console.log(`📊 找到 ${files.length} 个文件`);

  // 删除所有文件
  const fileNames = files.map(f => f.name);
  const { error: deleteError } = await supabase
    .storage
    .from(BUCKET_NAME)
    .remove(fileNames);

  if (deleteError) {
    console.error('❌ 删除失败:', deleteError.message);
    process.exit(1);
  }

  console.log(`✅ 成功删除 ${fileNames.length} 个文件`);
}

clearAllAudio().catch(console.error);
