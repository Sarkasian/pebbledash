import type { TileId } from '../../index.js';
import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { computeCoverageOptions } from '../../operations/seam-graph.js';

export function ResizableNeighborAvailable() {
  return new ConditionNode(
    'ResizableNeighborAvailable',
    (ctx: DecisionContext<{ tileId: TileId }>) => {
      const opts = computeCoverageOptions(ctx.state, ctx.params.tileId);
      // Available if at least one full-span option exists and all covering neighbors are unlocked
      return opts.some((o) => o.allUnlocked);
    },
    () => ({
      code: 'NeighborLocked',
      message: 'All full-span seam options are blocked by locked neighbors',
    }),
  );
}
