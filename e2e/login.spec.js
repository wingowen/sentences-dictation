import { test, expect } from '@playwright/test';

test.describe('登录功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('7.1 登录弹窗', async ({ page }) => {
    await page.locator('.homepage-login-btn').click();
    await expect(page.locator('.auth-modal-content')).toBeVisible();
    await expect(page.locator('.auth-modal-content h2')).toContainText('欢迎回来');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('立即登录');
  });

  test('7.2 登录成功', async ({ page }) => {
    await page.locator('.homepage-login-btn').click();
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(2000);
    await expect(page.locator('.homepage-login-btn')).toContainText('已登录');
  });

  test('7.3 登录失败', async ({ page }) => {
    await page.locator('.homepage-login-btn').click();
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(1000);
    await expect(page.locator('.auth-error')).toBeVisible();
  });
});
