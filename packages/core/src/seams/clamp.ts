/**
 * Seam delta clamping operations.
 * Calculates valid movement ranges for seam-based resizing.
 * @module seams/clamp
 */

import { makeSeamId } from '../entities/Seam.js';
import type { DashboardState } from '../entities/DashboardState.js';
import type { Tile } from '../entities/Tile.js';
import { coversSpan } from './coverage.js';

/**
 * Result of clamping a seam delta to valid bounds.
 */
export interface SeamClampResult {
  /** The delta value after clamping to valid range */
  clampedDelta: number;
  /** Minimum allowed delta (negative = move left/up) */
  min: number;
  /** Maximum allowed delta (positive = move right/down) */
  max: number;
  /** Whether the seam chain covers its full span */
  chainCovered: boolean;
}

/**
 * Clamp a seam movement delta to ensure tiles maintain minimum sizes.
 * 
 * For a vertical seam (divides tiles horizontally):
 * - Positive delta moves seam right (shrinks right tiles, expands left)
 * - Negative delta moves seam left (shrinks left tiles, expands right)
 * 
 * For a horizontal seam (divides tiles vertically):
 * - Positive delta moves seam down (shrinks bottom tiles, expands top)
 * - Negative delta moves seam up (shrinks top tiles, expands bottom)
 * 
 * @param state - The current dashboard state
 * @param seamId - The seam identifier
 * @param delta - The requested movement delta (in percentage)
 * @param opts - Optional configuration
 * @param opts.minTile - Minimum tile dimensions
 * @param opts.epsilon - Tolerance for floating-point comparisons
 * @param opts.span - Optional span to restrict which tiles are considered
 * @returns The clamped result with min/max bounds
 * 
 * @example
 * ```ts
 * const result = clampSeamDelta(state, 'v:50', 10, { minTile: { width: 10, height: 10 } });
 * // result.clampedDelta will be at most what preserves minimum tile widths
 * ```
 */
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

/**
 * Get or create a seam ID for a given edge position.
 * 
 * @param state - The dashboard state
 * @param orientation - 'vertical' or 'horizontal'
 * @param coord - The coordinate value (x for vertical, y for horizontal)
 * @returns The seam ID string
 */
export function seamIdForEdge(
  state: DashboardState,
  orientation: 'vertical' | 'horizontal',
  coord: number,
): string {
  const id = makeSeamId(orientation, coord);
  if (state.seams.has(id)) return id;
  return id;
}

/**
 * Find tiles whose right edge touches the seam at seamX.
 * @internal
 */
function touchingRight(list: Tile[], seamX: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.x + t.width - seamX) <= eps);
}

/**
 * Find tiles whose left edge touches the seam at seamX.
 * @internal
 */
function touchingLeft(list: Tile[], seamX: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.x - seamX) <= eps);
}

/**
 * Find tiles whose bottom edge touches the seam at seamY.
 * @internal
 */
function touchingBottom(list: Tile[], seamY: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.y + t.height - seamY) <= eps);
}

/**
 * Find tiles whose top edge touches the seam at seamY.
 * @internal
 */
function touchingTop(list: Tile[], seamY: number, eps: number): Tile[] {
  return list.filter((t) => Math.abs(t.y - seamY) <= eps);
}

/**
 * Check if two ranges overlap within a tolerance.
 * @internal
 */
function overlaps(a: [number, number], b: [number, number], eps: number): boolean {
  const [a0, a1] = a[0] <= a[1] ? a : [a[1], a[0]];
  const [b0, b1] = b[0] <= b[1] ? b : [b[1], b[0]];
  return !(a1 < b0 + eps || b1 < a0 + eps);
}
