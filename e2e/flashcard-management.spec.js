import { test, expect } from '@playwright/test';

test.describe('闪卡管理功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.locator('.homepage-btn-primary').click();
    await page.locator('.feature-card').filter({ hasText: '闪卡管理' }).click();
    await page.waitForTimeout(1000);
  });

  test('3.1 进入闪卡管理', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('闪卡管理');
  });

  test('3.2 闪卡列表', async ({ page }) => {
    const table = page.locator('.flashcard-table');
    if (await table.isVisible()) {
      await expect(table.locator('th')).toContainText(['问题', '答案', '分类', '标签', '难度', '下次复习', '操作']);
    }
  });

  test('3.3 分类筛选', async ({ page }) => {
    const filterSelect = page.locator('.filter-controls select');
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  });

  test('3.4 编辑按钮', async ({ page }) => {
    const editBtn = page.locator('.edit-button').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.locator('.flashcard-form h3')).toContainText('编辑闪卡');
    }
  });

  test('3.5 删除按钮', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });
    const deleteBtn = page.locator('.delete-button').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
  });

  test('3.6 创建闪卡', async ({ page }) => {
    await page.locator('.create-button').click();
    await expect(page.locator('.flashcard-form h3')).toContainText('创建闪卡');
    await page.locator('textarea[name="question"]').fill('Test Question');
    await page.locator('textarea[name="answer"]').fill('Test Answer');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
  });

  test('3.7 导入按钮', async ({ page }) => {
    await page.locator('.import-button-header').click();
    await expect(page.locator('.flashcard-importer')).toBeVisible();
  });
});
