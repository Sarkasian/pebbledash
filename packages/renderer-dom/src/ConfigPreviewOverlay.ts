import type {
  DashboardModel,
  TileId,
  ExtendedConfig,
  PartialExtendedConfig,
} from '@pebbledash/core';
import {
  getEffectiveMinWidth,
  getEffectiveMinHeight,
  getEffectiveMaxWidth,
  getEffectiveMaxHeight,
  createConfig,
  getAffectedTiles,
} from '@pebbledash/core';
import { getConfigPreviewStyles } from './styles.js';

export interface ConfigPreviewOptions {
  /** Custom render function for tile preview (return cleanup function) */
  onRenderTilePreview?: (
    tileId: TileId,
    tileElement: HTMLElement,
    status: { isAffected: boolean; violatesMin: boolean; violatesMax: boolean }
  ) => () => void;
  /** Custom colors for the built-in preview */
  previewColors?: {
    affected?: string;
    compliant?: string;
    violating?: string;
  };
}

/**
 * Configuration preview overlay that shows:
 * - Semi-transparent overlay on affected tiles
 * - Dashed rectangle outline showing min/max size boundaries
 *   - For tiles meeting constraints: rectangle appears inside the tile (green)
 *   - For tiles violating constraints: rectangle extends beyond tile bounds (red)
 * - Warning indicator on affected tiles
 */
export class ConfigPreviewOverlay {
  private container: HTMLElement;
  private model: DashboardModel;
  private overlayContainer: HTMLElement | null = null;
  private isActive = false;
  private previewConfig: ExtendedConfig | null = null;
  private affectedTiles: TileId[] = [];
  private readonly rootClass: string;
  private readonly options: ConfigPreviewOptions;
  private customCleanups: Array<() => void> = [];

  constructor(
    container: HTMLElement, 
    model: DashboardModel, 
    options: ConfigPreviewOptions = {},
    rootClass: string = 'ud'
  ) {
    this.container = container;
    this.model = model;
    this.options = options;
    this.rootClass = rootClass;
    
    // Inject preview styles
    this.injectStyles();
  }

  /** Inject preview styles if not already present */
  private injectStyles(): void {
    const styleId = `${this.rootClass}-config-preview-styles`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = getConfigPreviewStyles(this.rootClass);
    document.head.appendChild(style);
  }

  /**
   * Start showing the preview overlay for proposed config changes.
   */
  startPreview(proposedConfig: PartialExtendedConfig): void {
    this.cleanup();

    // Create the preview config
    const currentConfig = this.model.hasConfigManager()
      ? this.model.getConfigManager().getConfig()
      : createConfig({
          minTile: this.model.getConfig().minTile,
          maxTiles: this.model.getConfig().maxTiles,
          epsilon: this.model.getConfig().epsilon,
        });

    this.previewConfig = createConfig({ ...currentConfig, ...proposedConfig });

    // Get affected tiles
    const state = this.model.getState();
    this.affectedTiles = getAffectedTiles(
      state,
      this.previewConfig,
      this.model.hasConfigManager()
        ? this.model.getConfigManager().getAllTileConstraints()
        : new Map(),
    );

    // Create overlay container using CSS class
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.className = `${this.rootClass}-config-preview-overlay`;
    this.container.appendChild(this.overlayContainer);

    // Render overlays for all tiles
    this.renderTileOverlays();

    this.isActive = true;
  }

  /**
   * End the preview and remove overlays.
   */
  endPreview(): void {
    this.cleanup();
    this.isActive = false;
    this.previewConfig = null;
    this.affectedTiles = [];
  }

  /**
   * Check if preview is currently active.
   */
  isPreviewActive(): boolean {
    return this.isActive;
  }

  /**
   * Get the list of affected tile IDs.
   */
  getAffectedTiles(): TileId[] {
    return [...this.affectedTiles];
  }

  /**
   * Update the preview with new proposed config.
   */
  updatePreview(proposedConfig: PartialExtendedConfig): void {
    if (this.isActive) {
      this.startPreview(proposedConfig);
    }
  }

  private cleanup(): void {
    // Run custom cleanups
    for (const cleanup of this.customCleanups) {
      try {
        cleanup();
      } catch (e) {
        console.error('Error in preview cleanup:', e);
      }
    }
    this.customCleanups = [];

    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
    }
  }

  private renderTileOverlays(): void {
    if (!this.overlayContainer || !this.previewConfig) return;

    const state = this.model.getState();
    const tiles = state.toArray();
    const tileConstraints = this.model.hasConfigManager()
      ? this.model.getConfigManager().getAllTileConstraints()
      : new Map();

    for (const tile of tiles) {
      const isAffected = this.affectedTiles.includes(tile.id);
      const constraints = tileConstraints.get(tile.id);

      // Calculate violation status
      const minWidth = getEffectiveMinWidth(this.previewConfig, constraints?.minWidth);
      const minHeight = getEffectiveMinHeight(this.previewConfig, constraints?.minHeight);
      const maxWidth = getEffectiveMaxWidth(this.previewConfig, constraints?.maxWidth);
      const maxHeight = getEffectiveMaxHeight(this.previewConfig, constraints?.maxHeight);
      const violatesMin = tile.width < minWidth || tile.height < minHeight;
      const violatesMax = (maxWidth < 100 && tile.width > maxWidth) || 
                          (maxHeight < 100 && tile.height > maxHeight);

      // If custom render function provided, use it
      if (this.options.onRenderTilePreview) {
        // Find the tile element in the DOM
        const tileEl = this.container.querySelector(`[data-tile-id="${tile.id}"]`) as HTMLElement;
        if (tileEl) {
          const cleanup = this.options.onRenderTilePreview(tile.id, tileEl, {
            isAffected,
            violatesMin,
            violatesMax,
          });
          this.customCleanups.push(cleanup);
        }
        continue;
      }

      // Create tile overlay container using CSS classes
      const tileOverlay = document.createElement('div');
      tileOverlay.className = `${this.rootClass}-config-preview-tile`;
      tileOverlay.dataset.tileId = tile.id;
      tileOverlay.style.left = `${tile.x}%`;
      tileOverlay.style.top = `${tile.y}%`;
      tileOverlay.style.width = `${tile.width}%`;
      tileOverlay.style.height = `${tile.height}%`;

      // Add affected tile highlight using CSS classes
      if (isAffected) {
        const highlight = document.createElement('div');
        highlight.className = `${this.rootClass}-config-preview-highlight`;
        
        // Apply custom colors if provided
        if (this.options.previewColors?.affected) {
          highlight.style.background = this.options.previewColors.affected;
        }
        tileOverlay.appendChild(highlight);

        // Add warning indicator
        const indicator = document.createElement('div');
        indicator.className = `${this.rootClass}-config-preview-indicator`;
        indicator.textContent = '!';
        tileOverlay.appendChild(indicator);
      }

      // Render constraint boundaries
      this.renderConstraintBoundaries(tileOverlay, tile, constraints, violatesMin, violatesMax);

      this.overlayContainer.appendChild(tileOverlay);
    }
  }

  private renderConstraintBoundaries(
    tileOverlay: HTMLElement,
    tile: { x: number; y: number; width: number; height: number },
    constraints?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number },
    violatesMin?: boolean,
    _violatesMax?: boolean,
  ): void {
    if (!this.previewConfig) return;

    const minWidth = getEffectiveMinWidth(this.previewConfig, constraints?.minWidth);
    const minHeight = getEffectiveMinHeight(this.previewConfig, constraints?.minHeight);
    const maxWidth = getEffectiveMaxWidth(this.previewConfig, constraints?.maxWidth);
    const maxHeight = getEffectiveMaxHeight(this.previewConfig, constraints?.maxHeight);

    // Render minimum size rectangle outline (two-layer visualization)
    // This rectangle shows the required minimum dimensions anchored at top-left
    if (minWidth > 0 || minHeight > 0) {
      const minSizeRect = document.createElement('div');
      minSizeRect.className = `${this.rootClass}-config-preview-boundary ${this.rootClass}-min-size-rect`;
      
      // Add violating class if needed
      if (violatesMin) {
        minSizeRect.classList.add('violating');
      }

      // Calculate dimensions as percentage of tile size
      // For violating tiles, this will be > 100%, extending beyond the tile
      const rectWidthPct = (minWidth / tile.width) * 100;
      const rectHeightPct = (minHeight / tile.height) * 100;

      minSizeRect.style.top = '0';
      minSizeRect.style.left = '0';
      minSizeRect.style.width = `${rectWidthPct}%`;
      minSizeRect.style.height = `${rectHeightPct}%`;
      
      // Apply custom colors if provided
      if (this.options.previewColors) {
        const color = violatesMin 
          ? this.options.previewColors.violating 
          : this.options.previewColors.compliant;
        if (color) {
          minSizeRect.style.borderColor = color;
        }
      }

      tileOverlay.appendChild(minSizeRect);
    }

    // Render max size rectangle outline if tile exceeds max constraints
    const violatesMaxWidth = maxWidth < 100 && tile.width > maxWidth;
    const violatesMaxHeight = maxHeight < 100 && tile.height > maxHeight;

    if (violatesMaxWidth || violatesMaxHeight) {
      const maxSizeRect = document.createElement('div');
      maxSizeRect.className = `${this.rootClass}-config-preview-boundary ${this.rootClass}-max-size-rect`;

      // Calculate dimensions as percentage of tile size
      const rectWidthPct = violatesMaxWidth ? (maxWidth / tile.width) * 100 : 100;
      const rectHeightPct = violatesMaxHeight ? (maxHeight / tile.height) * 100 : 100;

      maxSizeRect.style.top = '0';
      maxSizeRect.style.left = '0';
      maxSizeRect.style.width = `${rectWidthPct}%`;
      maxSizeRect.style.height = `${rectHeightPct}%`;
      
      // Apply custom colors if provided
      if (this.options.previewColors?.violating) {
        maxSizeRect.style.borderColor = this.options.previewColors.violating;
      }

      tileOverlay.appendChild(maxSizeRect);
    }
  }
}
