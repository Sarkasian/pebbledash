import type { TileId } from '../../index.js';
import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { computeCoverageOptions } from '../../operations/seam-graph.js';

export function FullSpanSeamAvailable() {
  return new ConditionNode(
    'FullSpanSeamAvailable',
    (ctx: DecisionContext<{ tileId: TileId }>) => {
      const opts = computeCoverageOptions(ctx.state, ctx.params.tileId);
      return opts.length > 0;
    },
    () => ({
      code: 'NoFullSpanCoverage',
      message: 'No axis/side offers full-span coverage without splitting tiles',
    }),
  );
}
