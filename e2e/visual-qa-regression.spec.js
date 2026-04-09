import { test, expect } from '@playwright/test';

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, name: 'desktop' },
  tablet: { width: 768, height: 1024, name: 'tablet' },
  mobile: { width: 375, height: 667, name: 'mobile' }
};

for (const [deviceName, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`Visual QA - ${deviceName} (${viewport.width}x${viewport.height})`, () => {
    let consoleErrors = [];
    let networkErrors = [];

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      
      consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push({ text: msg.text(), location: msg.location() });
        }
      });

      networkErrors = [];
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push({ url: response.url(), status: response.status() });
        }
      });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    test(`01 - Homepage Load`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/01-homepage.png`,
        fullPage: true 
      });

      await expect(page.locator('.homepage-logo')).toBeVisible();
      await expect(page.locator('.homepage-hero')).toBeVisible();
      await expect(page.locator('.homepage-sections')).toBeVisible();
      
      console.log(`[${deviceName}] Console errors:`, consoleErrors.length);
      console.log(`[${deviceName}] Network errors:`, networkErrors.length);
    });

    test(`02 - Login Modal`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.homepage-login-btn').click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/02-login-modal.png`,
        fullPage: true 
      });

      await expect(page.locator('.auth-modal-content')).toBeVisible();
      
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('testpassword');
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/02-login-filled.png`,
        fullPage: true 
      });
      
      await page.locator('.auth-close-btn').click();
      await page.waitForTimeout(500);
    });

    test(`03 - Practice Mode Section`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const practiceSection = page.locator('.homepage-section').filter({ hasText: '练习模式' });
      await practiceSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/03-practice-section.png`,
        fullPage: true 
      });

      await expect(practiceSection.locator('.section-item').filter({ hasText: '闪卡学习' })).toBeVisible();
      await expect(practiceSection.locator('.section-item').filter({ hasText: '闪卡管理' })).toBeVisible();
      await expect(practiceSection.locator('.section-item').filter({ hasText: '生词本复习' })).toBeVisible();
    });

    test(`04 - Textbook Resources Section`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const resourceSection = page.locator('.homepage-section').filter({ hasText: '教材资源' });
      await resourceSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/04-resource-section.png`,
        fullPage: true 
      });

      await expect(resourceSection.locator('.section-item').filter({ hasText: '第一册' })).toBeVisible();
      await expect(resourceSection.locator('.section-item').filter({ hasText: '第二册' })).toBeVisible();
      await expect(resourceSection.locator('.section-item').filter({ hasText: '第三册' })).toBeVisible();
      await expect(resourceSection.locator('.section-item').filter({ hasText: '简单句练习' })).toBeVisible();
    });

    test(`05 - Cloud Resources Section`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const cloudSection = page.locator('.homepage-section').filter({ hasText: '云端资源' });
      await cloudSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/05-cloud-section.png`,
        fullPage: true 
      });

      await expect(cloudSection.locator('.section-item').filter({ hasText: 'Notion' })).toBeVisible();
      await expect(cloudSection.locator('.section-item').filter({ hasText: 'Supabase 文章' })).toBeVisible();
    });

    test(`06 - Simple Sentence Practice Page`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '简单句练习' }).click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/06-practice-page.png`,
        fullPage: true 
      });

      await expect(page.locator('.practice-card')).toBeVisible();
      await expect(page.locator('.play-button')).toBeVisible();
      await expect(page.locator('.next-sentence-button')).toBeVisible();
      
      await page.locator('.play-button').click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/06-practice-playing.png`,
        fullPage: true 
      });

      const wordInputs = page.locator('.word-input');
      const inputCount = await wordInputs.count();
      
      if (inputCount > 0) {
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/06-practice-inputs.png`,
          fullPage: true 
        });
        
        await wordInputs.first().click();
        await wordInputs.first().fill('test');
        
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/06-practice-typing.png`,
          fullPage: true 
        });
      }

      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`07 - New Concept English 1`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '第一册' }).click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/07-nce1-page.png`,
        fullPage: true 
      });

      await expect(page.locator('.practice-card')).toBeVisible();
      
      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`08 - New Concept English 2`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '第二册' }).click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/08-nce2-selector.png`,
        fullPage: true 
      });

      const articleItems = page.locator('.article-item, .lesson-item');
      const articleCount = await articleItems.count();
      
      if (articleCount > 0) {
        await articleItems.first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/08-nce2-practice.png`,
          fullPage: true 
        });
      }
      
      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`09 - New Concept English 3`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '第三册' }).click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/09-nce3-selector.png`,
        fullPage: true 
      });

      const articleItems = page.locator('.article-item, .lesson-item');
      const articleCount = await articleItems.count();
      
      if (articleCount > 0) {
        await articleItems.first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/09-nce3-practice.png`,
          fullPage: true 
        });
      }
      
      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`10 - Flashcard Learning Page`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '闪卡学习' }).click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/10-flashcard-learn.png`,
        fullPage: true 
      });

      const flashcard = page.locator('.flashcard');
      const emptyState = page.locator('.empty-state');
      
      if (await flashcard.isVisible()) {
        const showAnswerBtn = page.locator('.show-answer-button');
        if (await showAnswerBtn.isVisible()) {
          await showAnswerBtn.click();
          await page.waitForTimeout(500);
          
          await page.screenshot({ 
            path: `test-results/visual-qa/${deviceName}/10-flashcard-answer.png`,
            fullPage: true 
          });
        }
      } else if (await emptyState.isVisible()) {
        console.log(`[${deviceName}] Flashcard learn: empty state`);
      }
      
      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`11 - Flashcard Management Page`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '闪卡管理' }).click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/11-flashcard-manage.png`,
        fullPage: true 
      });

      const createBtn = page.locator('.create-button');
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/11-flashcard-create-form.png`,
          fullPage: true 
        });
        
        await page.locator('textarea[name="question"]').fill('Test Question?');
        await page.locator('textarea[name="answer"]').fill('Test Answer');
        
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/11-flashcard-form-filled.png`,
          fullPage: true 
        });
        
        await page.locator('.cancel-button').click();
        await page.waitForTimeout(500);
      }
      
      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`12 - Notion Data Source`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: 'Notion' }).click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/12-notion-page.png`,
        fullPage: true 
      });

      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`13 - Settings Modal`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.locator('.section-item').filter({ hasText: '简单句练习' }).click();
      await page.waitForTimeout(3000);
      
      const settingsBtn = page.locator('.settings-button, button:has-text("设置"), button:has-text("⚙")');
      if (await settingsBtn.isVisible()) {
        await settingsBtn.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: `test-results/visual-qa/${deviceName}/13-settings-modal.png`,
          fullPage: true 
        });
        
        await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);
      }
      
      await page.locator('.back-button').click();
      await page.waitForTimeout(1000);
    });

    test(`14 - Full Interaction Flow`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const browseBtn = page.locator('.homepage-btn-secondary');
      if (await browseBtn.isVisible()) {
        await browseBtn.click();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/14-flow-browse.png`,
        fullPage: true 
      });
      
      await page.locator('.section-item').filter({ hasText: '简单句练习' }).click();
      await page.waitForTimeout(3000);
      
      await page.locator('.play-button').click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/14-flow-practice.png`,
        fullPage: true 
      });
      
      const wordInputs = page.locator('.word-input');
      const inputCount = await wordInputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        await wordInputs.nth(i).click();
        await wordInputs.nth(i).fill('word');
        await page.waitForTimeout(200);
      }
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/14-flow-input.png`,
        fullPage: true 
      });
      
      await page.locator('.next-sentence-button').click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-results/visual-qa/${deviceName}/14-flow-next.png`,
        fullPage: true 
      });
    });
  });
}
