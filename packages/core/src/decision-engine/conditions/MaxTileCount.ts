import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';

export function MaxTileCount() {
  return new ConditionNode(
    'MaxTileCount',
    (ctx: DecisionContext) => {
      const max = ctx.config.maxTiles;
      if (!max) return true;
      return ctx.state.tiles.size <= max;
    },
    (ctx) => ({
      code: 'MaxTilesExceeded',
      message: `Max tiles ${ctx.config.maxTiles} exceeded`,
    }),
  );
}
