import type { SeamOption } from '../operations/seam-graph.js';
import type { DeleteStrategy } from './StrategyRegistry.js';

export class HeuristicDeleteStrategy implements DeleteStrategy {
  readonly key = 'heuristic';

  choose(options: SeamOption[]): SeamOption | undefined {
    if (options.length === 0) return undefined;
    // Prefer options where all neighbors are unlocked
    const unlocked = options.filter((o) => o.allUnlocked);
    const pool = unlocked.length > 0 ? unlocked : options;
    // Prefer vertical over horizontal
    const vertical = pool.filter((o) => o.axis === 'vertical');
    const axisPool = vertical.length > 0 ? vertical : pool;
    // Prefer fewer segments (minimize number of tiles changed)
    axisPool.sort((a, b) => a.neighbors.length - b.neighbors.length);
    // Tie-breaker by side order
    const order = new Map<string, number>([
      ['left', 0],
      ['right', 1],
      ['top', 2],
      ['bottom', 3],
    ]);
    axisPool.sort((a, b) => {
      const byLen = a.neighbors.length - b.neighbors.length;
      if (byLen !== 0) return byLen;
      return (order.get(a.side) ?? 99) - (order.get(b.side) ?? 99);
    });
    return axisPool[0];
  }
}
