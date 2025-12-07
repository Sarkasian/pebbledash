import type { TileId } from '../../index.js';
import { ConditionNode } from '../nodes.js';

export interface HasTileIdParam {
  tileId: TileId;
}

export function TileExists() {
  return new ConditionNode<HasTileIdParam>(
    'TileExists',
    (ctx) => ctx.state.tiles.has(ctx.params.tileId),
    (ctx) => ({
      code: 'TileNotFound',
      message: `Tile ${String(ctx.params.tileId)} not found`,
    }),
  );
}
