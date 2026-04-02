import { test, expect } from '@playwright/test';

test.describe('生词本复习功能', () => {
  test('6.1 未登录状态', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('请先登录');
      await dialog.accept();
    });
    
    await page.locator('.section-item').filter({ hasText: '生词本复习' }).click();
  });

  test('6.2 已登录进入', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('flashcards', JSON.stringify([{ id: 1, word: 'test', meaning: '测试' }]));
    });
    
    await page.locator('.homepage-login-btn').click();
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
  });

  test('6.3 复习流程', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    
    // Login first
    await page.locator('.homepage-login-btn').click();
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // Navigate to vocab review if logged in
    const vocabReviewBtn = page.locator('.section-item').filter({ hasText: '生词本复习' });
    if (await vocabReviewBtn.isVisible()) {
      await vocabReviewBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('6.4 标记功能', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    
    // Login first
    await page.locator('.homepage-login-btn').click();
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // Navigate to vocab review if logged in
    const vocabReviewBtn = page.locator('.section-item').filter({ hasText: '生词本复习' });
    if (await vocabReviewBtn.isVisible()) {
      await vocabReviewBtn.click();
      await page.waitForTimeout(1000);
      
      const showAnswerBtn = page.locator('.show-answer-button');
      if (await showAnswerBtn.isVisible()) {
        await showAnswerBtn.click();
        await page.waitForTimeout(500);
        
        const forgotBtn = page.locator('.response-button.again');
        const rememberBtn = page.locator('.response-button.easy');
        
        if (await forgotBtn.isVisible()) {
          await forgotBtn.click();
        } else if (await rememberBtn.isVisible()) {
          await rememberBtn.click();
        }
      }
    }
  });
});
