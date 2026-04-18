import { test, expect } from '@playwright/test';

test('测试生词本含义显示和眼睛图标切换功能', async ({ page }) => {
  console.log('=== 开始测试生词本含义显示功能 ===');

  // 访问首页并登录
  await page.goto('http://localhost:8888');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:8888');
  await page.waitForTimeout(2000);

  // 点击生词本触发登录弹窗
  await page.locator('text=生词本').first().click();
  await page.waitForTimeout(2000);

  // 登录
  const modal = page.locator('.modal-content').first();
  await modal.locator('input[type="email"]').fill('1318263468@qq.com');
  await modal.locator('input[type="password"]').fill('123123');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // 进入生词本
  await page.locator('text=生词本').first().click();
  await page.waitForTimeout(2000);

  console.log('✓ 已登录并进入生词本');
  await page.screenshot({ path: 'test-results/meaning-display-step1.png' });

  // 检查生词卡片是否显示含义
  const vocabCards = page.locator('.vocabulary-card');
  const cardCount = await vocabCards.count();
  console.log(`✓ 找到 ${cardCount} 个生词卡片`);

  if (cardCount > 0) {
    const firstCard = vocabCards.first();

    // 检查是否显示含义
    const meaning = firstCard.locator('.vocab-meaning');
    const hasMeaning = await meaning.count() > 0;
    console.log(`✓ 含义显示: ${hasMeaning ? '是' : '否'}`);

    if (hasMeaning) {
      const meaningText = await meaning.textContent();
      console.log(`✓ 含义内容: ${meaningText}`);
    }

    // 检查眼睛图标按钮
    const eyeButton = firstCard.locator('.toggle-meaning-btn');
    const hasEyeButton = await eyeButton.count() > 0;
    console.log(`✓ 眼睛图标按钮: ${hasEyeButton ? '存在' : '不存在'}`);

    if (hasEyeButton) {
      // 点击眼睛图标隐藏含义
      await eyeButton.click();
      await page.waitForTimeout(500);
      console.log('✓ 已点击眼睛图标隐藏含义');
      await page.screenshot({ path: 'test-results/meaning-display-step2-hidden.png' });

      // 验证含义已隐藏
      const meaningAfterHide = firstCard.locator('.vocab-meaning');
      const isMeaningHidden = await meaningAfterHide.count() === 0;
      console.log(`✓ 含义已隐藏: ${isMeaningHidden ? '是' : '否'}`);

      // 再次点击眼睛图标显示含义
      await eyeButton.click();
      await page.waitForTimeout(500);
      console.log('✓ 已点击眼睛图标显示含义');
      await page.screenshot({ path: 'test-results/meaning-display-step3-visible.png' });

      // 验证含义已显示
      const meaningAfterShow = firstCard.locator('.vocab-meaning');
      const isMeaningVisible = await meaningAfterShow.count() > 0;
      console.log(`✓ 含义已显示: ${isMeaningVisible ? '是' : '否'}`);

      if (isMeaningVisible) {
        console.log('✅ 眼睛图标切换含义显示功能测试通过！');
      }
    }

    // 检查其他字段显示
    const hasPhonetic = await firstCard.locator('.phonetic').count() > 0;
    const hasPartOfSpeech = await firstCard.locator('.part-of-speech').count() > 0;
    const hasNotes = await firstCard.locator('.vocab-notes').count() > 0;
    const hasSentence = await firstCard.locator('.vocab-sentence').count() > 0;

    console.log('\n📋 生词卡片字段显示情况:');
    console.log(`  - 音标: ${hasPhonetic ? '✓' : '✗'}`);
    console.log(`  - 词性: ${hasPartOfSpeech ? '✓' : '✗'}`);
    console.log(`  - 含义: ${hasMeaning ? '✓' : '✗'}`);
    console.log(`  - 笔记: ${hasNotes ? '✓' : '✗'}`);
    console.log(`  - 例句: ${hasSentence ? '✓' : '✗'}`);
  }

  console.log('\n=== 测试完成 ===');
});
