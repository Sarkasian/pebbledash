import { makeSeamId } from '../entities/Seam.js';
import type { DashboardState } from '../entities/DashboardState.js';
import type { Tile } from '../entities/Tile.js';
import { coversSpan } from './coverage.js';

export interface SeamClampResult {
  clampedDelta: number;
  min: number;
  max: number;
  chainCovered: boolean;
}

export function clampSeamDelta(
  state: DashboardState,
  seamId: string,
  delta: number,
  opts?: { minTile?: { width: number; height: number }; epsilon?: number; span?: [number, number] },
): SeamClampResult {
  const seam = state.seams.get(seamId);
  if (!seam) return { clampedDelta: 0, min: 0, max: 0, chainCovered: false };
  const eps = opts?.epsilon ?? 1e-6;
  const tiles = state.toArray();
  if (seam.orientation === 'vertical') {
    const x = seam.coord;
    let leftSegs = touchingRight(tiles, x, eps);
    let rightSegs = touchingLeft(tiles, x, eps);
    // If a span is provided, restrict consideration to tiles overlapping that vertical span
    if (opts?.span) {
      const [y0, y1] = opts.span;
      leftSegs = leftSegs.filter((t) => overlaps([t.y, t.y + t.height], [y0, y1], eps));
      rightSegs = rightSegs.filter((t) => overlaps([t.y, t.y + t.height], [y0, y1], eps));
    }
    const covered = coversSpan(leftSegs.concat(rightSegs), eps);
    // If one side is missing, no conservative area-preserving movement is possible
    if (leftSegs.length === 0 || rightSegs.length === 0) {
      return { clampedDelta: 0, min: 0, max: 0, chainCovered: covered };
    }
    const minW = opts?.minTile?.width ?? 5;
    // positive delta => move seam right => shrink right tiles, expand left tiles
    const rightShrinkMax = Math.min(...rightSegs.map((t) => Math.max(0, t.width - minW)));
    const leftShrinkMax = Math.min(...leftSegs.map((t) => Math.max(0, t.width - minW)));
    const minClamp = -leftShrinkMax;
    const maxClamp = rightShrinkMax;
    const clamped = Math.max(minClamp, Math.min(delta, maxClamp));
    return { clampedDelta: clamped, min: minClamp, max: maxClamp, chainCovered: covered };
  } else {
    const y = seam.coord;
    let topSegs = touchingBottom(tiles, y, eps);
    let bottomSegs = touchingTop(tiles, y, eps);
    if (opts?.span) {
      const [x0, x1] = opts.span;
      topSegs = topSegs.filter((t) => overlaps([t.x, t.x + t.width], [x0, x1], eps));
      bottomSegs = bottomSegs.filter((t) => overlaps([t.x, t.x + t.width], [x0, x1], eps));
    }
    const covered = coversSpan(topSegs.concat(bottomSegs), eps, 'horizontal');
    if (topSegs.length === 0 || bottomSegs.length === 0) {
      return { clampedDelta: 0, min: 0, max: 0, chainCovered: covered };
    }
    const minH = opts?.minTile?.height ?? 5;
    // positive delta => move seam down => shrink bottom tiles, expand top tiles
    const bottomShrinkMax = Math.min(...bottomSegs.map((t) => Math.max(0, t.height - minH)));
    const topShrinkMax = Math.min(...topSegs.map((t) => Math.max(0, t.height - minH)));
    const minClamp = -topShrinkMax;
    const maxClamp = bottomShrinkMax;
    const clamped = Math.max(minClamp, Math.min(delta, maxClamp));
    return { clampedDelta: clamped, min: minClamp, max: maxClamp, chainCovered: covered };
  }
}

export function seamIdForEdge(
  state: DashboardState,
  orientation: 'vertical' | 'horizontal',
  coord: number,
): string {
  const id = makeSeamId(orientation, coord);
  if (state.seams.has(id)) return id;
  return id;
}

function touchingRight(list: Tile[], seamX: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.x + t.width - seamX) <= eps);
}
function touchingLeft(list: Tile[], seamX: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.x - seamX) <= eps);
}
function touchingBottom(list: Tile[], seamY: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.y + t.height - seamY) <= eps);
}
function touchingTop(list: Tile[], seamY: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.y - seamY) <= eps);
}

// coverage helpers centralized in seams/coverage.ts

function overlaps(a: [number, number], b: [number, number], eps: number): boolean {
  const [a0, a1] = a[0] <= a[1] ? a : [a[1], a[0]];
  const [b0, b1] = b[0] <= b[1] ? b : [b[1], b[0]];
  return !(a1 < b0 + eps || b1 < a0 + eps);
}
