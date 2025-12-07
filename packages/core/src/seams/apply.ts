import type { DashboardState } from '../entities/DashboardState.js';
import { Tile } from '../entities/Tile.js';

export function applySeamDelta(
  state: DashboardState,
  seamId: string,
  clamped: number,
  opts?: { epsilon?: number; span?: [number, number] },
): DashboardState {
  const seam = state.seams.get(seamId);
  if (!seam) return state;
  const eps = opts?.epsilon ?? 1e-6;
  const tiles = state.toArray();
  if (seam.orientation === 'vertical') {
    const x = seam.coord;
    const span = opts?.span;
    const next = tiles.map((t) => {
      const isLeft = Math.abs(t.x + t.width - x) <= eps;
      const isRight = Math.abs(t.x - x) <= eps;
      if (span) {
        const [y0, y1] = span;
        const overlaps = !(t.y + t.height < y0 + eps || y1 < t.y + eps);
        if (!overlaps) return t;
      }
      if (isLeft) {
        return new Tile({
          id: t.id,
          x: t.x,
          y: t.y,
          width: t.width + clamped,
          height: t.height,
          locked: t.locked,
          meta: t.meta,
        });
      }
      if (isRight) {
        return new Tile({
          id: t.id,
          x: t.x + clamped,
          y: t.y,
          width: t.width - clamped,
          height: t.height,
          locked: t.locked,
          meta: t.meta,
        });
      }
      return t;
    });
    return new (state.constructor as any)(
      { tiles: next, groups: state.groups },
      state.adjacencyVersion + 1,
    ) as DashboardState;
  } else {
    const y = seam.coord;
    const span = opts?.span;
    const next = tiles.map((t) => {
      const isTop = Math.abs(t.y + t.height - y) <= eps;
      const isBottom = Math.abs(t.y - y) <= eps;
      if (span) {
        const [x0, x1] = span;
        const overlaps = !(t.x + t.width < x0 + eps || x1 < t.x + eps);
        if (!overlaps) return t;
      }
      if (isTop) {
        return new Tile({
          id: t.id,
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height + clamped,
          locked: t.locked,
          meta: t.meta,
        });
      }
      if (isBottom) {
        return new Tile({
          id: t.id,
          x: t.x,
          y: t.y + clamped,
          width: t.width,
          height: t.height - clamped,
          locked: t.locked,
          meta: t.meta,
        });
      }
      return t;
    });
    return new (state.constructor as any)(
      { tiles: next, groups: state.groups },
      state.adjacencyVersion + 1,
    ) as DashboardState;
  }
}
