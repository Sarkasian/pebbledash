import { test, expect } from '@playwright/test';

test('seam overlays expose data-seam-id and support insert/resize flow', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  // Insert from top to create a horizontal seam, then from top-left to create vertical internal seam
  await page.click('input[name="mode"][value="insert"]');
  await page
    .locator('.ud-edge.ud-edge-horizontal')
    .first()
    .click({ position: { x: 6, y: 3 } });
  await page
    .locator('.ud-edge.ud-edge-vertical')
    .first()
    .click({ position: { x: 3, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(3);
  // Switch to resize
  await page.click('input[name="mode"][value="resize"]');
  const seam = page.locator('.ud-edge.ud-edge-vertical[data-seam-id]').first();
  const seamId = await seam.getAttribute('data-seam-id');
  expect(seamId).toBeTruthy();
  const seamBox = await seam.boundingBox();
  expect(seamBox).not.toBeNull();
  // Drag a bit to ensure it responds
  await page.mouse.move(seamBox!.x + 2, seamBox!.y + 2);
  await page.mouse.down();
  await page.mouse.move(seamBox!.x + 20, seamBox!.y + 2);
  await page.mouse.up();
  // Expect tiles still 3
  await expect(page.locator('.ud-tile')).toHaveCount(3);
});
