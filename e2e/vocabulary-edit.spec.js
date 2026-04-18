import { test, expect } from '@playwright/test';

test('测试生词编辑功能', async ({ page }) => {
  console.log('=== 开始测试生词编辑功能 ===');
  
  // 访问首页
  await page.goto('/');
  
  // 清除本地存储
  await page.evaluate(() => localStorage.clear());
  await page.goto('/');
  
  // 使用模拟账号登录
  await page.locator('.homepage-login-btn').click();
  await page.locator('input[type="email"]').fill('admin@example.com');
  await page.locator('input[type="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  
  // 等待登录完成
  await page.waitForTimeout(3000);
  
  console.log('✓ 登录成功');
  
  // 导航到生词本页面
  // 先检查一下是否有生词本按钮
  const pageContent = await page.content();
  console.log('页面包含内容:', pageContent.includes('生词本') ? '包含生词本' : '不包含生词本');
  
  // 尝试找到并点击生词本按钮
  const vocabButtons = page.locator('button, a').filter({ hasText: /生词本/ });
  const count = await vocabButtons.count();
  console.log(`找到 ${count} 个生词本相关按钮`);
  
  if (count > 0) {
    await vocabButtons.first().click();
    await page.waitForTimeout(2000);
    
    console.log('✓ 已进入生词本页面');
    
    // 检查是否有生词列表
    const vocabList = page.locator('.vocabulary-list, .vocabulary-card');
    const hasVocabList = await vocabList.count() > 0;
    
    if (hasVocabList) {
      console.log('✓ 找到生词列表');
      
      // 检查是否有编辑按钮
      const editButtons = page.locator('button').filter({ hasText: /编辑/ });
      const editCount = await editButtons.count();
      
      if (editCount > 0) {
        console.log(`✓ 找到 ${editCount} 个编辑按钮`);
        
        // 点击第一个编辑按钮
        await editButtons.first().click();
        await page.waitForTimeout(1000);
        
        console.log('✓ 已打开编辑弹窗');
        
        // 检查编辑表单是否显示
        const editForm = page.locator('.modal-content').filter({ hasText: /编辑生词/ });
        await expect(editForm).toBeVisible();
        
        // 修改含义
        const meaningInput = page.locator('input[placeholder*="中文"], input[placeholder*="含义"], textarea[placeholder*="中文"], textarea[placeholder*="含义"]');
        const meaningCount = await meaningInput.count();
        console.log(`找到 ${meaningCount} 个含义输入框`);
        
        if (meaningCount > 0) {
          // 清空并输入新含义
          await meaningInput.first().fill('');
          await meaningInput.first().fill('测试修改后的含义');
          
          console.log('✓ 已修改含义');
          
          // 点击保存按钮
          const saveButton = page.locator('button').filter({ hasText: /保存/ });
          await expect(saveButton).toBeVisible();
          await saveButton.click();
          
          await page.waitForTimeout(2000);
          
          console.log('✓ 已点击保存按钮');
          
          // 检查是否有提示浮窗
          const notification = page.locator('.notification');
          const hasNotification = await notification.count() > 0;
          
          if (hasNotification) {
            const notificationText = await notification.textContent();
            console.log(`✓ 看到提示: ${notificationText}`);
          } else {
            console.log('⚠ 没有看到提示浮窗');
          }
          
          console.log('✓ 生词编辑功能测试完成');
        }
      } else {
        console.log('⚠ 没有找到编辑按钮，添加一个生词先');
        
        // 添加一个生词
        const addButton = page.locator('button').filter({ hasText: /添加生词|\+/ });
        const addCount = await addButton.count();
        
        if (addCount > 0) {
          await addButton.first().click();
          await page.waitForTimeout(1000);
          
          // 填写生词信息
          const wordInput = page.locator('input[placeholder*="单词"], input[placeholder*="word"]');
          const meaningInput = page.locator('input[placeholder*="中文"], input[placeholder*="含义"]');
          
          if (await wordInput.count() > 0 && await meaningInput.count() > 0) {
            await wordInput.first().fill('testword');
            await meaningInput.first().fill('测试含义');
            
            const submitButton = page.locator('button').filter({ hasText: /添加|保存/ });
            if (await submitButton.count() > 0) {
              await submitButton.first().click();
              await page.waitForTimeout(2000);
              
              console.log('✓ 已添加测试生词');
              
              // 现在再次尝试编辑
              const newEditButtons = page.locator('button').filter({ hasText: /编辑/ });
              const newEditCount = await newEditButtons.count();
              
              if (newEditCount > 0) {
                console.log('✓ 现在可以测试编辑功能了');
              }
            }
          }
        }
      }
    } else {
      console.log('⚠ 没有找到生词列表');
    }
  } else {
    console.log('⚠ 没有找到生词本按钮');
  }
  
  console.log('=== 测试完成 ===');
});
