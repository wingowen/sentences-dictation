import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/tmp/ui-test-screenshots';
const REPORT_FILE = '/tmp/ui-test-report.md';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page, name, description) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function analyzePage(page, stepName, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${stepName}] ${description}`);
  console.log('='.repeat(60));
  
  const filepath = await takeScreenshot(page, stepName, description);
  console.log(`截图保存: ${filepath}`);
  
  const url = page.url();
  console.log(`\n当前URL: ${url}`);
  
  const title = await page.title();
  console.log(`页面标题: ${title}`);
  
  const buttons = await page.locator('button').all();
  console.log(`\n按钮数量: ${buttons.length}`);
  
  const buttonTexts = [];
  for (const btn of buttons.slice(0, 10)) {
    try {
      const text = await btn.innerText();
      if (text.trim()) buttonTexts.push(text.trim());
    } catch (e) {}
  }
  if (buttonTexts.length > 0) {
    console.log(`按钮文本: ${buttonTexts.join(', ')}`);
  }
  
  const headings = await page.locator('h1, h2, h3').all();
  console.log(`\n标题数量: ${headings.length}`);
  
  const headingTexts = [];
  for (const h of headings) {
    try {
      const text = await h.innerText();
      if (text.trim()) headingTexts.push(text.trim());
    } catch (e) {}
  }
  if (headingTexts.length > 0) {
    console.log(`标题内容: ${headingTexts.join(' | ')}`);
  }
  
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`\n输入框数量: ${inputs.length}`);
  
  const visibleText = await page.locator('body').innerText();
  const textPreview = visibleText.substring(0, 500).replace(/\n+/g, ' ');
  console.log(`\n页面文本预览:\n${textPreview}...`);
  
  return {
    url,
    title,
    buttonCount: buttons.length,
    buttonTexts,
    headingCount: headings.length,
    headingTexts,
    inputCount: inputs.length,
    textPreview
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
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  const report = [];
  report.push('# UI 自动化测试报告\n');
  report.push(`测试时间: ${new Date().toLocaleString('zh-CN')}\n`);
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    let info = await analyzePage(page, '01-homepage', '首页');
    report.push(`\n## 1. 首页\n- URL: ${info.url}\n- 按钮: ${info.buttonCount}个\n- 标题: ${info.headingTexts.join(', ')}\n`);
    
    const dropdownTriggers = await page.locator('[class*="dropdown"], [aria-haspopup]').all();
    if (dropdownTriggers.length > 0) {
      await dropdownTriggers[0].click();
      await sleep(500);
      
      info = await analyzePage(page, '02-dropdown', '下拉菜单');
      report.push(`\n## 2. 下拉菜单\n- 找到 ${dropdownTriggers.length} 个下拉触发器\n- 点击后显示菜单项\n`);
    }
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await sleep(500);
    
    const settingsBtn = page.locator('button:has-text("设置"), [aria-label*="设置"], [class*="settings"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await sleep(500);
      
      info = await analyzePage(page, '03-settings', '设置模态框');
      report.push(`\n## 3. 设置模态框\n- 按钮数量: ${info.buttonCount}\n- 标题: ${info.headingTexts.join(', ')}\n`);
      
      const closeBtn = page.locator('button:has-text("关闭"), [aria-label*="关闭"], [class*="close"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await sleep(300);
      }
    }
    
    await page.goto('http://localhost:5173#practice');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    info = await analyzePage(page, '04-practice', '练习模式');
    report.push(`\n## 4. 练习模式\n- URL: ${info.url}\n- 按钮: ${info.buttonCount}个\n- 输入框: ${info.inputCount}个\n- 标题: ${info.headingTexts.join(', ')}\n`);
    
    await page.goto('http://localhost:5173#flashcard-learn');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    info = await analyzePage(page, '05-flashcard-learn', '闪卡学习');
    report.push(`\n## 5. 闪卡学习\n- URL: ${info.url}\n- 按钮: ${info.buttonCount}个\n- 标题: ${info.headingTexts.join(', ')}\n`);
    
    await page.goto('http://localhost:5173#flashcard-manage');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    info = await analyzePage(page, '06-flashcard-manage', '闪卡管理');
    report.push(`\n## 6. 闪卡管理\n- URL: ${info.url}\n- 按钮: ${info.buttonCount}个\n- 标题: ${info.headingTexts.join(', ')}\n`);
    
    await page.goto('http://localhost:5173#vocabulary');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    info = await analyzePage(page, '07-vocabulary', '生词本');
    report.push(`\n## 7. 生词本\n- URL: ${info.url}\n- 按钮: ${info.buttonCount}个\n- 标题: ${info.headingTexts.join(', ')}\n`);
    
    await page.goto('http://localhost:5173#vocab-review');
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    
    info = await analyzePage(page, '08-vocab-review', '生词复习');
    report.push(`\n## 8. 生词复习\n- URL: ${info.url}\n- 按钮: ${info.buttonCount}个\n- 标题: ${info.headingTexts.join(', ')}\n`);
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await sleep(500);
    
    info = await analyzePage(page, '09-final', '最终状态');
    report.push(`\n## 9. 最终首页状态\n- URL: ${info.url}\n- 页面正常返回首页\n`);
    
  } catch (e) {
    console.log(`\n[错误] 测试过程中发生异常: ${e.message}`);
    await takeScreenshot(page, 'error', '错误状态');
    report.push(`\n## 错误\n- ${e.message}\n`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
  
  if (errors.length > 0) {
    console.log(`\n页面错误 (${errors.length}个):`);
    errors.forEach(err => console.log(`  - ${err}`));
    report.push(`\n## 页面错误\n${errors.map(e => `- ${e}`).join('\n')}\n`);
  }
  
  const errorLogs = consoleLogs.filter(log => log.toLowerCase().includes('error'));
  if (errorLogs.length > 0) {
    console.log(`\n控制台错误 (${errorLogs.length}个):`);
    errorLogs.slice(0, 5).forEach(log => console.log(`  - ${log}`));
  }
  
  report.push(`\n## 总结\n- 测试页面数: 9\n- 截图保存目录: ${SCREENSHOT_DIR}\n- 页面错误: ${errors.length}个\n- 控制台错误: ${errorLogs.length}个\n`);
  
  fs.writeFileSync(REPORT_FILE, report.join('\n'));
  console.log(`\n测试报告已保存: ${REPORT_FILE}`);
  
  await browser.close();
}

main().catch(console.error);
