import type { DashboardState } from '../entities/DashboardState.js';
import type { TileId } from '../index.js';
import { makeSeamId } from '../entities/Seam.js';

export function seamIdForEdge(
  state: DashboardState,
  orientation: 'vertical' | 'horizontal',
  coord: number,
  eps = 1e-6,
): string {
  // 1. Try exact ID match (fast path)
  const id = makeSeamId(orientation, coord);
  if (state.seams.has(id)) return id;

  // 2. Fallback: search for existing seam within epsilon
  for (const seam of state.seams.values()) {
    if (seam.orientation === orientation && Math.abs(seam.coord - coord) <= eps) {
      return seam.id;
    }
  }

  // 3. Return generated ID (will be a new ID if not found)
  return id;
}

export function resolveEdgeToSeamId(
  state: DashboardState,
  tileId: TileId,
  edge: 'left' | 'right' | 'top' | 'bottom',
  eps = 1e-6,
): string | undefined {
  const t = state.tiles.get(tileId);
  if (!t) return undefined;

  let orientation: 'vertical' | 'horizontal';
  let coord: number;

  if (edge === 'left' || edge === 'right') {
    orientation = 'vertical';
    coord = edge === 'left' ? t.x : t.x + t.width;
  } else {
    orientation = 'horizontal';
    coord = edge === 'top' ? t.y : t.y + t.height;
  }

  // 1. Try exact ID match (fast path)
  // We use Number(toFixed(6)) to match the logic in makeSeamId, though makeSeamId does it internally too.
  const id = makeSeamId(orientation, Number(coord.toFixed(6)));
  if (state.seams.has(id)) return id;

  // 2. Fallback: search for existing seam within epsilon
  // This handles cases where tile coordinate drifted slightly or snapping anchored it differently
  for (const seam of state.seams.values()) {
    if (seam.orientation === orientation && Math.abs(seam.coord - coord) <= eps) {
      return seam.id;
    }
  }

  // 3. Return generated ID (will likely result in no-op if seam doesn't exist, but preserves old behavior)
  return id;
}
