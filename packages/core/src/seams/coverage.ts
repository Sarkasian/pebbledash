import type { Tile } from '../entities/Tile.js';

export function coversSpan(
  tiles: Tile[],
  eps: number,
  orientation: 'vertical' | 'horizontal' = 'vertical',
): boolean {
  if (tiles.length === 0) return false;
  const intervals =
    orientation === 'vertical'
      ? tiles.map((t) => [t.y, t.y + t.height] as [number, number])
      : tiles.map((t) => [t.x, t.x + t.width] as [number, number]);
  intervals.sort((a, b) => a[0] - b[0]);
  let cur = 0;
  for (const [s, e] of intervals) {
    if (s > cur + eps) return false;
    cur = Math.max(cur, e);
    if (cur >= 100 - eps) return true;
  }
  return cur >= 100 - eps;
}

export function coversFullSpanVertical(
  neighbors: Array<{ y: number; height: number }>,
  eps: number,
): boolean {
  if (neighbors.length === 0) return false;
  const intervals = neighbors
    .map((t) => [t.y, t.y + t.height] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  let cur = 0;
  for (const [s, e] of intervals) {
    if (s > cur + eps) return false;
    cur = Math.max(cur, e);
    if (cur >= 100 - eps) return true;
  }
  return cur >= 100 - eps;
}

export function coversFullSpanHorizontal(
  neighbors: Array<{ x: number; width: number }>,
  eps: number,
): boolean {
  if (neighbors.length === 0) return false;
  const intervals = neighbors
    .map((t) => [t.x, t.x + t.width] as [number, number])
    .sort((a, b) => a[0] - b[0]);
  let cur = 0;
  for (const [s, e] of intervals) {
    if (s > cur + eps) return false;
    cur = Math.max(cur, e);
    if (cur >= 100 - eps) return true;
  }
  return cur >= 100 - eps;
}
