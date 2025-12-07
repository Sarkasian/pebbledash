import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import type { HasTileIdParam } from './TileExists.js';

export function MinTileSize() {
  return new ConditionNode(
    'MinTileSize',
    (ctx: DecisionContext<HasTileIdParam>) => {
      const t = ctx.state.tiles.get(ctx.params.tileId);
      const min = ctx.config.minTile;
      if (!t || !min) return true; // if not configured, ignore here
      return t.width >= min.width && t.height >= min.height;
    },
    () => ({ code: 'MinSize', message: 'Tile smaller than minimum size' }),
  );
}
