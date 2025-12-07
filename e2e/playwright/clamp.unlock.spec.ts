import { test, expect } from '@playwright/test';
import { getInternalTopVerticalSeam } from './utils/seams';

test('seam unlocks immediately when cursor crosses back inside clamp', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#dash')).toBeVisible();
  // Build 2-up-1-down: insert from top, then vertical on top-left
  await page.click('input[name="mode"][value="insert"]');
  const horiz = page.locator('.ud-edge.ud-edge-horizontal');
  await horiz.first().click({ position: { x: 6, y: 3 } });
  const vert = page.locator('.ud-edge.ud-edge-vertical');
  await vert.first().click({ position: { x: 3, y: 10 } });
  await expect(page.locator('.ud-tile')).toHaveCount(3);

  // Switch to resize mode
  await page.click('input[name="mode"][value="resize"]');
  const seam = await getInternalTopVerticalSeam(page);
  const box = await seam.boundingBox();
  const container = page.locator('#dash');
  const containerBox = await container.boundingBox();
  expect(box).not.toBeNull();
  expect(containerBox).not.toBeNull();

  // Record initial left style for seam overlay
  const leftBefore = await seam.evaluate(
    (el) => parseFloat((el as HTMLElement).style.left || '0') || 0,
  );

  // Drag to exceed clamp so handle freezes and turns red
  await page.mouse.move(box!.x + 2, box!.y + 2);
  await page.mouse.down();
  // Move far to the left to exceed clamp (toward container edge)
  const farLeft = Math.max(
    (containerBox!.x ?? 0) + 1,
    box!.x - Math.max((containerBox!.width ?? 600) * 0.6, 200),
  );
  await page.mouse.move(farLeft, box!.y + 2);
  // Record position while OOB (should be frozen at clamp)
  const leftAtClamp = await seam.evaluate(
    (el) => parseFloat((el as HTMLElement).style.left || '0') || 0,
  );

  // Move back across clamp: should immediately unlock (red class removed) and resume tracking
  await page.mouse.move(box!.x + 10, box!.y + 2);
  // Nudge a bit more to ensure a commit happens
  await page.mouse.move(box!.x + 6, box!.y + 2);
  await page.mouse.up();

  const leftAfter = await seam.evaluate(
    (el) => parseFloat((el as HTMLElement).style.left || '0') || 0,
  );
  // Expect overlay position changed compared to frozen-at-clamp position, confirming unlock and resume
  expect(Math.abs(leftAfter - leftAtClamp)).toBeGreaterThan(0.1);
});
