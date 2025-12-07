import type { TileId } from '../index.js';
import type { DecisionContext } from '../decision-engine/types.js';
import { EPSILON } from '../utils/geometry.js';

export type EdgeSide = 'left' | 'right' | 'top' | 'bottom';
export type Orientation = 'vertical' | 'horizontal';

export interface ParsedEdge {
  tileId: string;
  side: EdgeSide;
}

export function edgeId(tileId: TileId, side: EdgeSide): string {
  return `edge|${tileId}|${side}`;
}

export function boundaryId(tileId: TileId, side: EdgeSide, index: number): string {
  return `boundary|${tileId}|${side}|${index}`;
}

export function orientationOf(side: EdgeSide): Orientation {
  return side === 'left' || side === 'right' ? 'vertical' : 'horizontal';
}

export function parseEdgeId(id: string): ParsedEdge | null {
  if (!id.startsWith('edge|')) return null;
  const parts = id.split('|');
  const tileId = parts[1];
  const side = parts[2] as EdgeSide | undefined;
  if (!tileId || !side) return null;
  return { tileId, side };
}

export function seamEpsFromCtx(ctx: DecisionContext): number {
  const base = ctx.config.epsilon ?? EPSILON;
  return Math.max(base, 1e-2);
}

export function computeSeam(
  ctx: DecisionContext<{ edgeId: string }>,
): { orientation: Orientation; coord: number } | null {
  const parsed = parseEdgeId(ctx.params.edgeId);
  if (!parsed) return null;
  const { tileId, side } = parsed;
  const ref = ctx.state.tiles.get(tileId as TileId);
  if (!ref) return null;
  if (side === 'left' || side === 'right') {
    const x = side === 'left' ? ref.x : ref.x + ref.width;
    return { orientation: 'vertical', coord: x };
  }
  const y = side === 'top' ? ref.y : ref.y + ref.height;
  return { orientation: 'horizontal', coord: y };
}
