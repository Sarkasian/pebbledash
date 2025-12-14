import type { DashboardState } from '../entities/DashboardState.js';
import type { CoreConfig, InteractionConfig } from '../model/types.js';
import type { TileId } from '../index.js';

export type Operation =
  | 'insert'
  | 'split'
  | 'resize'
  | 'delete'
  | 'reposition'
  | 'validate'
  | 'seam:resize'
  | 'interaction:hoverEdge'
  | 'interaction:keyTab'
  | 'interaction:commit'
  | 'interaction:hoverEnd';

/**
 * Context passed to decision engine conditions and actions.
 * @template P - Type of the params object
 */
export interface DecisionContext<P = unknown> {
  state: DashboardState;
  op: Operation;
  params: P;
  config: CoreConfig;
}

/**
 * Context passed to interaction-related decision nodes.
 * Includes model and interaction state references.
 * @template P - Type of the params object
 */
export interface InteractionDecisionContext<P = unknown> {
  state: DashboardState;
  op: Operation;
  params: P;
  config: InteractionConfig;
}

export interface Violation {
  code: string;
  message: string;
  path?: string;
  data?: unknown;
}

export interface DecisionResult {
  valid: boolean;
  violations: Violation[];
  /** ID of newly created tile (for split/insert operations) */
  newTileId?: TileId;
}
