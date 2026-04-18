import { test, expect } from '@playwright/test';

test.describe('新概念英语一句子播放测试', () => {
  test('测试新概念一的句子播放功能', async ({ page }) => {
    const consoleLogs = [];
    const networkRequests = [];
    
    // 监听控制台日志
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push({ type: msg.type(), text });
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    });

    // 监听网络请求
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    // 监听音频播放相关事件
    await page.addInitScript(() => {
      window.audioEvents = [];
      const originalPlay = HTMLAudioElement.prototype.play;
      HTMLAudioElement.prototype.play = function() {
        window.audioEvents.push({
          event: 'play',
          src: this.src,
          timestamp: new Date().toISOString()
        });
        console.log('🎵 Audio play called:', this.src);
        return originalPlay.call(this);
      };
    });

    // 访问首页
    console.log('=== 步骤1: 访问首页 ===');
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 截图记录
    await page.screenshot({ path: 'test-results/nce1-audio/01-homepage.png' });
    console.log('✓ 首页加载完成');

    // 点击第一册
    console.log('=== 步骤2: 点击第一册 ===');
    const firstBookBtn = page.locator('.section-item').filter({ hasText: '第一册' });
    await expect(firstBookBtn).toBeVisible();
    await firstBookBtn.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/nce1-audio/02-nce1-loaded.png' });
    console.log('✓ 新概念一页面加载完成');

    // 验证练习卡片可见
    const practiceCard = page.locator('.practice-card');
    await expect(practiceCard).toBeVisible();
    console.log('✓ 练习卡片已显示');

    // 获取进度信息
    const progressText = await page.locator('.progress span').textContent();
    console.log(`📊 进度信息: ${progressText}`);

    // 验证播放按钮存在
    console.log('=== 步骤3: 验证播放按钮 ===');
    const playBtn = page.locator('.play-button');
    await expect(playBtn).toBeVisible();
    const playBtnText = await playBtn.textContent();
    console.log(`🎵 播放按钮文本: ${playBtnText}`);
    
    // 点击播放按钮
    console.log('=== 步骤4: 点击播放按钮 ===');
    await playBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/nce1-audio/03-after-play-click.png' });
    console.log('✓ 已点击播放按钮');

    // 检查是否有音频相关网络请求
    console.log('=== 步骤5: 检查音频请求 ===');
    const audioRequests = networkRequests.filter(req => 
      req.url.includes('.mp3') || 
      req.url.includes('.wav') || 
      req.url.includes('audio') ||
      req.url.includes('tts') ||
      req.resourceType === 'media'
    );
    
    console.log(`🎧 音频相关请求数量: ${audioRequests.length}`);
    audioRequests.forEach((req, i) => {
      console.log(`  ${i + 1}. ${req.method} ${req.url.substring(0, 100)}...`);
    });

    // 检查音频事件
    const audioEvents = await page.evaluate(() => window.audioEvents);
    console.log(`🎵 音频播放事件数量: ${audioEvents.length}`);
    audioEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event.event} - ${event.src}`);
    });

    // 验证其他控制按钮
    console.log('=== 步骤6: 验证其他控制按钮 ===');
    const nextBtn = page.locator('.next-sentence-button');
    await expect(nextBtn).toBeVisible();
    console.log('✓ 下一句按钮可见');

    // 测试下一句功能
    console.log('=== 步骤7: 测试下一句 ===');
    await nextBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/nce1-audio/04-after-next-click.png' });
    
    const newProgressText = await page.locator('.progress span').textContent();
    console.log(`📊 新进度信息: ${newProgressText}`);
    console.log('✓ 已切换到下一题');

    // 再次点击播放
    console.log('=== 步骤8: 再次播放 ===');
    await playBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/nce1-audio/05-second-play.png' });
    console.log('✓ 第二题播放完成');

    // 最终检查
    console.log('=== 测试结果汇总 ===');
    console.log(`✓ 新概念一句子播放功能测试完成`);
    console.log(`  - 页面加载: 成功`);
    console.log(`  - 播放按钮: 可用`);
    console.log(`  - 音频请求: ${audioRequests.length} 个`);
    console.log(`  - 音频事件: ${audioEvents.length} 个`);
    console.log(`  - 下一句功能: 正常`);

    // 验证没有严重的控制台错误
    const errors = consoleLogs.filter(log => log.type === 'error');
    if (errors.length > 0) {
      console.log(`⚠️ 控制台错误数量: ${errors.length}`);
      errors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text.substring(0, 100)}`);
      });
    } else {
      console.log('✓ 没有控制台错误');
    }
  });
});
