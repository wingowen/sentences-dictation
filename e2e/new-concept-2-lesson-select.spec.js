import { test, expect } from '@playwright/test';

test.describe('新概念英语第二册文章选择测试', () => {
  test('选择第一篇文章应该只显示该文章的句子', async ({ page }) => {
    // 监听 console 日志
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('[Browser Console]:', text);
    });

    // 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 截图：初始页面
    await page.screenshot({ path: 'test-screenshots/01-initial-page.png' });

    // 点击"教材资源" 
    const textbookResource = page.locator('text=教材资源').first();
    await expect(textbookResource).toBeVisible({ timeout: 5000 });
    await textbookResource.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-screenshots/02-after-textbook-click.png' });

    // 点击"第二册"（直接显示，没有"新概念英语"中间层）
    const book2 = page.locator('text=第二册').first();
    await expect(book2).toBeVisible({ timeout: 5000 });
    await book2.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/03-after-book2-click.png' });

    // 等待进入练习模式并显示课文选择器
    // 查找课文选择器的标题
    const lessonSelectorTitle = page.locator('text=选择课文').first();
    await expect(lessonSelectorTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ 课文选择器已显示');
    await page.screenshot({ path: 'test-screenshots/04-lesson-selector.png' });

    // 获取所有课文按钮
    const lessonButtons = await page.locator('.lesson-item').all();
    console.log(`找到 ${lessonButtons.length} 个课文`);

    // 点击第一篇文章
    const firstLesson = page.locator('.lesson-item').first();
    const firstLessonText = await firstLesson.textContent();
    console.log(`点击第一篇文章: ${firstLessonText}`);
    await firstLesson.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/05-after-lesson-select.png' });

    // 等待练习界面加载
    await page.waitForSelector('.practice-card', { timeout: 10000 });
    console.log('✅ 练习界面已加载');

    // 获取进度显示
    const progressText = await page.locator('.progress span').textContent();
    console.log(`进度显示: ${progressText}`);

    // 提取总句子数
    const match = progressText?.match(/of\s+(\d+)/);
    if (match) {
      const totalSentences = parseInt(match[1]);
      console.log(`总句子数: ${totalSentences}`);

      // 验证：第一篇文章（A private conversation）应该有 16 个句子
      // 如果显示超过 100 句子，说明问题存在
      if (totalSentences > 100) {
        console.error(`❌ 测试失败：显示 ${totalSentences} 个句子，应该是约 16 个`);
        await page.screenshot({ path: 'test-screenshots/06-fail-too-many-sentences.png', fullPage: true });
        throw new Error(`显示 ${totalSentences} 个句子，应该是约 16 个`);
      } else if (totalSentences >= 10 && totalSentences <= 20) {
        console.log(`✅ 测试通过：显示 ${totalSentences} 个句子，符合预期`);
      } else {
        console.warn(`⚠️ 警告：显示 ${totalSentences} 个句子，可能不正常`);
      }
    } else {
      console.error('❌ 无法解析进度文本');
    }

    // 获取输入框数量
    const inputs = await page.locator('input[type="text"]').all();
    console.log(`找到 ${inputs.length} 个输入框`);

    // 输出所有 console 日志
    console.log('\n=== 浏览器 Console 日志 ===');
    consoleLogs.forEach(log => console.log(log));
  });
});
