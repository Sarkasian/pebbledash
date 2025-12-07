import { DashboardState } from '../../entities/DashboardState.js';
import type { TileId } from '../../index.js';
import type { ResizeStrategy } from '../StrategyRegistry.js';
import {
  clampSeamDelta as seamClamp,
  applySeamDelta as seamApply,
  resolveEdgeToSeamId,
} from '../../seams/index.js';

export class LinearResizeStrategy implements ResizeStrategy {
  readonly key = 'linear';
  computeSeamRange(
    state: DashboardState,
    tileId: TileId,
    edge: 'left' | 'right' | 'top' | 'bottom',
    opts?: { minTile?: { width: number; height: number }; epsilon?: number },
  ): { min: number; max: number; chainCovered: boolean } {
    const seamId = resolveEdgeToSeamId(state, tileId, edge, opts?.epsilon ?? 1e-6);
    if (!seamId) return { min: 0, max: 0, chainCovered: false };
    const { min, max, chainCovered } = seamClamp(state, seamId, 0, opts);
    return { min, max, chainCovered };
  }
  /**
   * Compute the allowable clamp range for a seam movement and return the clamped delta.
   * This mirrors the internal compute path without constructing a next state.
   */
  clampSeamDelta(
    state: DashboardState,
    tileId: TileId,
    edge: 'left' | 'right' | 'top' | 'bottom',
    delta: number,
    opts?: { minTile?: { width: number; height: number }; epsilon?: number; useSeamCore?: boolean },
  ): { clampedDelta: number; min: number; max: number; chainCovered: boolean } {
    const seamId = resolveEdgeToSeamId(state, tileId, edge, opts?.epsilon ?? 1e-6);
    if (!seamId) return { clampedDelta: 0, min: 0, max: 0, chainCovered: false };
    return seamClamp(state, seamId, delta, opts);
  }
  compute(
    state: DashboardState,
    tileId: TileId,
    edge: 'left' | 'right' | 'top' | 'bottom',
    delta: number,
    opts?: { minTile?: { width: number; height: number }; epsilon?: number; useSeamCore?: boolean },
  ): DashboardState {
    const seamId = resolveEdgeToSeamId(state, tileId, edge, opts?.epsilon ?? 1e-6);
    if (!seamId) return state;
    const { clampedDelta } = seamClamp(state, seamId, delta, opts);
    if (Math.abs(clampedDelta) <= (opts?.epsilon ?? 1e-6)) return state;
    return seamApply(state, seamId, clampedDelta, { epsilon: opts?.epsilon });
  }
}

// resolveEdgeToSeamId centralized in seams/ids.ts
