import type { TileId } from '../index.js';
import type { DashboardState } from '../entities/DashboardState.js';
import type {
  ExtendedConfig,
  PartialExtendedConfig,
  TileConstraints,
  ConfigPersistenceAdapter,
  ConfigChangeResult,
  ValidationResult,
  ConfigEvent,
  ConfigEventHandler,
  ConfigManagerOptions,
  WillChangePayload,
  DidChangePayload,
  ValidatePayload,
  PreviewPayload,
} from './types.js';
import { createConfig } from './defaults.js';
import { validateConfig, validatePartialConfig, validateTileConstraints } from './validation.js';
import { migrateConfig } from './migrations.js';
import { autoAdjustLayout, getAffectedTiles } from './autoAdjust.js';
import { MemoryConfigAdapter } from './ConfigPersistence.js';

/**
 * ConfigManager handles dashboard configuration with full lifecycle events,
 * validation, persistence, and preview mode support.
 *
 * @example
 * ```typescript
 * const configManager = new ConfigManager({
 *   dashboardId: 'my-dashboard',
 *   initialConfig: { minTile: { width: 10, height: 10 } },
 *   adapter: new LocalStorageConfigAdapter({ dashboardId: 'my-dashboard' }),
 *   autoSave: true
 * });
 *
 * // Subscribe to changes
 * configManager.on('didChange', ({ previousConfig, newConfig }) => {
 *   console.log('Config changed:', newConfig);
 * });
 *
 * // Update config
 * await configManager.setConfig({ minTile: { width: 15, height: 15 } });
 *
 * // Preview mode
 * configManager.startPreview({ gutter: 4 });
 * // ... show preview to user ...
 * await configManager.commitPreview();
 * ```
 */
export class ConfigManager {
  private readonly dashboardId: string;
  private readonly adapter: ConfigPersistenceAdapter;
  private readonly autoSave: boolean;

  private config: ExtendedConfig;
  private previewConfig: ExtendedConfig | null = null;
  private tileConstraints: Map<TileId, TileConstraints> = new Map();

  // Event listeners
  private readonly listeners: Map<ConfigEvent, Set<ConfigEventHandler<unknown>>> = new Map();

  // Reference to dashboard state for auto-adjustment
  private dashboardState: DashboardState | null = null;

  constructor(options: ConfigManagerOptions) {
    this.dashboardId = options.dashboardId;
    this.adapter = options.adapter ?? new MemoryConfigAdapter();
    this.autoSave = options.autoSave ?? false;

    // Initialize with defaults merged with any initial config
    this.config = createConfig(options.initialConfig);
  }

  /**
   * Get the dashboard ID.
   */
  getDashboardId(): string {
    return this.dashboardId;
  }

  /**
   * Set a reference to the dashboard state for auto-adjustment.
   * Called by DashboardModel when integrating the ConfigManager.
   */
  setDashboardState(state: DashboardState): void {
    this.dashboardState = state;
  }

  /**
   * Get the current configuration.
   * Returns preview config if preview is active, otherwise the committed config.
   */
  getConfig(): ExtendedConfig {
    return this.previewConfig ?? this.config;
  }

  /**
   * Get the committed configuration (ignoring any active preview).
   */
  getCommittedConfig(): ExtendedConfig {
    return this.config;
  }

  /**
   * Update the configuration.
   *
   * @param partial - Partial configuration to merge with current config
   * @returns Result of the change operation
   */
  async setConfig(partial: PartialExtendedConfig): Promise<ConfigChangeResult> {
    // Validate the partial config
    const partialValidation = validatePartialConfig(partial);
    if (!partialValidation.valid) {
      return {
        success: false,
        config: this.config,
        error: 'Validation failed',
        validationErrors: partialValidation.errors,
      };
    }

    // Create the new config by merging
    const newConfig = createConfig({ ...this.config, ...partial });

    // Validate the complete config
    const validation = validateConfig(newConfig);
    await this.emit('validate', { config: newConfig, result: validation });

    if (!validation.valid) {
      return {
        success: false,
        config: this.config,
        error: 'Validation failed',
        validationErrors: validation.errors,
      };
    }

    // Emit willChange event
    await this.emit('willChange', {
      currentConfig: this.config,
      proposedChanges: partial,
    });

    const previousConfig = this.config;
    let adjustedTiles: TileId[] = [];

    // Check if layout adjustment is needed
    if (this.dashboardState) {
      const affectedTiles = getAffectedTiles(this.dashboardState, newConfig, this.tileConstraints);

      if (affectedTiles.length > 0) {
        // Try auto-adjustment
        const adjustResult = autoAdjustLayout(this.dashboardState, newConfig, this.tileConstraints);

        if (!adjustResult.success) {
          return {
            success: false,
            config: this.config,
            error: adjustResult.error ?? 'Layout auto-adjustment failed',
            adjustedTiles: [],
          };
        }

        adjustedTiles = adjustResult.adjustedTiles;

        // Update dashboard state if we have a setter
        if (adjustResult.newState) {
          this.dashboardState = adjustResult.newState;
        }
      }
    }

    // Apply the config
    this.config = newConfig;

    // Emit didChange event
    await this.emit('didChange', {
      previousConfig,
      newConfig: this.config,
      adjustedTiles,
    });

    // Auto-save if enabled
    if (this.autoSave) {
      await this.save();
    }

    return {
      success: true,
      config: this.config,
      adjustedTiles,
    };
  }

  /**
   * Validate a configuration object.
   *
   * @param config - The configuration to validate
   * @returns Validation result
   */
  validateConfig(config: unknown): ValidationResult {
    return validateConfig(config);
  }

  // === Preview Mode ===

  /**
   * Start preview mode with proposed configuration changes.
   *
   * @param partial - Partial configuration to preview
   */
  startPreview(partial: PartialExtendedConfig): void {
    // Validate the partial config
    const partialValidation = validatePartialConfig(partial);
    if (!partialValidation.valid) {
      throw new Error(
        `Invalid preview config: ${partialValidation.errors.map((e) => e.message).join(', ')}`,
      );
    }

    // Create preview config
    this.previewConfig = createConfig({ ...this.config, ...partial });

    // Calculate affected tiles
    let affectedTiles: TileId[] = [];
    if (this.dashboardState) {
      affectedTiles = getAffectedTiles(
        this.dashboardState,
        this.previewConfig,
        this.tileConstraints,
      );
    }

    // Emit previewStart event
    this.emit('previewStart', {
      previewConfig: this.previewConfig,
      affectedTiles,
    });
  }

  /**
   * Get the current preview configuration, or null if not in preview mode.
   */
  getPreviewConfig(): ExtendedConfig | null {
    return this.previewConfig;
  }

  /**
   * Check if preview mode is active.
   */
  isPreviewActive(): boolean {
    return this.previewConfig !== null;
  }

  /**
   * Commit the preview configuration as the new config.
   *
   * @returns Result of the commit operation
   */
  async commitPreview(): Promise<ConfigChangeResult> {
    if (!this.previewConfig) {
      return {
        success: false,
        config: this.config,
        error: 'No preview active',
      };
    }

    const previewConfig = this.previewConfig;
    this.previewConfig = null;

    // Apply the preview config as the new config
    const result = await this.setConfig(previewConfig);

    // Emit commit event
    await this.emit('commit', {
      previewConfig: null,
      affectedTiles: result.adjustedTiles ?? [],
    });

    return result;
  }

  /**
   * Revert preview mode and discard proposed changes.
   */
  revertPreview(): void {
    if (!this.previewConfig) {
      return;
    }

    this.previewConfig = null;

    // Emit revert event
    this.emit('revert', {
      previewConfig: null,
      affectedTiles: [],
    });

    // Emit previewEnd event
    this.emit('previewEnd', {
      previewConfig: null,
      affectedTiles: [],
    });
  }

  // === Per-tile Constraints ===

  /**
   * Set constraints for a specific tile.
   *
   * @param tileId - The tile ID
   * @param constraints - The constraints to apply
   */
  setTileConstraints(tileId: TileId, constraints: TileConstraints): void {
    // Validate constraints
    const errors = validateTileConstraints(constraints);
    if (errors.length > 0) {
      throw new Error(`Invalid tile constraints: ${errors.map((e) => e.message).join(', ')}`);
    }

    this.tileConstraints.set(tileId, constraints);
  }

  /**
   * Get constraints for a specific tile.
   *
   * @param tileId - The tile ID
   * @returns The tile's constraints, or undefined if none set
   */
  getTileConstraints(tileId: TileId): TileConstraints | undefined {
    return this.tileConstraints.get(tileId);
  }

  /**
   * Clear constraints for a specific tile.
   *
   * @param tileId - The tile ID
   */
  clearTileConstraints(tileId: TileId): void {
    this.tileConstraints.delete(tileId);
  }

  /**
   * Get all tile constraints.
   */
  getAllTileConstraints(): Map<TileId, TileConstraints> {
    return new Map(this.tileConstraints);
  }

  // === Lifecycle Events ===

  /**
   * Subscribe to a configuration event.
   *
   * @param event - The event type
   * @param handler - The event handler
   * @returns Unsubscribe function
   */
  on<E extends ConfigEvent>(
    event: E,
    handler: ConfigEventHandler<
      E extends 'willChange'
        ? WillChangePayload
        : E extends 'didChange'
          ? DidChangePayload
          : E extends 'validate'
            ? ValidatePayload
            : E extends 'previewStart' | 'previewEnd' | 'commit' | 'revert'
              ? PreviewPayload
              : unknown
    >,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const handlers = this.listeners.get(event)!;
    handlers.add(handler as ConfigEventHandler<unknown>);

    return () => {
      handlers.delete(handler as ConfigEventHandler<unknown>);
    };
  }

  /**
   * Emit an event to all subscribers.
   */
  private async emit<T>(event: ConfigEvent, payload: T): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`ConfigManager: Error in ${event} handler`, error);
      }
    }
  }

  // === Persistence ===

  /**
   * Save the current configuration to the persistence adapter.
   */
  async save(): Promise<void> {
    await this.adapter.save(this.config);
  }

  /**
   * Load configuration from the persistence adapter.
   * Applies migration if needed.
   *
   * @returns The loaded config, or null if no saved config exists
   */
  async load(): Promise<ExtendedConfig | null> {
    const loaded = await this.adapter.load();

    if (!loaded) {
      return null;
    }

    // Migrate if needed
    const migrated = migrateConfig(loaded);

    // Validate
    const validation = validateConfig(migrated);
    if (!validation.valid) {
      console.error('ConfigManager: Loaded config is invalid after migration', validation.errors);
      return null;
    }

    this.config = migrated as ExtendedConfig;
    return this.config;
  }

  /**
   * Clear saved configuration from the persistence adapter.
   */
  async clearStorage(): Promise<void> {
    if (this.adapter.clear) {
      await this.adapter.clear();
    }
  }

  /**
   * Get tiles that would be affected by a config change.
   *
   * @param partial - Proposed config changes
   * @returns Array of affected tile IDs
   */
  getAffectedTiles(partial: PartialExtendedConfig): TileId[] {
    if (!this.dashboardState) {
      return [];
    }

    const newConfig = createConfig({ ...this.config, ...partial });
    return getAffectedTiles(this.dashboardState, newConfig, this.tileConstraints);
  }
}
