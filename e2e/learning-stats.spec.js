import { test, expect } from '@playwright/test';

test.describe('学习统计功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.locator('.homepage-btn-primary').click();
    await page.locator('.feature-card').filter({ hasText: '学习统计' }).click();
    await page.waitForTimeout(1000);
  });

  test('4.1 进入统计', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('闪卡统计');
  });

  test('4.2 总闪卡数', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: '总闪卡数' })).toBeVisible();
  });

  test('4.3 待复习数', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: '待复习' })).toBeVisible();
  });

  test('4.4 今日学习', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: '今日学习' })).toBeVisible();
  });

  test('4.5 今日正确率', async ({ page }) => {
    await expect(page.locator('.stat-card').filter({ hasText: '今日正确率' })).toBeVisible();
  });

  test('4.6 学习记录筛选', async ({ page }) => {
    await page.locator('.period-selector button').filter({ hasText: '今日' }).click();
    await expect(page.locator('.period-selector button').filter({ hasText: '今日' })).toHaveClass(/active/);
    
    await page.locator('.period-selector button').filter({ hasText: '本月' }).click();
    await expect(page.locator('.period-selector button').filter({ hasText: '本月' })).toHaveClass(/active/);
    
    await page.locator('.period-selector button').filter({ hasText: '全部' }).click();
    await expect(page.locator('.period-selector button').filter({ hasText: '全部' })).toHaveClass(/active/);
  });

  test('4.7 分类统计', async ({ page }) => {
    await expect(page.locator('.category-stats h3')).toContainText('分类统计');
  });
});
