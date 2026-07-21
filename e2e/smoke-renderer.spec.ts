import { test, expect } from '@playwright/test';
import { buildPageDocument } from './helpers/render-page.mjs';

test('html backend exposes a11y structure', async ({ page }) => {
  await page.setContent(buildPageDocument(1), { waitUntil: 'domcontentloaded' });

  const root = page.locator('.mushaf-page');
  await expect(root).toHaveAttribute('role', 'document');
  await expect(root).toHaveAttribute('dir', 'rtl');
  await expect(root).toHaveAttribute('lang', 'ar');
  await expect(page.locator('[data-mushaf-overlay-root]')).toHaveCount(1);
  await expect(page.locator('.mushaf-sr-verses')).toHaveCount(1);
});
