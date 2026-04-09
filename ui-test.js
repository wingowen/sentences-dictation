const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = '/tmp/ui-test-screenshots';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page, name, description) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`\n[截图] ${description}`);
  console.log(`  保存路径: ${filepath}`);
  return filepath;
}

async function analyzePageElements(page) {
  console.log('\n[页面元素分析]');
  
  const buttons = await page.locator('button').all();
  console.log(`  - 按钮数量: ${buttons.length}`);
  
  const links = await page.locator('a').all();
  console.log(`  - 链接数量: ${links.length}`);
  
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`  - 输入框数量: ${inputs.length}`);
  
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  console.log(`  - 标题数量: ${headings.length}`);
  
  const modals = await page.locator('[role="dialog"], .modal, [class*="modal"]').all();
  console.log(`  - 模态框数量: ${modals.length}`);
  
  const navItems = await page.locator('nav, [role="navigation"]').all();
  console.log(`  - 导航栏数量: ${navItems.length}`);
  
  return {
    buttons: buttons.length,
    links: links.length,
    inputs: inputs.length,
    headings: headings.length,
    modals: modals.length,
    navItems: navItems.length
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  ensureDir(SCREENSHOT_DIR);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'zh-CN'
  });
  const page = await context.newPage();
  
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleLogs.push(`[Console] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(`[Error] ${error.message}`);
  });
  
  console.log('='.repeat(60));
  console.log('开始自动化 UI 测试');
  console.log('='.repeat(60));
  
  try {
    console.log('\n[步骤 1] 访问首页');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    await takeScreenshot(page, '01-homepage', '首页加载完成');
    await analyzePageElements(page);
    
    console.log('\n[步骤 2] 检查数据源选择树');
    const treeItems = await page.locator('[class*="tree"], [class*="item"], [class*="node"]').all();
    console.log(`  找到 ${treeItems.length} 个树节点`);
    
    const clickableItems = await page.locator('button, [role="button"], [class*="clickable"], [class*="card"]').all();
    console.log(`  找到 ${clickableItems.length} 个可点击元素`);
    
    console.log('\n[步骤 3] 测试导航栏');
    const navbar = page.locator('nav, [class*="navbar"], [class*="header"]').first();
    if (await navbar.isVisible()) {
      await takeScreenshot(page, '02-navbar', '导航栏可见');
      
      const dropdownTriggers = await page.locator('[class*="dropdown"], [aria-haspopup]').all();
      console.log(`  找到 ${dropdownTriggers.length} 个下拉菜单触发器`);
      
      if (dropdownTriggers.length > 0) {
        console.log('\n[步骤 4] 测试下拉菜单');
        try {
          await dropdownTriggers[0].click();
          await sleep(500);
          await takeScreenshot(page, '03-dropdown-open', '下拉菜单打开');
        } catch (e) {
          console.log(`  点击下拉菜单失败: ${e.message}`);
        }
      }
    }
    
    console.log('\n[步骤 5] 测试设置按钮');
    const settingsBtn = page.locator('button:has-text("设置"), [aria-label*="设置"], [class*="settings"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await sleep(500);
      await takeScreenshot(page, '04-settings-modal', '设置模态框');
      await analyzePageElements(page);
      
      const closeBtn = page.locator('button:has-text("关闭"), [aria-label*="关闭"], [class*="close"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await sleep(300);
        console.log('  已关闭设置模态框');
      }
    }
    
    console.log('\n[步骤 6] 测试数据源选择');
    const dataSourceCards = await page.locator('[class*="card"], [class*="item"]').all();
    if (dataSourceCards.length > 0) {
      console.log(`  找到 ${dataSourceCards.length} 个数据源卡片`);
      
      const firstCard = dataSourceCards[0];
      const cardText = await firstCard.isVisible() ? await firstCard.innerText() : 'N/A';
      console.log(`  第一个卡片内容: ${cardText.substring(0, 50)}...`);
      
      try {
        await firstCard.click();
        await page.waitForLoadState('networkidle');
        await sleep(1000);
        await takeScreenshot(page, '05-data-source-selected', '选择数据源后');
        await analyzePageElements(page);
      } catch (e) {
        console.log(`  点击数据源卡片失败: ${e.message}`);
      }
    }
    
    console.log('\n[步骤 7] 测试返回按钮');
    const backBtn = page.locator('button:has-text("返回"), [aria-label*="返回"], [class*="back"]').first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForLoadState('networkidle');
      await sleep(500);
      await takeScreenshot(page, '06-back-to-home', '返回首页');
    }
    
    console.log('\n[步骤 8] 测试闪卡功能入口');
    const flashcardBtns = await page.locator('button:has-text("闪卡"), a:has-text("闪卡"), [class*="flashcard"]').all();
    console.log(`  找到 ${flashcardBtns.length} 个闪卡相关元素`);
    
    if (flashcardBtns.length > 0) {
      try {
        await flashcardBtns[0].click();
        await page.waitForLoadState('networkidle');
        await sleep(1000);
        await takeScreenshot(page, '07-flashcard-page', '闪卡页面');
        await analyzePageElements(page);
      } catch (e) {
        console.log(`  进入闪卡页面失败: ${e.message}`);
      }
    }
    
    console.log('\n[步骤 9] 测试生词本入口');
    await page.goto('http://localhost:5173#vocabulary');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await takeScreenshot(page, '08-vocabulary-page', '生词本页面');
    await analyzePageElements(page);
    
    console.log('\n[步骤 10] 测试练习模式');
    await page.goto('http://localhost:5173#practice');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await takeScreenshot(page, '09-practice-page', '练习模式页面');
    await analyzePageElements(page);
    
    console.log('\n[步骤 11] 测试闪卡学习');
    await page.goto('http://localhost:5173#flashcard-learn');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await takeScreenshot(page, '10-flashcard-learn', '闪卡学习页面');
    await analyzePageElements(page);
    
    console.log('\n[步骤 12] 测试生词复习');
    await page.goto('http://localhost:5173#vocab-review');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await takeScreenshot(page, '11-vocab-review', '生词复习页面');
    await analyzePageElements(page);
    
    console.log('\n[步骤 13] 测试闪卡管理');
    await page.goto('http://localhost:5173#flashcard-manage');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    await takeScreenshot(page, '12-flashcard-manage', '闪卡管理页面');
    await analyzePageElements(page);
    
    console.log('\n[步骤 14] 最终返回首页');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await sleep(500);
    await takeScreenshot(page, '13-final-homepage', '最终首页状态');
    
  } catch (e) {
    console.log(`\n[错误] 测试过程中发生异常: ${e.message}`);
    await takeScreenshot(page, 'error-state', '错误状态');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
  
  if (errors.length > 0) {
    console.log(`\n[页面错误] 共 ${errors.length} 个:`);
    errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
  }
  
  const errorLogs = consoleLogs.filter(log => log.toLowerCase().includes('error'));
  if (errorLogs.length > 0) {
    console.log(`\n[控制台错误] 共 ${errorLogs.length} 个:`);
    errorLogs.slice(0, 5).forEach(log => console.log(`  - ${log}`));
  }
  
  console.log(`\n所有截图已保存到: ${SCREENSHOT_DIR}`);
  
  await browser.close();
}

main().catch(console.error);
