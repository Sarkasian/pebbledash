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

  constructor(container: HTMLElement, model: DashboardModel) {
    this.container = container;
    this.model = model;
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

    // Create overlay container
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.className = 'ud-config-preview-overlay';
    this.overlayContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 100;
    `;
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

      // Create tile overlay container
      const tileOverlay = document.createElement('div');
      tileOverlay.className = 'ud-config-preview-tile';
      tileOverlay.dataset.tileId = tile.id;
      tileOverlay.style.cssText = `
        position: absolute;
        left: ${tile.x}%;
        top: ${tile.y}%;
        width: ${tile.width}%;
        height: ${tile.height}%;
        box-sizing: border-box;
        overflow: visible;
      `;

      // Add affected tile highlight
      if (isAffected) {
        const highlight = document.createElement('div');
        highlight.className = 'ud-config-preview-highlight';
        highlight.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 100, 100, 0.2);
          border: 2px dashed #ff4444;
          box-sizing: border-box;
        `;
        tileOverlay.appendChild(highlight);

        // Add warning indicator
        const indicator = document.createElement('div');
        indicator.className = 'ud-config-preview-indicator';
        indicator.style.cssText = `
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          background: #ff4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
        `;
        indicator.textContent = '!';
        tileOverlay.appendChild(indicator);
      }

      // Render constraint boundaries
      this.renderConstraintBoundaries(tileOverlay, tile, constraints);

      this.overlayContainer.appendChild(tileOverlay);
    }
  }

  private renderConstraintBoundaries(
    tileOverlay: HTMLElement,
    tile: { x: number; y: number; width: number; height: number },
    constraints?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number },
  ): void {
    if (!this.previewConfig) return;

    const minWidth = getEffectiveMinWidth(this.previewConfig, constraints?.minWidth);
    const minHeight = getEffectiveMinHeight(this.previewConfig, constraints?.minHeight);
    const maxWidth = getEffectiveMaxWidth(this.previewConfig, constraints?.maxWidth);
    const maxHeight = getEffectiveMaxHeight(this.previewConfig, constraints?.maxHeight);

    // Calculate if tile violates min constraints
    const violatesMinWidth = tile.width < minWidth;
    const violatesMinHeight = tile.height < minHeight;
    const violatesMin = violatesMinWidth || violatesMinHeight;

    // Render minimum size rectangle outline (two-layer visualization)
    // This rectangle shows the required minimum dimensions anchored at top-left
    if (minWidth > 0 || minHeight > 0) {
      const minSizeRect = document.createElement('div');
      minSizeRect.className = 'ud-config-preview-boundary ud-min-size-rect';

      // Calculate dimensions as percentage of tile size
      // For violating tiles, this will be > 100%, extending beyond the tile
      const rectWidthPct = (minWidth / tile.width) * 100;
      const rectHeightPct = (minHeight / tile.height) * 100;

      // Use red for violating tiles, green for compliant tiles
      const borderColor = violatesMin ? '#f44336' : '#4CAF50';

      minSizeRect.style.position = 'absolute';
      minSizeRect.style.top = '0';
      minSizeRect.style.left = '0';
      minSizeRect.style.width = `${rectWidthPct}%`;
      minSizeRect.style.height = `${rectHeightPct}%`;
      minSizeRect.style.borderWidth = '2px';
      minSizeRect.style.borderStyle = 'dashed';
      minSizeRect.style.borderColor = borderColor;
      minSizeRect.style.boxSizing = 'border-box';
      minSizeRect.style.pointerEvents = 'none';

      tileOverlay.appendChild(minSizeRect);
    }

    // Render max size rectangle outline if tile exceeds max constraints
    const violatesMaxWidth = maxWidth < 100 && tile.width > maxWidth;
    const violatesMaxHeight = maxHeight < 100 && tile.height > maxHeight;

    if (violatesMaxWidth || violatesMaxHeight) {
      const maxSizeRect = document.createElement('div');
      maxSizeRect.className = 'ud-config-preview-boundary ud-max-size-rect';

      // Calculate dimensions as percentage of tile size
      const rectWidthPct = violatesMaxWidth ? (maxWidth / tile.width) * 100 : 100;
      const rectHeightPct = violatesMaxHeight ? (maxHeight / tile.height) * 100 : 100;

      maxSizeRect.style.position = 'absolute';
      maxSizeRect.style.top = '0';
      maxSizeRect.style.left = '0';
      maxSizeRect.style.width = `${rectWidthPct}%`;
      maxSizeRect.style.height = `${rectHeightPct}%`;
      maxSizeRect.style.borderWidth = '2px';
      maxSizeRect.style.borderStyle = 'dashed';
      maxSizeRect.style.borderColor = '#f44336';
      maxSizeRect.style.boxSizing = 'border-box';
      maxSizeRect.style.pointerEvents = 'none';

      tileOverlay.appendChild(maxSizeRect);
    }
  }
}
