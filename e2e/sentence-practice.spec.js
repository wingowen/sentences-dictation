import { test, expect } from '@playwright/test';

test.describe('简单句练习功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.locator('.section-item').filter({ hasText: '简单句练习' }).click();
    await page.waitForTimeout(2000);
  });

  test('5.1 进入练习', async ({ page }) => {
    await expect(page.locator('.practice-card')).toBeVisible();
  });

  test('5.2 资源选择', async ({ page }) => {
    await expect(page.locator('.practice-card')).toBeVisible();
  });

  test('5.3 题目显示', async ({ page }) => {
    await expect(page.locator('.progress.small')).toContainText('Question');
    await expect(page.locator('.progress.small')).toContainText('of');
  });

  test('5.4 输入框', async ({ page }) => {
    await expect(page.locator('.word-input').first()).toBeVisible();
  });

  test('5.5 播放按钮', async ({ page }) => {
    const playBtn = page.locator('.play-button');
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toContainText('播放');
  });

  test('5.6 下一句按钮', async ({ page }) => {
    const nextBtn = page.locator('.next-sentence-button');
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toContainText('下一句');
  });

  test('5.7 加入生词', async ({ page }) => {
    const vocabBtn = page.locator('.add-vocab-button');
    await expect(vocabBtn).toBeVisible();
    await expect(vocabBtn).toContainText('📖 加入生词');
  });

  test('5.8 单词发音按钮', async ({ page }) => {
    const pronounceButtons = page.locator('.word-pronounce-button');
    const buttonCount = await pronounceButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = pronounceButtons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toContainText('🔊');
    }
  });
});
