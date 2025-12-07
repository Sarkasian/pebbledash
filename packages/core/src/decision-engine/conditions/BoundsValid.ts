import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { withinBounds } from '../../utils/geometry.js';

export function BoundsValid() {
  return new ConditionNode(
    'BoundsValid',
    (ctx: DecisionContext) => Array.from(ctx.state.tiles.values()).every(withinBounds),
    () => ({ code: 'OutOfBounds', message: 'One or more tiles are out of bounds' }),
  );
}
