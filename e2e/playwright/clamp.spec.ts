import { test, expect } from '@playwright/test';

async function setupTwoUpOneDown(page) {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  await page.click('input[name=\"mode\"][value=\"insert\"]');
  await page
    .locator('.ud-edge.ud-edge-horizontal')
    .first()
    .click({ position: { x: 5, y: 3 } });
  await page
    .locator('.ud-edge.ud-edge-vertical')
    .first()
    .click({ position: { x: 3, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(3);
}

test('cannot step past min-size via repeated drags on the same vertical seam', async ({ page }) => {
  await setupTwoUpOneDown(page);
  await page.click('input[name=\"mode\"][value=\"resize\"]');
  const container = page.locator('#dash');
  const containerBox = await container.boundingBox();
  const seams = page.locator('.ud-edge.ud-edge-vertical:not(.disabled)');
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
  let seam = seams.nth(idx);
  await expect(seam).toBeVisible();
  const seamId = await seam.getAttribute('data-seam-id');
  expect(seamId).toBeTruthy();
  let seamBox = await seam.boundingBox();
  expect(seamBox).not.toBeNull();
  // First drag to clamp
  await page.mouse.move(seamBox!.x + seamBox!.width / 2, seamBox!.y + 2);
  await page.mouse.down();
  await page.mouse.move(seamBox!.x + 400, seamBox!.y + 2);
  await page.mouse.up();
  await page.waitForTimeout(50);
  // Record width of the left top tile near the seam after first drag
  const tilesTop = await page.locator('.ud-tile').all();
  const boxesTop = await Promise.all(tilesTop.map((t) => t.boundingBox()));
  const topRow = boxesTop.filter(
    (b) => (b?.y ?? 0) < containerBox!.y + (containerBox!.height ?? 0) / 2,
  );
  const leftTopBefore = topRow.sort((a, b) => a!.x - b!.x)[0]!;
  // Second drag further same direction - should not move more than ~1px if fully clamped
  await page.mouse.move(seamBox!.x + (seamBox!.width ?? 0) / 2, seamBox!.y + 2);
  await page.mouse.down();
  await page.mouse.move(seamBox!.x + 400, seamBox!.y + 2);
  await page.mouse.up();
  await page.waitForTimeout(50);
  // Measure left top tile again; width delta should be minimal
  const tilesTop2 = await page.locator('.ud-tile').all();
  const boxesTop2 = await Promise.all(tilesTop2.map((t) => t.boundingBox()));
  const topRow2 = boxesTop2.filter(
    (b) => (b?.y ?? 0) < containerBox!.y + (containerBox!.height ?? 0) / 2,
  );
  const leftTopAfter = topRow2.sort((a, b) => a!.x - b!.x)[0]!;
  expect(Math.abs((leftTopAfter.width ?? 0) - (leftTopBefore.width ?? 0))).toBeLessThanOrEqual(1.0);
});
