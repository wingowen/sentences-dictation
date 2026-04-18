import { test, expect } from '@playwright/test';

test.describe('新概念英语二和三切换测试', () => {
  test('先选择新概念二文章，然后切换到新概念三', async ({ page }) => {
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

    // ========== 第一步：选择新概念二 ==========
    console.log('=== 第一步：选择新概念二 ===');
    await page.locator('text=教材资源').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=第二册').first().click();
    await page.waitForTimeout(1000);
    
    // 等待课文选择器
    await expect(page.locator('text=选择课文').first()).toBeVisible({ timeout: 10000 });
    
    // 获取新概念二的课文列表
    const nc2Lessons = await page.locator('.lesson-item').all();
    console.log(`新概念二找到 ${nc2Lessons.length} 个课文`);
    
    // 选择第一篇文章
    const nc2FirstLesson = await page.locator('.lesson-item').first().textContent();
    console.log(`选择新概念二第一篇文章: ${nc2FirstLesson}`);
    await page.locator('.lesson-item').first().click();
    await page.waitForTimeout(1000);
    
    // 验证新概念二的句子数
    let progressText = await page.locator('.progress span').textContent();
    console.log(`新概念二进度: ${progressText}`);
    let match = progressText?.match(/of\s+(\d+)/);
    if (match) {
      const nc2Sentences = parseInt(match[1]);
      console.log(`新概念二第一篇文章有 ${nc2Sentences} 个句子`);
      expect(nc2Sentences).toBeLessThan(100); // 应该小于100
    }
    
    await page.screenshot({ path: 'test-screenshots/switch-01-nc2-selected.png' });

    // ========== 第二步：返回首页，切换到新概念三 ==========
    console.log('=== 第二步：切换到新概念三 ===');
    
    // 点击返回按钮
    await page.locator('button:has-text("返回"), .back-button').first().click();
    await page.waitForTimeout(1000);
    
    // 再次点击教材资源
    await page.locator('text=教材资源').first().click();
    await page.waitForTimeout(500);
    
    // 选择第三册
    await page.locator('text=第三册').first().click();
    await page.waitForTimeout(1000);
    
    // 等待课文选择器
    await expect(page.locator('text=选择课文').first()).toBeVisible({ timeout: 10000 });
    
    // 获取新概念三的课文列表
    const nc3Lessons = await page.locator('.lesson-item').all();
    console.log(`新概念三找到 ${nc3Lessons.length} 个课文`);
    
    // 选择第一篇文章
    const nc3FirstLesson = await page.locator('.lesson-item').first().textContent();
    console.log(`选择新概念三第一篇文章: ${nc3FirstLesson}`);
    await page.locator('.lesson-item').first().click();
    await page.waitForTimeout(1000);
    
    // 验证新概念三的句子数
    progressText = await page.locator('.progress span').textContent();
    console.log(`新概念三进度: ${progressText}`);
    match = progressText?.match(/of\s+(\d+)/);
    if (match) {
      const nc3Sentences = parseInt(match[1]);
      console.log(`新概念三第一篇文章有 ${nc3Sentences} 个句子`);
      
      // 验证句子数合理
      if (nc3Sentences > 100) {
        console.error(`❌ 测试失败：新概念三显示 ${nc3Sentences} 个句子，可能是加载了新概念二的数据`);
        await page.screenshot({ path: 'test-screenshots/switch-02-nc3-fail.png', fullPage: true });
        throw new Error(`新概念三显示 ${nc3Sentences} 个句子，切换可能有问题`);
      } else {
        console.log(`✅ 新概念三显示 ${nc3Sentences} 个句子，正常`);
      }
    }
    
    await page.screenshot({ path: 'test-screenshots/switch-03-nc3-selected.png' });

    // ========== 第三步：再切换回新概念二 ==========
    console.log('=== 第三步：再切换回新概念二 ===');
    
    // 点击返回
    await page.locator('button:has-text("返回"), .back-button').first().click();
    await page.waitForTimeout(1000);
    
    // 选择新概念二
    await page.locator('text=教材资源').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=第二册').first().click();
    await page.waitForTimeout(1000);
    
    // 等待课文选择器
    await expect(page.locator('text=选择课文').first()).toBeVisible({ timeout: 10000 });
    
    // 选择第二篇文章（验证是否能正确切换）
    const nc2LessonsAgain = await page.locator('.lesson-item').all();
    console.log(`再次选择新概念二，找到 ${nc2LessonsAgain.length} 个课文`);
    
    if (nc2LessonsAgain.length > 1) {
      const nc2SecondLesson = await page.locator('.lesson-item').nth(1).textContent();
      console.log(`选择新概念二第二篇文章: ${nc2SecondLesson}`);
      await page.locator('.lesson-item').nth(1).click();
    } else {
      await page.locator('.lesson-item').first().click();
    }
    await page.waitForTimeout(1000);
    
    // 验证新概念二的句子数
    progressText = await page.locator('.progress span').textContent();
    console.log(`再次选择新概念二进度: ${progressText}`);
    match = progressText?.match(/of\s+(\d+)/);
    if (match) {
      const nc2SentencesAgain = parseInt(match[1]);
      console.log(`新概念二文章有 ${nc2SentencesAgain} 个句子`);
      
      if (nc2SentencesAgain > 100) {
        console.error(`❌ 测试失败：切换回新概念二显示 ${nc2SentencesAgain} 个句子`);
        throw new Error(`切换回新概念二显示 ${nc2SentencesAgain} 个句子`);
      } else {
        console.log(`✅ 切换回新概念二正常，显示 ${nc2SentencesAgain} 个句子`);
      }
    }
    
    await page.screenshot({ path: 'test-screenshots/switch-04-nc2-again.png' });

    console.log('\n=== 所有测试通过 ===');
  });
});
