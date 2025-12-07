import { Page, Locator } from '@playwright/test';

export async function getInternalTopVerticalSeam(page: Page): Promise<Locator> {
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
  if (idx < 0) return seams.first();
  return seams.nth(idx);
}

export async function getSeamById(page: Page, id: string): Promise<Locator> {
  return page.locator(`.ud-edge[data-seam-id="${id}"]`);
}
