import { Tile } from '../entities/Tile.js';
import { clamp01 } from '../utils/geometry.js';

export function normalizeTiles(tiles: Tile[]): Tile[] {
  // Conservative normalization: clamp to [0,100] and round to micro precision
  const round = (v: number) => Math.round(v * 1e6) / 1e6;
  return tiles.map((t) => {
    const x = round(clamp01(t.x));
    const y = round(clamp01(t.y));
    const width = round(Math.max(0, Math.min(100 - x, t.width)));
    const height = round(Math.max(0, Math.min(100 - y, t.height)));
    if (x === t.x && y === t.y && width === t.width && height === t.height) return t;
    return new Tile({ id: t.id, x, y, width, height, locked: t.locked, meta: t.meta });
  });
}
