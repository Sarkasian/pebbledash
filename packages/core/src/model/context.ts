import type { TileId } from '../index.js';
import type { DashboardState } from '../entities/DashboardState.js';
import type { Operation } from '../decision-engine/types.js';
import type { StrategyRegistry } from '../strategies/StrategyRegistry.js';
import type { HistoryManager } from '../history/HistoryManager.js';
import type { LifecycleManager } from '../lifecycle/LifecycleManager.js';
import type { DecisionEngine } from '../decision-engine/DecisionEngine.js';
import type { CoreConfig } from './types.js';

export type ModelOp = Operation | 'initialize' | 'undo' | 'redo' | 'restore' | 'updateTile';

export interface ModelContext {
  getConfig(): CoreConfig;
  getState(): DashboardState;
  setState(next: DashboardState): void;
  generateTileId(): TileId;
  getHistory(): HistoryManager;
  getLifecycle(): LifecycleManager;
  getEngine(): DecisionEngine;
  getStrategies(): StrategyRegistry;
  notify(op: ModelOp): void;
  makeDecisionContext<P>(
    op: string,
    params: P,
  ): { state: DashboardState; op: any; params: P; config: any };
  makeValidationContext(): {
    state: DashboardState;
    op: any;
    params: Record<string, never>;
    config: any;
  };
}
