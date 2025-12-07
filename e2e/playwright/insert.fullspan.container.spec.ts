import { test, expect } from '@playwright/test';

test('insert at container left/right creates full-height column', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  await page.click('input[name="mode"][value="insert"]');
  const container = page.locator('#dash');
  const containerBox = await container.boundingBox();
  const seams = page.locator('.ud-edge.ud-edge-vertical');
  const count = await seams.count();
  expect(count).toBeGreaterThan(0);
  // Click the leftmost seam (x closest to container left) → container insert on left
  let best = { idx: 0, dist: Number.POSITIVE_INFINITY };
  for (let i = 0; i < count; i++) {
    const box = await seams.nth(i).boundingBox();
    if (!box || !containerBox) continue;
    const dist = Math.abs(box.x - containerBox.x);
    if (dist < best.dist) best = { idx: i, dist };
  }
  await seams.nth(best.idx).click({ position: { x: 2, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(2);
  const boxes = await Promise.all(
    (await page.locator('.ud-tile').all()).map((t) => t.boundingBox()),
  );
  // Left tile should start at x=container left
  const leftIdx = boxes[0]!.x! <= boxes[1]!.x! ? 0 : 1;
  expect(Math.abs(boxes[leftIdx]!.x! - containerBox!.x!)).toBeLessThanOrEqual(1.0);

  // Now insert on the right container edge
  await page.click('input[name="mode"][value="insert"]');
  const seams2 = page.locator('.ud-edge.ud-edge-vertical');
  const count2 = await seams2.count();
  let bestRight = { idx: 0, dist: Number.POSITIVE_INFINITY };
  for (let i = 0; i < count2; i++) {
    const box = await seams2.nth(i).boundingBox();
    if (!box || !containerBox) continue;
    const dist = Math.abs(box.x + (box.width ?? 0) - (containerBox.x + containerBox.width!));
    if (dist < bestRight.dist) bestRight = { idx: i, dist };
  }
  await seams2.nth(bestRight.idx).click({ position: { x: 2, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(3);
});
