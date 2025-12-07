import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';

export function NotOnlyTile() {
  return new ConditionNode(
    'NotOnlyTile',
    (ctx: DecisionContext) => ctx.state.tiles.size > 1,
    () => ({ code: 'LastTile', message: 'Cannot delete the last remaining tile' }),
  );
}
