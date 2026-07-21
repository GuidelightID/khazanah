import { test, expect } from '@playwright/test';
import { buildPageDocument, listGoldenPages } from './helpers/render-page.mjs';

test.describe('fixture page visual goldens', () => {
  for (const pageNum of listGoldenPages()) {
    test(`page ${pageNum} light theme`, async ({ page }) => {
      const html = buildPageDocument(pageNum, { theme: 'light' });
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);

      const root = page.locator('.mushaf-page');
      await expect(root).toBeVisible();
      await expect(root).toHaveAttribute('data-page', String(pageNum));
      await expect(root).toHaveScreenshot(`page-${pageNum}-light.png`);
    });
  }

  test('page 1 dark theme', async ({ page }) => {
    const html = buildPageDocument(1, { theme: 'dark' });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    const root = page.locator('.mushaf-page');
    await expect(root).toHaveScreenshot('page-1-dark.png');
  });

  test('page 1 structure', async ({ page }) => {
    const html = buildPageDocument(1);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-word="1:1:1"]')).toHaveCount(1);
    await expect(page.locator('.mushaf-sr-verses li')).not.toHaveCount(0);
  });
});
