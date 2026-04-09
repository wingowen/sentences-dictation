import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('1. 访问应用...');
    await page.goto('http://localhost:8888');
    await page.waitForTimeout(2000);
    
    console.log('2. 点击导航栏的"新概念"下拉菜单...');
    const newConceptMenu = page.locator('text=新概念');
    await newConceptMenu.click();
    await page.waitForTimeout(500);
    
    console.log('3. 点击"第一册"...');
    const firstBook = page.locator('text=第一册');
    await firstBook.click();
    await page.waitForTimeout(3000);
    
    console.log('4. 验证是否进入练习页面...');
    const pageTitle = await page.locator('h2').textContent();
    console.log('页面标题:', pageTitle);
    
    // 检查是否显示了练习卡片
    const practiceCard = await page.isVisible('.practice-card');
    console.log('是否显示练习卡片:', practiceCard);
    
    if (practiceCard) {
      console.log('✅ 测试成功：新概念一加载正常');
      
      // 检查是否有句子显示
      const sentenceVisible = await page.isVisible('.sentence-text, .word-inputs');
      console.log('是否显示句子内容:', sentenceVisible);
    } else {