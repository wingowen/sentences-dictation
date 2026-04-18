import { test, expect } from '@playwright/test';

test('测试生词编辑功能 - 使用真实账号', async ({ page }) => {
  console.log('=== 开始测试生词编辑功能 ===');
  
  // 访问首页
  await page.goto('http://localhost:8888');
  await page.waitForTimeout(2000);
  
  // 清除本地存储
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:8888');
  await page.waitForTimeout(2000);
  
  console.log('✓ 页面已加载');
  await page.screenshot({ path: 'test-results/step1-homepage.png' });
  
  // 点击生词本导航 - 这会触发登录弹窗
  const vocabNav = page.locator('text=生词本').first();
  await vocabNav.click();
  await page.waitForTimeout(2000);
  
  console.log('✓ 点击生词本，应该弹出登录框');
  await page.screenshot({ path: 'test-results/step2-login-modal.png' });
  
  // 等待登录弹窗出现
  const modalOverlay = page.locator('.modal-overlay.auth-modal-overlay');
  await modalOverlay.waitFor({ state: 'visible' });
  
  // 在弹窗内填写登录信息
  const modal = page.locator('.auth-modal, .modal-content').first();
  
  // 填写邮箱和密码
  await modal.locator('input[type="email"]').fill('1318263468@qq.com');
  await modal.locator('input[type="password"]').fill('123123');
  
  console.log('✓ 已填写登录信息');
  
  // 点击弹窗内的登录按钮（不是导航栏的）
  // 使用更精确的选择器 - 表单内的提交按钮
  const submitButton = modal.locator('button[type="submit"], button:has-text("立即登录")').first();
  await submitButton.click();
  await page.waitForTimeout(3000);
  
  console.log('✓ 已点击登录按钮');
  await page.screenshot({ path: 'test-results/step3-after-login.png' });
  
  // 等待登录完成，检查是否显示用户信息
  const userEmail = await page.locator('text=1318263468@qq.com').count();
  console.log(`✓ 登录状态: ${userEmail > 0 ? '已登录' : '未检测到'}`);
  
  // 确保在生词本页面
  const vocabHeader = page.locator('h2:has-text("生词本")');
  if (await vocabHeader.count() === 0) {
    console.log('⚠ 需要再次点击生词本');
    await page.locator('text=生词本').first().click();
    await page.waitForTimeout(2000);
  }
  
  console.log('✓ 已进入生词本页面');
  await page.screenshot({ path: 'test-results/step4-vocabulary-page.png' });
  
  // 检查是否有生词列表
  const vocabCards = page.locator('.vocabulary-card');
  const cardCount = await vocabCards.count();
  console.log(`✓ 找到 ${cardCount} 个生词卡片`);
  
  // 如果没有生词，添加一个
  if (cardCount === 0) {
    console.log('⚠ 生词本为空，先添加一个测试生词');
    
    await page.locator('button:has-text("添加生词")').first().click();
    await page.waitForTimeout(1000);
    
    const addModal = page.locator('.modal-content').first();
    await addModal.locator('input[placeholder*="单词"]').fill('testword');
    await addModal.locator('input[placeholder*="中文"]').fill('测试单词含义');
    
    await addModal.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    console.log('✓ 已添加测试生词');
  }
  
  // 测试编辑功能
  const editButtons = page.locator('.vocabulary-card button:has-text("编辑")');
  const editCount = await editButtons.count();
  console.log(`✓ 找到 ${editCount} 个编辑按钮`);
  
  if (editCount > 0) {
    // 点击第一个编辑按钮
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    
    console.log('✓ 已打开编辑弹窗');
    await page.screenshot({ path: 'test-results/step5-edit-modal.png' });
    
    // 验证编辑弹窗标题
    const editTitle = page.locator('h3:has-text("编辑生词")');
    expect(await editTitle.count()).toBeGreaterThan(0);
    console.log('✓ 弹窗标题显示"编辑生词"');
    
    // 获取当前表单值
    const editModal = page.locator('.modal-content').first();
    const wordInput = editModal.locator('input').first();
    const currentWord = await wordInput.inputValue();
    console.log(`当前编辑的单词: ${currentWord}`);
    
    // 修改含义字段
    const meaningInput = editModal.locator('input[placeholder*="中文"], textarea[placeholder*="中文"]').first();
    const newMeaning = '修改后的含义_' + Date.now();
    await meaningInput.fill('');
    await meaningInput.fill(newMeaning);
    console.log(`✓ 已修改含义为: ${newMeaning}`);
    
    // 点击保存
    await editModal.locator('button:has-text("保存")').click();
    await page.waitForTimeout(2000);
    
    console.log('✓ 已点击保存按钮');
    await page.screenshot({ path: 'test-results/step6-after-save.png' });
    
    // 检查提示信息
    const notification = page.locator('.notification');
    if (await notification.count() > 0) {
      const notifText = await notification.textContent();
      console.log(`✓ 提示信息: ${notifText}`);
      
      if (notifText.includes('成功')) {
        console.log('✅ 编辑功能测试通过！');
      } else {
        console.log('❌ 编辑可能失败，提示:', notifText);
      }
    }
    
    // 验证弹窗已关闭
    const modalClosed = await page.locator('.modal-content').count() === 0;
    console.log(`✓ 弹窗状态: ${modalClosed ? '已关闭' : '仍打开'}`);
    
    // 验证列表已刷新
    await page.waitForTimeout(1000);
    const updatedCards = page.locator('.vocabulary-card');
    console.log(`✓ 刷新后列表有 ${await updatedCards.count()} 个生词`);
    
  } else {
    console.log('❌ 没有找到编辑按钮');
  }
  
  console.log('=== 测试完成 ===');
});
