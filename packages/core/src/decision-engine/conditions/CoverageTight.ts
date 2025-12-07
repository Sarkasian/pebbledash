import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { area } from '../../utils/geometry.js';

export function CoverageTight() {
  return new ConditionNode(
    'CoverageTight',
    (ctx: DecisionContext) => {
      const tiles = Array.from(ctx.state.tiles.values());
      const sum = tiles.reduce((acc, t) => acc + area(t), 0);
      const container = 100 * 100;
      const eps = (ctx.config?.epsilon as number | undefined) ?? 1e-6;
      return Math.abs(sum - container) <= eps;
    },
    () => ({
      code: 'CoverageGap',
      message: 'Total tile coverage does not exactly match container area',
    }),
  );
}
