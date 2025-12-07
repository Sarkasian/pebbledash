import type { DashboardState } from '../../entities/DashboardState.js';
import type { TileId } from '../../index.js';
import type { ResizeStrategy } from '../StrategyRegistry.js';
import { LinearResizeStrategy } from './LinearResizeStrategy.js';

export class AutomaticResizeStrategy implements ResizeStrategy {
  readonly key = 'automatic';
  private readonly delegate = new LinearResizeStrategy();

  compute(
    state: DashboardState,
    tileId: TileId,
    edge: 'left' | 'right' | 'top' | 'bottom',
    delta: number,
    opts?: { minTile?: { width: number; height: number }; epsilon?: number },
  ): DashboardState {
    return this.delegate.compute(state, tileId, edge, delta, { ...opts, useSeamCore: true });
  }
}
