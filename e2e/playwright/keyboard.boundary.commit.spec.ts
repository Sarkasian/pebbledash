import { test, expect } from '@playwright/test';

test('Tab cycles boundaries and Enter commits insert at full-span', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  await page.click('input[name="mode"][value="insert"]');
  // Build L1/L2 stacked left and R full-span right by inserting top then left
  await page
    .locator('.ud-edge.ud-edge-horizontal')
    .first()
    .click({ position: { x: 6, y: 3 } });
  await page
    .locator('.ud-edge.ud-edge-vertical')
    .first()
    .click({ position: { x: 3, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(3);
  // Hover on the vertical internal seam near top to form a group with synthetic full-span
  const container = page.locator('#dash');
  const containerBox = await container.boundingBox();
  const seams = page.locator('.ud-edge.ud-edge-vertical');
  const count = await seams.count();
  let idx = -1;
  for (let i = 0; i < count; i++) {
    const box = await seams.nth(i).boundingBox();
    if (!box || !containerBox) continue;
    const x = box.x - containerBox.x;
    const y = box.y - containerBox.y;
    const h = box.height ?? 0;
    if (x > 5 && x < containerBox.width - 5 && y < containerBox.height / 2 && h > 5) {
      idx = i;
      break;
    }
  }
  expect(idx).toBeGreaterThanOrEqual(0);
  const seam = seams.nth(idx);
  const seamBox = await seam.boundingBox();
  await page.mouse.move(seamBox!.x + 1, seamBox!.y + 1);
  // Focus container, Tab a couple of times, then Enter to commit at current boundary
  await page.locator('#dash').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.ud-tile')).toHaveCount(4);
});
