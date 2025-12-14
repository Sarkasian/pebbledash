/**
 * MinTileSize condition node.
 * 
 * Validates that a tile meets the minimum size requirements.
 * Used after resize or split operations to ensure tiles don't
 * become smaller than configured minimums.
 * 
 * @module decision-engine/conditions/MinTileSize
 */

import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import type { HasTileIdParam } from './TileExists.js';

/**
 * Creates a condition node that checks minimum tile size.
 * 
 * Compares the tile's current dimensions against the configured
 * minimum size (from `config.minTile`). If no minimum is configured,
 * this condition passes automatically.
 * 
 * @returns A ConditionNode that validates minimum size requirements
 * 
 * @example
 * ```ts
 * const graph = Sequence(
 *   TileExists(),
 *   NotLocked(),
 *   MinTileSize(),  // Ensures tile.width >= minTile.width && tile.height >= minTile.height
 * );
 * ```
 * 
 * @violation
 * - Code: `MinSize`
 * - Message: `Tile smaller than minimum size`
 */
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
