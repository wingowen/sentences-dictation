import { test, expect } from '@playwright/test';

test.describe('设置按钮功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    
    // 点击教材资源分区中的简单句练习
    const resourceSection = page.locator('.homepage-section').filter({ hasText: '教材资源' });
    await resourceSection.locator('.section-item').filter({ hasText: '简单句练习' }).click();
    await page.waitForTimeout(2000);
  });

  test('设置按钮可见', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await expect(settingsButton).toBeVisible();
    await expect(settingsButton).toContainText('设置');
  });

  test('点击设置按钮打开设置模态框', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    const modalOverlay = page.locator('.modal-overlay');
    
    // 点击设置按钮
    await settingsButton.click();
    
    // 等待模态框出现
    await expect(modalOverlay).toBeVisible();
    
    // 验证设置标题
    await expect(page.locator('h2')).toContainText('设置');
  });

  test('设置模态框包含三个标签页', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 验证标签页存在
    await expect(page.locator('.settings-tab')).toHaveCount(3);
    await expect(page.locator('.settings-tab').nth(0)).toContainText('语音');
    await expect(page.locator('.settings-tab').nth(1)).toContainText('练习');
    await expect(page.locator('.settings-tab').nth(2)).toContainText('显示');
  });

  test('设置标签页切换功能', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 默认应该在语音标签页
    await expect(page.locator('.settings-tab.active').nth(0)).toHaveText('语音');
    
    // 点击练习标签页
    await page.locator('.settings-tab').nth(1).click();
    await expect(page.locator('.settings-tab.active')).toHaveText('练习');
    
    // 点击显示标签页
    await page.locator('.settings-tab').nth(2).click();
    await expect(page.locator('.settings-tab.active')).toHaveText('显示');
  });

  test('语音设置 - 语速选择', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    const speechRateSelect = page.locator('.settings-select');
    await expect(speechRateSelect).toBeVisible();
    
    // 验证语速选项
    const options = page.locator('.settings-select option');
    await expect(options).toHaveCount(6);
  });

  test('练习设置 - 随机模式开关', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 切换到练习标签页
    await page.locator('.settings-tab').nth(1).click();
    await page.waitForTimeout(300);
    
    // 验证随机模式复选框存在
    const randomModeCheckbox = page.locator('input[type="checkbox"]').nth(0);
    await expect(randomModeCheckbox).toBeVisible();
  });

  test('练习设置 - 自动切换下一句开关', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 切换到练习标签页
    await page.locator('.settings-tab').nth(1).click();
    await page.waitForTimeout(300);
    
    // 验证自动切换复选框存在
    const autoNextCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await expect(autoNextCheckbox).toBeVisible();
  });

  test('练习设置 - 显示字母计数器开关', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 切换到练习标签页
    await page.locator('.settings-tab').nth(1).click();
    await page.waitForTimeout(300);
    
    // 验证字母计数器复选框存在
    const showCounterCheckbox = page.locator('input[type="checkbox"]').nth(2);
    await expect(showCounterCheckbox).toBeVisible();
  });

  test('显示设置 - 显示中文翻译开关', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 切换到显示标签页
    await page.locator('.settings-tab').nth(2).click();
    await page.waitForTimeout(300);
    
    // 验证中文翻译复选框存在
    const showTranslationCheckbox = page.locator('input[type="checkbox"]').nth(0);
    await expect(showTranslationCheckbox).toBeVisible();
  });

  test('显示设置 - 显示原文开关', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    await settingsButton.click();
    await page.waitForTimeout(500);
    
    // 切换到显示标签页
    await page.locator('.settings-tab').nth(2).click();
    await page.waitForTimeout(300);
    
    // 验证原文复选框存在
    const showOriginalTextCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await expect(showOriginalTextCheckbox).toBeVisible();
  });

  test('点击关闭按钮关闭设置模态框', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    const modalOverlay = page.locator('.modal-overlay');
    
    // 打开设置模态框
    await settingsButton.click();
    await expect(modalOverlay).toBeVisible();
    
    // 点击关闭按钮
    await page.locator('.settings-close-button').click();
    
    // 等待模态框消失
    await expect(modalOverlay).not.toBeVisible();
  });

  test('点击模态框外部关闭设置模态框', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    const modalOverlay = page.locator('.modal-overlay');
    
    // 打开设置模态框
    await settingsButton.click();
    await expect(modalOverlay).toBeVisible();
    
    // 点击模态框外部区域
    await page.locator('.modal-overlay').click({ position: { x: 50, y: 50 } });
    
    // 等待模态框消失
    await expect(modalOverlay).not.toBeVisible();
  });

  test('点击右上角 X 按钮关闭设置模态框', async ({ page }) => {
    const settingsButton = page.locator('.settings-button');
    const modalOverlay = page.locator('.modal-overlay');
    
    // 打开设置模态框
    await settingsButton.click();
    await expect(modalOverlay).toBeVisible();
    
    // 点击右上角 X 按钮
    await page.locator('.settings-close-btn').click();
    
    // 等待模态框消失
    await expect(modalOverlay).not.toBeVisible();
  });
});
