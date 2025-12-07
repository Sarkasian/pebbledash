import { test, expect, Page } from '@playwright/test';

async function goToDemo(page: Page) {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  // Wait for initial tiles to render
  await page.waitForSelector('.ud-tile');
  await page.waitForSelector('.ud-edge');
}

test('insert from top with single tile adds a new row', async ({ page }) => {
  await goToDemo(page);
  // Ensure insert mode
  await page.click('input[name="mode"][value="insert"]');
  // Pick the top horizontal edge (closest to container top)
  const container = page.locator('#dash');
  const containerBox = await container.boundingBox();
  expect(containerBox).not.toBeNull();
  const edges = page.locator('.ud-edge.ud-edge-horizontal');
  const count = await edges.count();
  expect(count).toBeGreaterThan(0);
  let topIndex = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < count; i++) {
    const box = await edges.nth(i).boundingBox();
    if (!box || !containerBox) continue;
    const dist = Math.abs(box.y - containerBox.y);
    if (dist < best) {
      best = dist;
      topIndex = i;
    }
  }
  const topEdge = edges.nth(topIndex);
  await topEdge.click({ position: { x: 3, y: 3 } });
  // Expect two tiles after insert
  await expect(page.locator('.ud-tile')).toHaveCount(2);
});
