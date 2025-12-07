import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import type { HasTileIdParam } from './TileExists.js';

export function NotLocked() {
  return new ConditionNode(
    'NotLocked',
    (ctx: DecisionContext<HasTileIdParam>) => {
      const t = ctx.state.tiles.get(ctx.params.tileId);
      return !!t && !t.locked;
    },
    (ctx) => ({ code: 'TileLocked', message: `Tile ${String(ctx.params.tileId)} is locked` }),
  );
}
