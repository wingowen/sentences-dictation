import { test, expect } from '@playwright/test';

test('调试生词编辑功能 - 查看详细错误', async ({ page }) => {
  console.log('=== 开始调试生词编辑功能 ===');
  
  // 访问首页并登录
  await page.goto('http://localhost:8888');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:8888');
  await page.waitForTimeout(2000);
  
  // 点击生词本触发登录弹窗
  await page.locator('text=生词本').first().click();
  await page.waitForTimeout(2000);
  
  // 登录
  const modal = page.locator('.modal-content').first();
  await modal.locator('input[type="email"]').fill('1318263468@qq.com');
  await modal.locator('input[type="password"]').fill('123123');
  await modal.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  
  // 进入生词本
  await page.locator('text=生词本').first().click();
  await page.waitForTimeout(2000);
  
  console.log('✓ 已登录并进入生词本');
  
  // 监听网络请求
  let apiResponse = null;
  page.on('response', async (response) => {
    if (response.url().includes('/api/vocabulary') && response.request().method() === 'PUT') {
      console.log(`\n📡 API 请求: ${response.request().method()} ${response.url()}`);
      console.log(`📡 状态码: ${response.status()}`);
      
      try {
        apiResponse = await response.json();
        console.log(`📡 响应体:`, JSON.stringify(apiResponse, null, 2));
      } catch (e) {
        const text = await response.text();
        console.log(`📡 响应文本:`, text);
      }
    }
  });
  
  // 点击编辑按钮
  const editButtons = page.locator('.vocabulary-card button:has-text("编辑")');
  const editCount = await editButtons.count();
  console.log(`✓ 找到 ${editCount} 个编辑按钮`);
  
  if (editCount > 0) {
    await editButtons.first().click();
    await page.waitForTimeout(1000);
    
    const editModal = page.locator('.modal-content').first();
    
    // 查看当前表单的所有值
    const inputs = await editModal.locator('input, textarea, select').all();
    console.log('\n📋 表单字段值:');
    for (const input of inputs) {
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      const placeholder = await input.getAttribute('placeholder') || '';
      const value = await input.inputValue();
      console.log(`  - ${placeholder || tagName}: "${value}"`);
    }
    
    // 修改含义
    const meaningInput = editModal.locator('input[placeholder*="中文"]').first();
    await meaningInput.fill('调试测试含义');
    console.log('\n✓ 已修改含义为: 调试测试含义');
    
    // 查看修改后的表单值
    const allInputs = await editModal.locator('input, select, textarea').all();
    const values = [];
    for (const input of allInputs) {
      const val = await input.inputValue();
      values.push(val);
    }
    
    console.log('\n📤 即将提交的数据:');
    console.log(`  values: ${JSON.stringify(values)}`);
    
    // 点击保存
    console.log('\n🚀 点击保存按钮...');
    await editModal.locator('button:has-text("保存")').click();
    await page.waitForTimeout(3000);
    
    // 检查提示
    const notification = page.locator('.notification');
    if (await notification.count() > 0) {
      const notifText = await notification.textContent();
      console.log(`\n📢 提示信息: ${notifText}`);
    }
    
    // 输出 API 响应
    if (apiResponse) {
      console.log('\n📡 API 完整响应:');
      console.log(JSON.stringify(apiResponse, null, 2));
    }
    
    // 检查弹窗是否还开着
    const modalStillOpen = await page.locator('.modal-content').count() > 0;
    console.log(`\n📍 弹窗状态: ${modalStillOpen ? '仍打开 (可能有错误)' : '已关闭 (成功)'}`);
  }
  
  console.log('\n=== 调试完成 ===');
});
