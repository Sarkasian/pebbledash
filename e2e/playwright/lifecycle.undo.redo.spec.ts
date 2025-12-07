import { test, expect } from '@playwright/test';

test('undo/redo restores geometry after split', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  await page.click('input[name="mode"][value="insert"]');
  const vertical = page.locator('.ud-edge.ud-edge-vertical');
  await vertical.first().click({ position: { x: 2, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(2);
  const before = await Promise.all(
    (await page.locator('.ud-tile').all()).map((t) => t.boundingBox()),
  );
  // Call model.undo via window.dash
  await page.evaluate(() => {
    // @ts-ignore
    (window as any).dash.getModel().undo();
  });
  await expect(page.locator('.ud-tile')).toHaveCount(1);
  // Redo returns to the previous geometry
  await page.evaluate(() => {
    // @ts-ignore
    (window as any).dash.getModel().redo();
  });
  await expect(page.locator('.ud-tile')).toHaveCount(2);
  const after = await Promise.all(
    (await page.locator('.ud-tile').all()).map((t) => t.boundingBox()),
  );
  // Compare widths sum as a proxy for geometry
  const sum = (arr: (ReturnType<typeof Math.abs> | null)[]) =>
    arr.reduce((s, b) => s + ((b as any)?.width ?? 0), 0);
  expect(Math.abs(sum(before as any) - sum(after as any))).toBeLessThanOrEqual(1.0);
});
