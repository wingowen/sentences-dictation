// 语音播放诊断脚本 - 在浏览器控制台运行
// 用于测试预加载音频和 Edge TTS 的连接情况

(async function diagnoseAudioPlayback() {
  console.log('🔍 开始语音播放诊断...\n');

  const SUPABASE_URL = 'https://gtcnjqeloworstrimcsr.supabase.co';
  const AUDIO_BUCKET = 'sentence-audios';

  // 1. 检测浏览器 Opus 支持
  console.log('1️⃣ 检测浏览器 Opus 格式支持');
  const audio = document.createElement('audio');
  const canPlayOpus = audio.canPlayType('audio/ogg; codecs=opus') !== '' ||
                      audio.canPlayType('audio/opus') !== '';
  console.log(`   Opus 支持: ${canPlayOpus ? '✅ 支持' : '❌ 不支持'}`);
  console.log(`   audio/ogg; codecs=opus: ${audio.canPlayType('audio/ogg; codecs=opus') || 'no'}`);
  console.log(`   audio/opus: ${audio.canPlayType('audio/opus') || 'no'}`);

  // 2. 测试预加载音频连接
  console.log('\n2️⃣ 测试预加载音频 (Supabase Storage)');
  const testSentenceIds = [1, 2, 3, 100, 101];

  for (const sentenceId of testSentenceIds) {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/${sentenceId}.opus`;
    try {
      const startTime = performance.now();
      const response = await fetch(url, { method: 'HEAD' });
      const duration = (performance.now() - startTime).toFixed(2);

      if (response.ok) {
        console.log(`   ✅ Sentence ${sentenceId}: ${response.status} (${duration}ms)`);
      } else {
        console.log(`   ❌ Sentence ${sentenceId}: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Sentence ${sentenceId}: 网络错误 - ${error.message}`);
    }
  }

  // 3. 测试 Edge TTS API
  console.log('\n3️⃣ 测试 Edge TTS API');
  try {
    const startTime = performance.now();
    const response = await fetch('/.netlify/functions/get-tts-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello world, this is a test.',
        voice: 'en-US-AriaNeural',
        rate: 1.0
      })
    });
    const duration = (performance.now() - startTime).toFixed(2);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Edge TTS: ${response.status} (${duration}ms)`);
      console.log(`   📦 响应大小: ${data.audio ? (data.audio.length / 1024).toFixed(2) : 0} KB`);
      console.log(`   📝 Content-Type: ${data.contentType || 'unknown'}`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`   ❌ Edge TTS: ${response.status} - ${errorData.error || response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Edge TTS: 网络错误 - ${error.message}`);
  }

  // 4. 检测浏览器 SpeechSynthesis 支持
  console.log('\n4️⃣ 检测浏览器 SpeechSynthesis 支持');
  const hasSpeechSynthesis = 'speechSynthesis' in window;
  const hasSpeechSynthesisUtterance = typeof window.SpeechSynthesisUtterance === 'function';
  console.log(`   speechSynthesis: ${hasSpeechSynthesis ? '✅ 支持' : '❌ 不支持'}`);
  console.log(`   SpeechSynthesisUtterance: ${hasSpeechSynthesisUtterance ? '✅ 支持' : '❌ 不支持'}`);

  if (hasSpeechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    console.log(`   🎙️ 可用语音数: ${voices.length}`);
    if (voices.length > 0) {
      console.log(`   📝 示例语音: ${voices[0].name} (${voices[0].lang})`);
    }
  }

  // 5. 网络状态
  console.log('\n5️⃣ 网络状态');
  console.log(`   在线状态: ${navigator.onLine ? '✅ 在线' : '❌ 离线'}`);
  console.log(`   连接类型: ${navigator.connection?.effectiveType || 'unknown'}`);
  console.log(`   下行速度: ${navigator.connection?.downlink || 'unknown'} Mbps`);

  console.log('\n✅ 诊断完成！');
})();
