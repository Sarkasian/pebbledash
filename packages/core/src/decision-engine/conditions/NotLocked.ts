/**
 * NotLocked condition node.
 * 
 * Validates that a tile is not locked before allowing modifications.
 * Locked tiles cannot be resized, split, or deleted.
 * 
 * @module decision-engine/conditions/NotLocked
 */

import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import type { HasTileIdParam } from './TileExists.js';

/**
 * Creates a condition node that checks if a tile is not locked.
 * 
 * A locked tile is protected from modifications. This condition
 * should be checked after TileExists() to ensure the tile is valid.
 * 
 * @returns A ConditionNode that validates the tile is unlocked
 * 
 * @example
 * ```ts
 * const graph = Sequence(
 *   TileExists(),
 *   NotLocked(),  // Fails if tile.locked === true
 *   MinTileSize(),
 * );
 * ```
 * 
 * @violation
 * - Code: `TileLocked`
 * - Message: `Tile {tileId} is locked`
 */
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
