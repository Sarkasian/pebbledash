/**
 * NotOnlyTile condition node.
 * 
 * Validates that there is more than one tile in the dashboard,
 * preventing deletion of the last remaining tile.
 * 
 * @module decision-engine/conditions/NotOnlyTile
 */

import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';

/**
 * Creates a condition node that prevents deleting the last tile.
 * 
 * A dashboard must always have at least one tile. This condition
 * ensures delete operations fail when only one tile remains.
 * 
 * @returns A ConditionNode that validates more than one tile exists
 * 
 * @example
 * ```ts
 * const deleteGraph = Sequence(
 *   TileExists(),
 *   NotLocked(),
 *   NotOnlyTile(),  // Prevents deletion if tiles.size === 1
 *   // ... delete logic
 * );
 * ```
 * 
 * @violation
 * - Code: `LastTile`
 * - Message: `Cannot delete the last remaining tile`
 */
export function NotOnlyTile() {
  return new ConditionNode(
    'NotOnlyTile',
    (ctx: DecisionContext) => ctx.state.tiles.size > 1,
    () => ({ code: 'LastTile', message: 'Cannot delete the last remaining tile' }),
  );
}
