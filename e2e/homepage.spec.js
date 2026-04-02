import { test, expect } from '@playwright/test';

test.describe('首页功能', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('1.1 导航栏显示', async ({ page }) => {
    // Verify navbar displays "📚 Sentence Dictation" and "登录" button (without lock icon)
    await expect(page.locator('.homepage-logo')).toContainText('📚 Sentence Dictation');
    await expect(page.locator('.homepage-login-btn')).toContainText('登录');
    // Verify no lock icon on login button
    await expect(page.locator('.homepage-login-btn')).not.toContainText('🔒');
  });

  test('1.2 Hero区域', async ({ page }) => {
    // Verify Hero area displays 🎧 icon, "Practice Your English", subtitle, and browse resources button
    await expect(page.locator('.homepage-hero-icon')).toContainText('🎧');
    await expect(page.locator('.homepage-hero-title')).toContainText('Practice Your English');
    await expect(page.locator('.homepage-hero-subtitle')).toContainText('听写练习 · 间隔重复 · 高效记忆');
    await expect(page.locator('.homepage-btn-secondary')).toContainText('📚 浏览资源');
  });

  test('1.3 浏览资源按钮', async ({ page }) => {
    // Click "📚 浏览资源" should scroll to resources section
    await page.locator('.homepage-btn-secondary').click();
    // Verify resources section is visible
    await expect(page.locator('.homepage-sections')).toBeVisible();
  });

  test('1.4 练习模式分区', async ({ page }) => {
    // Verify 练习模式 section displays 闪卡学习, 闪卡管理, 生词本复习 (with 🔒 for non-logged in)
    const practiceSection = page.locator('.homepage-section').filter({ hasText: '练习模式' });
    await expect(practiceSection).toBeVisible();
    await expect(practiceSection.locator('.section-item')).toHaveCount(3);
    
    // Verify 闪卡学习 item
    const flashcardLearn = practiceSection.locator('.section-item').filter({ hasText: '闪卡学习' });
    await expect(flashcardLearn).toBeVisible();
    
    // Verify 闪卡管理 item
    const flashcardManage = practiceSection.locator('.section-item').filter({ hasText: '闪卡管理' });
    await expect(flashcardManage).toBeVisible();
    
    // Verify 生词本复习 item (should be locked for non-logged in users)
    const vocabReview = practiceSection.locator('.section-item').filter({ hasText: '生词本复习' });
    await expect(vocabReview).toBeVisible();
    await expect(vocabReview.locator('.section-item-lock')).toContainText('🔒');
  });

  test('1.5 教材资源分区', async ({ page }) => {
    // Verify 教材资源 section displays 第一册, 第二册, 第三册, 简单句练习
    const resourceSection = page.locator('.homepage-section').filter({ hasText: '教材资源' });
    await expect(resourceSection).toBeVisible();
    
    // Verify nested items
    await expect(resourceSection.locator('.section-item').filter({ hasText: '第一册' })).toBeVisible();
    await expect(resourceSection.locator('.section-item').filter({ hasText: '第二册' })).toBeVisible();
    await expect(resourceSection.locator('.section-item').filter({ hasText: '第三册' })).toBeVisible();
    await expect(resourceSection.locator('.section-item').filter({ hasText: '简单句练习' })).toBeVisible();
  });

  test('1.6 云端资源分区', async ({ page }) => {
    // Verify 云端资源 section displays Notion, Supabase 文章
    const cloudSection = page.locator('.homepage-section').filter({ hasText: '云端资源' });
    await expect(cloudSection).toBeVisible();
    
    // Verify Notion item (no lock icon, requiresLogin: false)
    const notionItem = cloudSection.locator('.section-item').filter({ hasText: 'Notion' });
    await expect(notionItem).toBeVisible();
    
    // Verify Supabase item (has lock icon, requiresLogin: true)
    const supabaseItem = cloudSection.locator('.section-item').filter({ hasText: 'Supabase 文章' });
    await expect(supabaseItem).toBeVisible();
    await expect(supabaseItem.locator('.section-item-lock')).toContainText('🔒');
  });

  test('1.7 未登录锁定项', async ({ page }) => {
    // Click "生词本复习" should show "请先登录" prompt
    const vocabReview = page.locator('.section-item').filter({ hasText: '生词本复习' });
    
    // Listen for dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('请先登录');
      await dialog.accept();
    });
    
    await vocabReview.click();
  });

  test('1.8 登录按钮', async ({ page }) => {
    // Click "登录" should open login modal
    await page.locator('.homepage-login-btn').click();
    // Verify login modal appears
    await expect(page.locator('.auth-modal-content')).toBeVisible();
    await expect(page.locator('.auth-modal-content h2')).toContainText('欢迎回来');
  });
});
