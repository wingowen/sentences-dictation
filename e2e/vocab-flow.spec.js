import { test, expect } from '@playwright/test';

test('验证生词添加到复习完整流程', async ({ page }) => {
  await page.goto('/');
  
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  
  await page.locator('.homepage-login-btn').click();
  await page.locator('input[type="email"]').fill('admin@example.com');
  await page.locator('input[type="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(5000);
  
  const loginBtnAfterLogin = page.locator('.homepage-login-btn');
  const loginBtnText = await loginBtnAfterLogin.textContent();
  console.log('登录后按钮文本:', loginBtnText);
  
  await page.locator('.auth-close-btn').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(2000);
  
  const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
  const currentUser = await page.evaluate(() => localStorage.getItem('current_user'));
  console.log('登录后的 token:', authToken);
  console.log('登录后的 current_user:', currentUser);
  
  const practiceBtn = page.locator('.section-item').filter({ hasText: '第一册' });
  await expect(practiceBtn).toBeVisible();
  await practiceBtn.click();
  await page.waitForTimeout(5000);
  
  const pageContent = await page.content();
  console.log('页面是否包含 PracticeCard:', pageContent.includes('add-vocab-button'));
  console.log('页面是否包含 word-inputs:', pageContent.includes('word-inputs'));
  
  const currentUserAfterNav = await page.evaluate(() => localStorage.getItem('current_user'));
  console.log('导航后的 current_user:', currentUserAfterNav);
  
  const addVocabBtn = page.locator('.add-vocab-button');
  console.log('查找添加生词按钮...');
  if (await addVocabBtn.isVisible()) {
    console.log('找到添加生词按钮，点击中...');
    await addVocabBtn.click();
    await page.waitForTimeout(2000);
    
    const toast = page.locator('.toast-message');
    if (await toast.isVisible()) {
      const toastText = await toast.textContent();
      console.log('添加生词提示:', toastText);
    } else {
      console.log('未看到 toast 提示');
    }
  } else {
    console.log('未找到添加生词按钮');
  }
  
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  const vocabReviewBtn = page.locator('.section-item').filter({ hasText: '生词本复习' });
  await expect(vocabReviewBtn).toBeVisible();
  await vocabReviewBtn.click();
  await page.waitForTimeout(2000);
  
  const reviewPage = page.locator('.vocab-review');
  await expect(reviewPage).toBeVisible();
  
  const emptyState = page.locator('.review-complete h3');
  const hasWord = page.locator('.flashcard');
  
  if (await emptyState.isVisible()) {
    const text = await emptyState.textContent();
    console.log('❌ 生词本复习状态:', text);
    console.log('可能原因: 添加生词失败或数据库问题');
  } else if (await hasWord.isVisible()) {
    console.log('✅ 生词本复习中出现了单词！');
    
    const word = await page.locator('.flashcard .word').textContent();
    console.log('单词:', word);
    
    const meaning = await page.locator('.flashcard .meaning').textContent();
    console.log('含义:', meaning);
  }
});
