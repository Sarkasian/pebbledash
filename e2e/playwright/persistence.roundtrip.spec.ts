import { test, expect } from '@playwright/test';

test('persistence roundtrip via localStorage preserves layout', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  // Build a simple layout
  await page.click('input[name="mode"][value="insert"]');
  const vertical = page.locator('.ud-edge.ud-edge-vertical');
  await vertical.first().click({ position: { x: 2, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(2);
  const before = await Promise.all(
    (await page.locator('.ud-tile').all()).map((t) => t.boundingBox()),
  );
  // Save snapshot to localStorage and reload
  await page.evaluate(() => {
    // @ts-ignore
    const snap = (window as any).dash.getModel().createSnapshot();
    localStorage.setItem('ud-snapshot', JSON.stringify(snap));
  });
  await page.reload();
  await expect(page.locator('#dash')).toBeVisible();
  await page.waitForSelector('.ud-tile');
  const after = await Promise.all(
    (await page.locator('.ud-tile').all()).map((t) => t.boundingBox()),
  );
  expect(after.length).toBe(before.length);
  // Compare the leftmost tile width as a quick geometry check
  const leftIdxBefore = before[0]!.x! <= before[1]!.x! ? 0 : 1;
  const leftIdxAfter = after[0]!.x! <= after[1]!.x! ? 0 : 1;
  expect(
    Math.abs((before[leftIdxBefore]!.width ?? 0) - (after[leftIdxAfter]!.width ?? 0)),
  ).toBeLessThanOrEqual(1.0);
  // Clear storage
  await page.evaluate(() => localStorage.removeItem('ud-snapshot'));
});
