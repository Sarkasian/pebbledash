import { test, expect } from '@playwright/test';

async function buildTwoUpOneDown(page) {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  // Insert from top
  await page.click('input[name="mode"][value="insert"]');
  const horiz = page.locator('.ud-edge.ud-edge-horizontal');
  await horiz.first().click({ position: { x: 5, y: 3 } });
  // Insert from top-left -> create 2-up-1-down
  const vert = page.locator('.ud-edge.ud-edge-vertical');
  await vert.first().click({ position: { x: 3, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(3);
}

test('vertical seam between top tiles stays stable when clamped (no flicker)', async ({ page }) => {
  await buildTwoUpOneDown(page);
  await page.click('input[name="mode"][value="resize"]');

  // Choose the internal top seam (not at container edges, near top half)
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
    const isInternalX = x > 5 && x < containerBox.width - 5;
    const isTopHalf = y < containerBox.height / 2;
    if (isInternalX && isTopHalf && h > 5) {
      idx = i;
      break;
    }
  }
  expect(idx).toBeGreaterThanOrEqual(0);
  const seam = seams.nth(idx);
  const seamBox = await seam.boundingBox();
  expect(seamBox).not.toBeNull();

  // Drag quickly past min-size clamp to the right
  await page.mouse.move(seamBox!.x + seamBox!.width / 2, seamBox!.y + 2);
  await page.mouse.down();
  await page.mouse.move(seamBox!.x + 200, seamBox!.y + 2); // fast/large move

  // While out-of-bounds, sample seam left over a few frames and assert it's stable
  const samples = await page.evaluate(async () => {
    const el = document.querySelector('.ud-edge.ud-edge-vertical.edge--oob') as HTMLElement | null;
    if (!el) return [];
    const lefts: number[] = [];
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const rect = el.getBoundingClientRect();
      lefts.push(rect.left);
    }
    return lefts;
  });
  // If we collected samples, ensure max jitter is small (<= 1px)
  if (samples.length > 0) {
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    expect(max - min).toBeLessThanOrEqual(1.0);
  }

  await page.mouse.up();
});
