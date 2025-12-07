import type { InteractionState } from '../interaction/InteractionState.js';

/**
 * Core configuration for the dashboard model.
 */
export interface CoreConfig {
  /** Minimum tile dimensions in percentage units */
  minTile: { width: number; height: number };
  /** Maximum number of tiles allowed */
  maxTiles?: number;
  /** Floating point tolerance for coordinate comparisons */
  epsilon?: number;
  /** Whether to use the seam-based layout core */
  useSeamCore?: boolean;
}

/**
 * Extended config used during interaction handling.
 * Includes references to the model and interaction state.
 */
export interface InteractionConfig extends CoreConfig {
  /** Reference to the DashboardModel instance */
  model: {
    lifecycle: {
      emit(event: string, payload: unknown): Promise<void>;
    };
    insertTile(refId: unknown, opts: { side: string; size?: number }): Promise<unknown>;
    insertFullSpanAtSeam(opts: {
      orientation: string;
      seamCoord: number;
      side: string;
      size?: number;
    }): Promise<unknown>;
    insertAtContainerEdge(opts: { side: string; size?: number }): Promise<unknown>;
  };
  /** Reference to the interaction state */
  interaction: InteractionState;
}
