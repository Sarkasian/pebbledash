import type { TileId } from '../index.js';
import { DashboardState } from '../entities/DashboardState.js';
import { Tile } from '../entities/Tile.js';
import { GraphRegistry, DecisionEngine } from '../decision-engine/DecisionEngine.js';
import type { DecisionResult } from '../decision-engine/types.js';
import { SequenceNode } from '../decision-engine/nodes.js';
import { BoundsValid } from '../decision-engine/conditions/BoundsValid.js';
import { NotLocked } from '../decision-engine/conditions/NotLocked.js';
import { TileExists } from '../decision-engine/conditions/TileExists.js';
import { NotOnlyTile } from '../decision-engine/conditions/NotOnlyTile.js';
import { SeamChainCovered } from '../decision-engine/conditions/SeamChainCovered.js';
import { GroupPolicyAllowsDelete } from '../decision-engine/conditions/GroupPolicyAllowsDelete.js';
import { ResizableNeighborAvailable } from '../decision-engine/conditions/ResizableNeighborAvailable.js';
import { FullSpanSeamAvailable } from '../decision-engine/conditions/FullSpanSeamAvailable.js';
import { CoverageTight } from '../decision-engine/conditions/CoverageTight.js';
import { MinTileSizeAll } from '../decision-engine/conditions/MinTileSizeAll.js';
import { StrategyRegistry } from '../strategies/StrategyRegistry.js';
import { HeuristicDeleteStrategy } from '../strategies/DeleteStrategy.js';
import { LinearResizeStrategy } from '../strategies/resize/LinearResizeStrategy.js';
import { HistoryManager } from '../history/HistoryManager.js';
import { LifecycleManager } from '../lifecycle/LifecycleManager.js';
import { InteractionState } from '../interaction/InteractionState.js';
import {
  HoverEdgeGraph,
  KeyTabGraph,
  CommitGraph,
  HoverEndGraph,
} from '../decision-engine/interaction/nodes.js';
import type { ModelContext, ModelOp } from './context.js';
import type { CoreConfig } from './types.js';
import {
  splitTile as splitTileOp,
  deleteTile as deleteTileOp,
  insertTile as insertTileOp,
  resizeTile as resizeTileOp,
  clampResize as clampResizeOp,
  insertFullSpanAtSeam as insertFullSpanOp,
  insertAtContainerEdge as insertAtContainerEdgeOp,
  resizeSeam as resizeSeamOp,
} from './operations.js';
import { clampSeamDelta as coreClampSeamDelta } from '../seams/clamp.js';
import { ConfigManager } from '../config/ConfigManager.js';
import type { ConfigManagerOptions, ConfigPersistenceAdapter } from '../config/types.js';

/**
 * Main orchestrator for dashboard layout operations.
 *
 * DashboardModel provides a high-level API for managing tile layouts,
 * including splitting, deleting, inserting, and resizing tiles.
 * All operations are validated through a decision engine and support undo/redo.
 *
 * @example
 * ```typescript
 * const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
 * await model.initialize();
 *
 * // Split the first tile vertically
 * const tiles = model.getState().toArray();
 * await model.splitTile(tiles[0].id, { orientation: 'vertical', ratio: 0.5 });
 *
 * // Subscribe to changes
 * model.subscribe(({ state }) => {
 *   console.log('Tiles:', state.toArray().length);
 * });
 * ```
 */
export class DashboardModel implements ModelContext {
  private state: DashboardState = new DashboardState({
    tiles: [new Tile({ id: 'tile-0' as TileId, x: 0, y: 0, width: 100, height: 100 })],
  });
  /** Strategy registry for customizing resize, split, and delete behaviors */
  readonly strategies = new StrategyRegistry();
  readonly constraints = new GraphRegistry();
  private readonly engine = new DecisionEngine(this.constraints);
  private idSeq = 1;
  private readonly config: CoreConfig;
  private readonly history = new HistoryManager();
  /** Lifecycle manager for subscribing to tile operation events */
  readonly lifecycle = new LifecycleManager();
  /** Current interaction state for UI coordination */
  readonly interaction = new InteractionState();
  // State change subscription
  private readonly listeners = new Set<
    (c: { op: ModelOp; state: DashboardState; version: number }) => void
  >();
  private version = 0;

  /** Configuration manager for runtime config changes */
  private _configManager: ConfigManager | null = null;
  private readonly configManagerOptions?: Partial<ConfigManagerOptions>;

  /**
   * Creates a new DashboardModel instance.
   * @param config - Configuration options for the model
   * @param config.minTile - Minimum tile dimensions (default: { width: 5, height: 5 })
   * @param config.epsilon - Floating point tolerance (default: 1e-6)
   * @param configManagerOptions - Options for the ConfigManager (optional)
   */
  constructor(
    config?: Partial<CoreConfig>,
    configManagerOptions?: {
      dashboardId?: string;
      adapter?: ConfigPersistenceAdapter;
      autoSave?: boolean;
    },
  ) {
    this.config = {
      minTile: { width: 5, height: 5 },
      epsilon: 1e-6,
      useSeamCore: true,
      ...config,
    } as CoreConfig;
    this.configManagerOptions = configManagerOptions;
    // Register default strategies
    this.strategies.registerDelete(new HeuristicDeleteStrategy());
    this.strategies.registerResize(new LinearResizeStrategy());
    this.registerDefaultGraphs();
    
    // Wire up history record callback to emit lifecycle event
    this.history.setOnRecord((state, canUndo, canRedo) => {
      void this.lifecycle.emit('history:record', {
        state,
        canUndo,
        canRedo,
      });
    });
  }

  getConfig(): CoreConfig {
    return this.config;
  }

  setState(state: DashboardState): void {
    this.state = state;
    // Keep ConfigManager in sync with state changes
    if (this._configManager) {
      this._configManager.setDashboardState(state);
    }
  }

  /**
   * Get the configuration manager for runtime config changes.
   * Creates a new ConfigManager on first access (lazy initialization).
   *
   * @param dashboardId - Optional dashboard ID (defaults to 'default')
   * @returns The ConfigManager instance
   *
   * @example
   * ```typescript
   * const configManager = model.getConfigManager('my-dashboard');
   *
   * // Update minimum tile size
   * await configManager.setConfig({ minTile: { width: 10, height: 10 } });
   *
   * // Preview changes before committing
   * configManager.startPreview({ gutter: 4 });
   * // ... show preview ...
   * await configManager.commitPreview();
   * ```
   */
  getConfigManager(dashboardId?: string): ConfigManager {
    if (!this._configManager) {
      this._configManager = new ConfigManager({
        dashboardId: dashboardId ?? this.configManagerOptions?.dashboardId ?? 'default',
        initialConfig: {
          minTile: this.config.minTile,
          maxTiles: this.config.maxTiles,
          epsilon: this.config.epsilon,
        },
        adapter: this.configManagerOptions?.adapter,
        autoSave: this.configManagerOptions?.autoSave,
      });

      // Initialize with current state
      this._configManager.setDashboardState(this.state);

      // Listen for config changes and update core config
      this._configManager.on('didChange', ({ newConfig }) => {
        // Update the core config with new values
        (this.config as CoreConfig).minTile = newConfig.minTile;
        if (newConfig.maxTiles !== undefined) {
          (this.config as CoreConfig).maxTiles = newConfig.maxTiles;
        }
        if (newConfig.epsilon !== undefined) {
          (this.config as CoreConfig).epsilon = newConfig.epsilon;
        }
      });
    }

    return this._configManager;
  }

  /**
   * Check if a ConfigManager has been initialized.
   */
  hasConfigManager(): boolean {
    return this._configManager !== null;
  }

  generateTileId(): TileId {
    return `tile-${this.idSeq++}` as TileId;
  }

  getHistory(): HistoryManager {
    return this.history;
  }

  getLifecycle(): LifecycleManager {
    return this.lifecycle;
  }

  getEngine(): DecisionEngine {
    return this.engine;
  }

  getStrategies(): StrategyRegistry {
    return this.strategies;
  }

  makeDecisionContext<P>(op: string, params: P) {
    return { state: this.state, op: op as any, params, config: this.config };
  }

  makeValidationContext() {
    return this.makeDecisionContext('validate', {} as Record<string, never>);
  }

  /**
   * Subscribe to state changes.
   * @param listener - Callback invoked on each state change
   * @returns Unsubscribe function
   * @example
   * ```typescript
   * const unsubscribe = model.subscribe(({ state, op }) => {
   *   console.log(`Operation ${op} resulted in ${state.toArray().length} tiles`);
   * });
   * // Later: unsubscribe();
   * ```
   */
  subscribe(
    listener: (c: { op: ModelOp; state: DashboardState; version: number }) => void,
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(op: ModelOp): void {
    const payload = { op, state: this.state, version: ++this.version };
    for (const l of this.listeners) l(payload);
  }

  /**
   * Initialize the dashboard with an optional layout.
   * @param opts - Initialization options
   * @param opts.layout - Initial tile layout (defaults to single full-screen tile)
   * @example
   * ```typescript
   * // Initialize with default single tile
   * await model.initialize();
   *
   * // Initialize with custom layout
   * await model.initialize({
   *   layout: {
   *     tiles: [
   *       { id: 'left', x: 0, y: 0, width: 50, height: 100 },
   *       { id: 'right', x: 50, y: 0, width: 50, height: 100 }
   *     ]
   *   }
   * });
   * ```
   */
  async initialize(opts?: {
    layout?: {
      tiles: Array<Pick<Tile, 'id' | 'x' | 'y' | 'width' | 'height' | 'locked' | 'meta'>>;
    };
  }): Promise<void> {
    if (opts?.layout) {
      const tiles = opts.layout.tiles.map((t) => new Tile(t as any));
      this.state = new DashboardState({ tiles });
      
      // Update idSeq to avoid collisions with existing tile IDs
      let maxId = 0;
      for (const t of opts.layout.tiles) {
        const match = String(t.id).match(/^tile-(\d+)$/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxId) maxId = num;
        }
      }
      this.idSeq = maxId + 1;
      
      this.history.clear();
      this.history.record(this.state);
      this.notify('initialize');
      return;
    }
    // default: single full-screen tile
    this.state = new DashboardState({
      tiles: [new Tile({ id: this.generateTileId(), x: 0, y: 0, width: 100, height: 100 })],
    });
    this.history.clear();
    this.history.record(this.state);
    this.notify('initialize');
  }

  /**
   * Get the current dashboard state.
   * @returns The current immutable DashboardState
   */
  getState(): DashboardState {
    return this.state;
  }

  /**
   * Create a serializable snapshot of the current state.
   * Use with `restoreSnapshot()` for persistence.
   * @param options - Optional settings for snapshot creation
   * @param options.includeSettings - Include dashboard settings in snapshot (creates V2)
   * @param options.includeConstraints - Include per-tile constraints in snapshot (creates V2)
   * @returns A snapshot object that can be serialized to JSON (V1 or V2 based on options)
   */
  createSnapshot(options?: { includeSettings?: boolean; includeConstraints?: boolean }) {
    const tiles = this.state.toArray();
    
    // If no V2 features requested, return V1 for backwards compatibility
    if (!options?.includeSettings && !options?.includeConstraints) {
      return {
        version: 1 as const,
        tiles: tiles.map(({ id, x, y, width, height, locked, meta }) => ({
          id,
          x,
          y,
          width,
          height,
          locked,
          meta,
        })),
      };
    }

    // Create V2 snapshot
    const tileConstraints = this._configManager?.getAllTileConstraints();
    
    return {
      version: 2 as const,
      tiles: tiles.map(({ id, x, y, width, height, locked, meta }) => ({
        id,
        x,
        y,
        width,
        height,
        locked,
        meta,
        ...(options.includeConstraints && tileConstraints?.get(id)
          ? { constraints: tileConstraints.get(id) }
          : {}),
      })),
      ...(options.includeSettings && this._configManager
        ? { settings: this._configManager.getConfig() }
        : {}),
    };
  }

  /**
   * Restore state from a previously created snapshot.
   * Auto-detects V1 vs V2 format.
   * @param s - The snapshot to restore
   */
  restoreSnapshot(s: {
    version: 1 | 2;
    tiles: Array<Pick<Tile, 'id' | 'x' | 'y' | 'width' | 'height' | 'locked' | 'meta'> & { constraints?: any }>;
    settings?: any;
  }): void {
    const tiles = s.tiles.map((t) => new Tile(t as any));
    this.state = new DashboardState({ tiles });
    
    // Update idSeq to avoid collisions with existing tile IDs
    let maxId = 0;
    for (const t of s.tiles) {
      const match = String(t.id).match(/^tile-(\d+)$/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    }
    this.idSeq = maxId + 1;
    
    // Handle V2 features
    if (s.version === 2) {
      // Restore per-tile constraints if present
      if (this._configManager) {
        for (const t of s.tiles) {
          if (t.constraints) {
            this._configManager.setTileConstraints(t.id, t.constraints);
          }
        }
        
        // Restore settings if present
        if (s.settings) {
          void this._configManager.setConfig(s.settings);
        }
      }
    }
    
    this.notify('restore');
  }

  /**
   * Update a tile's properties (meta, locked, constraints).
   * This method records the change in history for undo/redo support.
   * 
   * @param tileId - ID of the tile to update
   * @param patch - Properties to update (meta, locked, constraints)
   * @returns The updated tile
   * @throws Error if tile is not found
   * 
   * @example
   * ```typescript
   * // Update tile metadata
   * await model.updateTile(tileId, {
   *   meta: { widgetType: 'markdown', contentRef: 'notes/todo.md' }
   * });
   * 
   * // Lock a tile
   * await model.updateTile(tileId, { locked: true });
   * ```
   */
  async updateTile(
    tileId: TileId,
    patch: Partial<Pick<Tile, 'meta' | 'locked' | 'constraints'>>,
  ): Promise<Tile> {
    const tile = this.state.tiles.get(tileId);
    if (!tile) {
      throw new Error(`Tile ${tileId} not found`);
    }

    // Create updated tile
    const updatedTile = tile.with(patch);

    // Create new state with the updated tile
    const newTiles = Array.from(this.state.tiles.values()).map((t) =>
      t.id === tileId ? updatedTile : t,
    );
    this.state = new DashboardState({ tiles: newTiles, groups: this.state.groups });

    // Record in history
    this.history.record(this.state);

    // Notify listeners
    this.notify('updateTile');

    // Emit lifecycle event
    void this.lifecycle.emit('tile:updated', {
      tileId,
      patch,
      tile: updatedTile,
    });

    return updatedTile;
  }

  /**
   * Split a tile into two tiles.
   * @param tileId - ID of the tile to split
   * @param p - Split parameters
   * @param p.orientation - Direction of the split ('horizontal' or 'vertical')
   * @param p.ratio - Split ratio (default: 0.5)
   * @returns Decision result with validation status
   */
  async splitTile(
    tileId: TileId,
    p: { orientation: 'horizontal' | 'vertical'; ratio?: number },
  ): Promise<DecisionResult> {
    return splitTileOp(this, tileId, p);
  }

  /**
   * Delete a tile from the dashboard.
   * Adjacent tiles will expand to fill the space.
   * @param tileId - ID of the tile to delete
   * @returns Decision result with validation status
   */
  async deleteTile(tileId: TileId): Promise<DecisionResult> {
    return deleteTileOp(this, tileId);
  }

  /**
   * Insert a new tile adjacent to an existing tile.
   * @param refId - ID of the reference tile
   * @param p - Insert parameters
   * @param p.side - Which side to insert on ('left', 'right', 'top', 'bottom')
   * @param p.size - Size of the new tile as ratio (default: 0.5)
   * @returns Decision result with validation status
   */
  async insertTile(
    refId: TileId,
    p: { side: 'left' | 'right' | 'top' | 'bottom'; size?: number },
  ): Promise<DecisionResult> {
    return insertTileOp(this, refId, p);
  }

  /**
   * Resize a tile by moving one of its edges.
   * @param tileId - ID of the tile to resize
   * @param p - Resize parameters
   * @param p.edge - Which edge to move ('left', 'right', 'top', 'bottom')
   * @param p.delta - Amount to move the edge (positive = expand, negative = shrink)
   * @param p.skipHistory - If true, don't record this resize in history (for batched drag operations)
   * @returns Decision result with validation status
   */
  async resizeTile(
    tileId: TileId,
    p: { edge: 'left' | 'right' | 'top' | 'bottom'; delta: number; skipHistory?: boolean },
  ): Promise<DecisionResult> {
    return resizeTileOp(this, tileId, p);
  }

  /**
   * Record the current state in history.
   * Call this after a series of skipHistory operations to create a single undo point.
   */
  recordHistory(): void {
    this.history.record(this.state);
  }

  /**
   * Compute clamped delta for a resize without applying it.
   * Useful for UI feedback during drag operations.
   * @param tileId - ID of the tile to resize
   * @param p - Resize parameters
   * @returns Clamped delta info including min/max bounds
   */
  clampResize(tileId: TileId, p: { edge: 'left' | 'right' | 'top' | 'bottom'; delta: number }) {
    return clampResizeOp(this, tileId, p);
  }

  getSeamRange(tileId: TileId, edge: 'left' | 'right' | 'top' | 'bottom') {
    return this.clampResize(tileId, { edge, delta: 0 });
  }

  private require(id: TileId): Tile {
    const t = this.state.tiles.get(id);
    if (!t) throw new Error(`Tile ${id} not found`);
    return t;
  }

  private makeInteractionCtx<P>(op: any, params: P) {
    return {
      state: this.state,
      op,
      params,
      config: { ...this.config, model: this, interaction: this.interaction },
    } as const;
  }

  // Interaction API
  async interactionHoverEdge(p: {
    edgeId: string;
    pointer: { xPct: number; yPct: number };
    fromTileId?: TileId;
  }): Promise<void> {
    await this.engine.evaluate(
      'interaction:hoverEdge',
      this.makeInteractionCtx('interaction:hoverEdge', p),
    );
  }

  async interactionKeyTab(): Promise<void> {
    await this.engine.evaluate(
      'interaction:keyTab',
      this.makeInteractionCtx('interaction:keyTab', {}),
    );
  }

  async interactionCommit(): Promise<void> {
    await this.engine.evaluate(
      'interaction:commit',
      this.makeInteractionCtx('interaction:commit', {}),
    );
  }

  async interactionHoverEnd(): Promise<void> {
    await this.engine.evaluate(
      'interaction:hoverEnd',
      this.makeInteractionCtx('interaction:hoverEnd', {}),
    );
  }

  private registerDefaultGraphs() {
    this.constraints.register('split', new SequenceNode([TileExists(), NotLocked()]));
    this.constraints.register(
      'delete',
      new SequenceNode([
        TileExists(),
        NotLocked(),
        NotOnlyTile(),
        GroupPolicyAllowsDelete(),
        FullSpanSeamAvailable(),
        ResizableNeighborAvailable(),
      ]),
    );
    this.constraints.register('insert', new SequenceNode([TileExists(), NotLocked()]));
    this.constraints.register('resize', new SequenceNode([TileExists(), NotLocked()]));
    this.constraints.register(
      'validate',
      new SequenceNode([BoundsValid(), CoverageTight(), MinTileSizeAll()]),
    );
    this.constraints.register('seam:resize', new SequenceNode([SeamChainCovered()]));
    // Interaction graphs
    this.constraints.register('interaction:hoverEdge', HoverEdgeGraph());
    this.constraints.register('interaction:keyTab', KeyTabGraph());
    this.constraints.register('interaction:commit', CommitGraph());
    this.constraints.register('interaction:hoverEnd', HoverEndGraph());
  }

  async insertFullSpanAtSeam(p: {
    orientation: 'vertical' | 'horizontal';
    seamCoord: number;
    side: 'left' | 'right' | 'top' | 'bottom';
    size?: number;
  }): Promise<DecisionResult> {
    return insertFullSpanOp(this, p);
  }
  async insertAtContainerEdge(p: {
    side: 'left' | 'right' | 'top' | 'bottom';
    size?: number;
  }): Promise<DecisionResult> {
    return insertAtContainerEdgeOp(this, p);
  }

  undo(): void {
    if (!this.history.canUndo()) return;
    this.state = this.history.undo();
    this.notify('undo');
    // Emit lifecycle event
    void this.lifecycle.emit('history:undo', {
      state: this.state,
      canUndo: this.history.canUndo(),
      canRedo: this.history.canRedo(),
    });
  }
  redo(): void {
    if (!this.history.canRedo()) return;
    this.state = this.history.redo();
    this.notify('redo');
    // Emit lifecycle event
    void this.lifecycle.emit('history:redo', {
      state: this.state,
      canUndo: this.history.canUndo(),
      canRedo: this.history.canRedo(),
    });
  }
  canUndo(): boolean {
    return this.history.canUndo();
  }
  canRedo(): boolean {
    return this.history.canRedo();
  }
  // Seam helpers
  clampSeam(seamId: string, delta: number, opts?: { span?: [number, number] }): SeamClamp {
    return coreClampSeamDelta(this.state, seamId, delta, {
      minTile: this.config.minTile,
      epsilon: this.config.epsilon,
      span: opts?.span,
    });
  }
  async resizeSeam(
    seamId: string,
    delta: number,
    opts?: { span?: [number, number] },
  ): Promise<SeamResizeResult> {
    return resizeSeamOp(this, seamId, delta, opts);
  }
}

export interface SeamClamp {
  clampedDelta: number;
  min: number;
  max: number;
  chainCovered: boolean;
}
export type SeamResizeResult = DecisionResult;
