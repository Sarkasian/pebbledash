import { DashboardState } from '../entities/DashboardState.js';
import { Tile } from '../entities/Tile.js';

function buildCanonicalMap(values: number[], eps: number): Map<number, number> {
  const sorted = Array.from(new Set(values)).sort((a, b) => a - b);
  const map = new Map<number, number>();
  let anchor = sorted[0] ?? 0;
  map.set(anchor, anchor);
  for (let i = 1; i < sorted.length; i++) {
    const v = sorted[i];
    if (v === undefined) continue;
    if (Math.abs(v - anchor) <= eps) {
      map.set(v, anchor);
    } else {
      anchor = v;
      map.set(v, anchor);
    }
  }
  return map;
}

export function canonicalizeState(state: DashboardState, eps: number): DashboardState {
  const tiles = state.toArray();
  if (tiles.length === 0) return state;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const t of tiles) {
    xs.push(t.x, t.x + t.width);
    ys.push(t.y, t.y + t.height);
  }
  const mapX = buildCanonicalMap(xs, eps);
  const mapY = buildCanonicalMap(ys, eps);
  const nextTiles: Tile[] = tiles.map((t) => {
    const left = mapX.get(t.x) ?? t.x;
    const right = mapX.get(t.x + t.width) ?? t.x + t.width;
    const top = mapY.get(t.y) ?? t.y;
    const bottom = mapY.get(t.y + t.height) ?? t.y + t.height;
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    return new Tile({ id: t.id, x: left, y: top, width, height, locked: t.locked, meta: t.meta });
  });
  return new DashboardState({ tiles: nextTiles, groups: state.groups });
}
