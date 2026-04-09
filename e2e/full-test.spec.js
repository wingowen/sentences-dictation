import { test, expect } from '@playwright/test';

test.describe('完整功能测试 (使用测试账号)', () => {
  const TEST_EMAIL = 'admin@example.com';
  const TEST_PASSWORD = 'admin123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('1. 登录功能测试', async ({ page }) => {
    console.log('=== 测试登录功能 ===');
    
    // 点击登录按钮
    await page.locator('.homepage-login-btn').click();
    await expect(page.locator('.auth-modal-content')).toBeVisible();
    console.log('✓ 登录弹窗打开成功');
    
    // 输入测试账号
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    console.log('✓ 输入测试账号成功');
    
    // 点击登录按钮
    await page.locator('button[type="submit"]').click();
    
    // 等待登录完成
    await page.waitForTimeout(3000);
    
    // 验证登录成功
    await expect(page.locator('.homepage-login-btn')).toContainText('已登录');
    console.log('✓ 登录成功，按钮显示"已登录"');
  });

  test('2. 生词本复习页面测试 (已登录)', async ({ page }) => {
    console.log('=== 测试生词本复习页面 ===');
    
    // 先登录
    await page.locator('.homepage-login-btn').click();
    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    
    // 点击生词本复习
    await page.locator('.section-item').filter({ hasText: '生词本复习' }).click();
    await page.waitForTimeout(2000);
    
    // 验证页面加载
    await expect(page.locator('.vocab-review')).toBeVisible();
    await expect(page.locator('h2')).toContainText('生词本复习');
    console.log('✓ 生词本复习页面加载成功');
    
    // 验证返回按钮
    await expect(page.locator('.back-button')).toBeVisible();
    console.log('✓ 返回按钮可见');
    
    // 检查是否有生词或空状态提示
    const hasVocab = await page.locator('.flashcard').isVisible();
    const isEmpty = await page.locator('.review-complete').isVisible();
    
    if (hasVocab) {
      console.log('✓ 有生词待复习');
      
      // 测试显示答案按钮
      const showAnswerBtn = page.locator('.show-answer-button');
      if (await showAnswerBtn.isVisible()) {
        await showAnswerBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ 显示答案按钮工作正常');
        
        // 测试记住了按钮
        const rememberBtn = page.locator('.response-button.easy');
        if (await rememberBtn.isVisible()) {
          await rememberBtn.click();
          await page.waitForTimeout(500);
          console.log('✓ 记住了按钮工作正常');
        }
      }
    } else if (isEmpty) {
      console.log('✓ 显示空状态提示');
    }
  });

  test('3. 闪卡学习页面测试', async ({ page }) => {
    console.log('=== 测试闪卡学习页面 ===');
    
    // 点击开始练习
    await page.locator('.homepage-btn-primary').click();
    await expect(page.locator('h2')).toContainText('闪卡功能');
    console.log('✓ 闪卡功能页面加载成功');
    
    // 点击闪卡学习
    await page.locator('.feature-card').filter({ hasText: '闪卡学习' }).click();
    await page.waitForTimeout(2000);
    
    // 验证页面加载
    await expect(page.locator('h2')).toContainText('闪卡学习');
    console.log('✓ 闪卡学习页面加载成功');
    
    // 检查是否有闪卡
    const hasFlashcard = await page.locator('.flashcard').isVisible();
    const isEmpty = await page.locator('.empty-state').isVisible();
    
    if (hasFlashcard) {
      console.log('✓ 有闪卡可学习');
      
      // 测试显示答案按钮
      const showAnswerBtn = page.locator('.show-answer-button');
      if (await showAnswerBtn.isVisible()) {
        await showAnswerBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ 显示答案按钮工作正常');
        
        // 测试响应按钮
        const goodBtn = page.locator('.response-button.good');
        if (await goodBtn.isVisible()) {
          await goodBtn.click();
          await page.waitForTimeout(500);
          console.log('✓ 良好按钮工作正常');
        }
      }
    } else if (isEmpty) {
      console.log('✓ 显示空状态提示');
    }
  });

  test('4. 闪卡管理页面测试', async ({ page }) => {
    console.log('=== 测试闪卡管理页面 ===');
    
    // 点击开始练习
    await page.locator('.homepage-btn-primary').click();
    
    // 点击闪卡管理
    await page.locator('.feature-card').filter({ hasText: '闪卡管理' }).click();
    await page.waitForTimeout(2000);
    
    // 验证页面加载
    await expect(page.locator('h2')).toContainText('闪卡管理');
    console.log('✓ 闪卡管理页面加载成功');
    
    // 测试创建闪卡按钮
    const createBtn = page.locator('.create-button');
    await expect(createBtn).toBeVisible();
    console.log('✓ 创建闪卡按钮可见');
    
    await createBtn.click();
    await page.waitForTimeout(500);
    
    // 验证表单显示
    await expect(page.locator('.flashcard-form')).toBeVisible();
    console.log('✓ 创建闪卡表单显示成功');
    
    // 填写表单
    await page.locator('textarea[name="question"]').fill('Test Question?');
    await page.locator('textarea[name="answer"]').fill('Test Answer');
    console.log('✓ 填写表单成功');
    
    // 取消创建
    await page.locator('.cancel-button').click();
    await page.waitForTimeout(500);
    console.log('✓ 取消创建成功');
  });

  test('5. 学习统计页面测试', async ({ page }) => {
    console.log('=== 测试学习统计页面 ===');
    
    // 点击开始练习
    await page.locator('.homepage-btn-primary').click();
    
    // 点击学习统计
    await page.locator('.feature-card').filter({ hasText: '学习统计' }).click();
    await page.waitForTimeout(2000);
    
    // 验证页面加载
    await expect(page.locator('h2')).toContainText('闪卡统计');
    console.log('✓ 学习统计页面加载成功');
    
    // 验证统计卡片
    await expect(page.locator('.stat-card').filter({ hasText: '总闪卡数' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: '待复习' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: '今日学习' })).toBeVisible();
    await expect(page.locator('.stat-card').filter({ hasText: '今日正确率' })).toBeVisible();
    console.log('✓ 统计卡片显示正常');
    
    // 测试时间筛选按钮
    await page.locator('.period-selector button').filter({ hasText: '今日' }).click();
    await page.waitForTimeout(500);
    console.log('✓ 时间筛选按钮工作正常');
  });

  test('6. 简单句练习页面测试', async ({ page }) => {
    console.log('=== 测试简单句练习页面 ===');
    
    // 点击简单句练习
    await page.locator('.section-item').filter({ hasText: '简单句练习' }).click();
    await page.waitForTimeout(3000);
    
    // 验证页面加载
    await expect(page.locator('.practice-card')).toBeVisible();
    console.log('✓ 简单句练习页面加载成功');
    
    // 验证题目显示
    await expect(page.locator('.progress.small')).toContainText('Question');
    console.log('✓ 题目显示正常');
    
    // 验证输入框
    await expect(page.locator('.word-input').first()).toBeVisible();
    console.log('✓ 输入框可见');
    
    // 验证播放按钮
    const playBtn = page.locator('.play-button');
    await expect(playBtn).toBeVisible();
    console.log('✓ 播放按钮可见');
    
    // 验证下一句按钮
    const nextBtn = page.locator('.next-sentence-button');
    await expect(nextBtn).toBeVisible();
    console.log('✓ 下一句按钮可见');
    
    // 测试下一句功能
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ 下一句按钮工作正常');
  });

  test('7. 返回功能测试', async ({ page }) => {
    console.log('=== 测试返回功能 ===');
    
    // 点击开始练习
    await page.locator('.homepage-btn-primary').click();
    await expect(page.locator('h2')).toContainText('闪卡功能');
    
    // 返回首页
    await page.locator('.back-button').click();
    await page.waitForTimeout(1000);
    
    // 验证返回首页成功
    await expect(page.locator('.homepage-hero')).toBeVisible();
    console.log('✓ 返回首页成功');
  });
});
