/**
 * TileExists condition node.
 * 
 * Validates that a tile with the specified ID exists in the dashboard state.
 * This is typically the first condition checked before any tile operation.
 * 
 * @module decision-engine/conditions/TileExists
 */

import type { TileId } from '../../index.js';
import { ConditionNode } from '../nodes.js';

/**
 * Parameter interface for conditions that require a tile ID.
 * Used by TileExists and most other tile-specific conditions.
 */
export interface HasTileIdParam {
  tileId: TileId;
}

/**
 * Creates a condition node that checks if a tile exists.
 * 
 * @returns A ConditionNode that validates tile existence
 * 
 * @example
 * ```ts
 * const graph = Sequence(
 *   TileExists(),  // First, verify tile exists
 *   NotLocked(),   // Then check if it's not locked
 *   // ... more conditions
 * );
 * ```
 * 
 * @violation
 * - Code: `TileNotFound`
 * - Message: `Tile {tileId} not found`
 */
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
