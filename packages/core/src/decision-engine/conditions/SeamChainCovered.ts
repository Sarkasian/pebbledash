import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { coversSpan } from '../../seams/coverage.js';

export function SeamChainCovered() {
  return new ConditionNode(
    'SeamChainCovered',
    (ctx: DecisionContext<{ seamId: string }>) => {
      const seam = ctx.state.seams.get(ctx.params.seamId);
      if (!seam) return false;
      const eps = ctx.config.epsilon ?? 1e-6;
      const tiles = ctx.state.toArray();
      if (seam.orientation === 'vertical') {
        const x = seam.coord;
        const leftSegs = tiles.filter((t) => Math.abs(t.x + t.width - x) <= eps);
        const rightSegs = tiles.filter((t) => Math.abs(t.x - x) <= eps);
        if (leftSegs.length === 0 || rightSegs.length === 0) return false;
        return coversSpan(leftSegs.concat(rightSegs), eps, 'vertical');
      } else {
        const y = seam.coord;
        const topSegs = tiles.filter((t) => Math.abs(t.y + t.height - y) <= eps);
        const bottomSegs = tiles.filter((t) => Math.abs(t.y - y) <= eps);
        if (topSegs.length === 0 || bottomSegs.length === 0) return false;
        return coversSpan(topSegs.concat(bottomSegs), eps, 'horizontal');
      }
    },
    () => ({ code: 'SeamNotCovered', message: 'Seam chain does not cover full span' }),
  );
}
