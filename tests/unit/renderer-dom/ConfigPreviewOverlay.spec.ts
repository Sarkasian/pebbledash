import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigPreviewOverlay } from '../../../packages/renderer-dom/src/ConfigPreviewOverlay';
import type { DashboardModel, TileId } from '@pebbledash/core';
import { DashboardState, Tile, createConfig } from '@pebbledash/core';

function id(s: string): TileId {
  return s as TileId;
}

function createTile(tileId: string, x: number, y: number, width: number, height: number): Tile {
  return new Tile({ id: id(tileId), x, y, width, height });
}

function createState(tiles: Tile[]): DashboardState {
  return new DashboardState({ tiles });
}

function createMockModel(
  options: {
    tiles?: Tile[];
    hasConfigManager?: boolean;
    configManagerConfig?: any;
    tileConstraints?: Map<TileId, any>;
  } = {},
): DashboardModel {
  const tiles = options.tiles || [createTile('t1', 0, 0, 100, 100)];
  const state = createState(tiles);
  const config = createConfig({ minTile: { width: 10, height: 10 } });

  return {
    getState: vi.fn().mockReturnValue(state),
    getConfig: vi.fn().mockReturnValue(config),
    hasConfigManager: vi.fn().mockReturnValue(options.hasConfigManager ?? false),
    getConfigManager: vi.fn().mockReturnValue({
      getConfig: vi.fn().mockReturnValue(options.configManagerConfig || config),
      getAllTileConstraints: vi.fn().mockReturnValue(options.tileConstraints || new Map()),
    }),
  } as unknown as DashboardModel;
}

describe('ConfigPreviewOverlay', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('creates overlay instance', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      expect(overlay).toBeInstanceOf(ConfigPreviewOverlay);
    });

    it('starts with inactive preview', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      expect(overlay.isPreviewActive()).toBe(false);
    });
  });

  describe('startPreview', () => {
    it('creates overlay container', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });

      expect(container.querySelector('.ud-config-preview-overlay')).not.toBeNull();
    });

    it('sets preview as active', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });

      expect(overlay.isPreviewActive()).toBe(true);
    });

    it('creates tile overlays for each tile', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const tileOverlays = container.querySelectorAll('.ud-config-preview-tile');
      expect(tileOverlays).toHaveLength(2);
    });

    it('positions tile overlays correctly', () => {
      const model = createMockModel({
        tiles: [
          createTile('t1', 0, 0, 100, 20), // Top strip
          createTile('t2', 0, 20, 100, 80), // Rest
        ],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const tileOverlay = container.querySelector('.ud-config-preview-tile') as HTMLElement;
      // Check first tile position
      expect(tileOverlay.style.left).toBe('0%');
      expect(tileOverlay.style.top).toBe('0%');
      expect(tileOverlay.style.width).toBe('100%');
      expect(tileOverlay.style.height).toBe('20%');
    });

    it('highlights affected tiles', () => {
      // Create a tile that will be affected (width < new minTile)
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 5, 100), createTile('t2', 5, 0, 95, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      // Set minTile larger than tile's width
      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const highlight = container.querySelector('.ud-config-preview-highlight');
      expect(highlight).not.toBeNull();
    });

    it('adds warning indicator on affected tiles', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 5, 100), createTile('t2', 5, 0, 95, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const indicator = container.querySelector('.ud-config-preview-indicator');
      expect(indicator).not.toBeNull();
      expect(indicator?.textContent).toBe('!');
    });

    it('does not highlight unaffected tiles', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      // Tile is 50% wide, minTile is 10% - should not be affected
      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const highlight = container.querySelector('.ud-config-preview-highlight');
      expect(highlight).toBeNull();
    });

    it('cleans up previous overlay when called again', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });
      overlay.startPreview({ minTile: { width: 20, height: 20 } });

      const overlays = container.querySelectorAll('.ud-config-preview-overlay');
      expect(overlays).toHaveLength(1);
    });
  });

  describe('endPreview', () => {
    it('removes overlay container', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });
      overlay.endPreview();

      expect(container.querySelector('.ud-config-preview-overlay')).toBeNull();
    });

    it('sets preview as inactive', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });
      overlay.endPreview();

      expect(overlay.isPreviewActive()).toBe(false);
    });

    it('clears affected tiles list', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 5, 100), createTile('t2', 5, 0, 95, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });
      expect(overlay.getAffectedTiles()).toHaveLength(1);

      overlay.endPreview();
      expect(overlay.getAffectedTiles()).toHaveLength(0);
    });
  });

  describe('isPreviewActive', () => {
    it('returns false initially', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      expect(overlay.isPreviewActive()).toBe(false);
    });

    it('returns true when preview is active', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });

      expect(overlay.isPreviewActive()).toBe(true);
    });

    it('returns false after endPreview', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });
      overlay.endPreview();

      expect(overlay.isPreviewActive()).toBe(false);
    });
  });

  describe('getAffectedTiles', () => {
    it('returns empty array initially', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      expect(overlay.getAffectedTiles()).toEqual([]);
    });

    it('returns affected tile IDs', () => {
      const model = createMockModel({
        tiles: [
          createTile('t1', 0, 0, 5, 100), // Will be affected (width < 10)
          createTile('t2', 5, 0, 95, 100), // Won't be affected
        ],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const affected = overlay.getAffectedTiles();
      expect(affected).toContain(id('t1'));
      expect(affected).not.toContain(id('t2'));
    });

    it('returns a copy of the affected tiles array', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 5, 100), createTile('t2', 5, 0, 95, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const affected1 = overlay.getAffectedTiles();
      const affected2 = overlay.getAffectedTiles();

      expect(affected1).not.toBe(affected2);
      expect(affected1).toEqual(affected2);
    });
  });

  describe('updatePreview', () => {
    it('does nothing when preview is not active', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.updatePreview({ minTile: { width: 20, height: 20 } });

      expect(container.querySelector('.ud-config-preview-overlay')).toBeNull();
    });

    it('updates preview when active', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 15, 100), createTile('t2', 15, 0, 85, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      // Start with minTile 10 - t1 (15%) is OK
      overlay.startPreview({ minTile: { width: 10, height: 10 } });
      expect(overlay.getAffectedTiles()).toHaveLength(0);

      // Update to minTile 20 - t1 (15%) is now affected
      overlay.updatePreview({ minTile: { width: 20, height: 20 } });
      expect(overlay.getAffectedTiles()).toContain(id('t1'));
    });
  });

  describe('with ConfigManager', () => {
    it('uses config from ConfigManager when available', () => {
      const model = createMockModel({
        hasConfigManager: true,
        configManagerConfig: createConfig({ minTile: { width: 5, height: 5 } }),
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 20 } });

      expect(model.getConfigManager).toHaveBeenCalled();
    });

    it('uses tile constraints from ConfigManager', () => {
      const tileConstraints = new Map<TileId, any>();
      tileConstraints.set(id('t1'), { minWidth: 30 }); // Override: needs 30%, but tile is only 25%

      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 25, 100), createTile('t2', 25, 0, 75, 100)],
        hasConfigManager: true,
        tileConstraints,
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      expect(overlay.getAffectedTiles()).toContain(id('t1'));
    });
  });

  describe('constraint boundaries', () => {
    it('renders min size rectangle for all tiles', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 20, height: 10 } });

      const minSizeRects = container.querySelectorAll('.ud-min-size-rect');
      expect(minSizeRects).toHaveLength(2);
    });

    it('renders min size rectangle with correct dimensions for compliant tile', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      // Tile is 50% wide, minTile is 20% - rectangle should be 40% of tile width (20/50*100)
      overlay.startPreview({ minTile: { width: 20, height: 10 } });

      const minSizeRect = container.querySelector('.ud-min-size-rect') as HTMLElement;
      expect(minSizeRect).not.toBeNull();
      expect(minSizeRect.style.width).toBe('40%');
      expect(minSizeRect.style.height).toBe('10%');
    });

    it('renders min size rectangle extending beyond tile for violating tile', () => {
      const model = createMockModel({
        tiles: [
          createTile('t1', 0, 0, 5, 100), // 5% wide, below 10% minimum
          createTile('t2', 5, 0, 95, 100),
        ],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      // Find the min size rect for the violating tile (t1)
      const tileOverlay = container.querySelector('[data-tile-id="t1"]');
      const minSizeRect = tileOverlay?.querySelector('.ud-min-size-rect') as HTMLElement;
      expect(minSizeRect).not.toBeNull();
      // 10% min / 5% tile width = 200% (extends beyond tile)
      expect(minSizeRect.style.width).toBe('200%');
    });

    it('uses green border for compliant tiles', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const minSizeRect = container.querySelector('.ud-min-size-rect') as HTMLElement;
      // Check that border is dashed and has green color (#4CAF50 = rgb(76, 175, 80))
      expect(minSizeRect.style.borderStyle).toBe('dashed');
      expect(minSizeRect.style.borderColor).toBe('rgb(76, 175, 80)');
    });

    it('uses red border for violating tiles', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 5, 100), createTile('t2', 5, 0, 95, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const tileOverlay = container.querySelector('[data-tile-id="t1"]');
      const minSizeRect = tileOverlay?.querySelector('.ud-min-size-rect') as HTMLElement;
      // Check that border is dashed and has red color (#f44336 = rgb(244, 67, 54))
      expect(minSizeRect.style.borderStyle).toBe('dashed');
      expect(minSizeRect.style.borderColor).toBe('rgb(244, 67, 54)');
    });

    it('renders max size rectangle when tile exceeds max constraints', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 100, 100)],
        hasConfigManager: true,
        tileConstraints: new Map([[id('t1'), { maxWidth: 80, maxHeight: 80 }]]),
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const maxSizeRect = container.querySelector('.ud-max-size-rect') as HTMLElement;
      expect(maxSizeRect).not.toBeNull();
      expect(maxSizeRect.style.width).toBe('80%');
      expect(maxSizeRect.style.height).toBe('80%');
    });

    it('does not render max size rectangle when tile is within limits', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)],
        hasConfigManager: true,
        tileConstraints: new Map([[id('t1'), { maxWidth: 80 }]]),
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const maxSizeRect = container.querySelector('.ud-max-size-rect');
      expect(maxSizeRect).toBeNull();
    });

    it('allows tile overlay overflow for violating tiles', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 5, 100), createTile('t2', 5, 0, 95, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const tileOverlay = container.querySelector('.ud-config-preview-tile') as HTMLElement;
      expect(tileOverlay.style.overflow).toBe('visible');
    });
  });

  describe('overlay styling', () => {
    it('sets correct z-index on overlay container', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const overlayContainer = container.querySelector('.ud-config-preview-overlay') as HTMLElement;
      expect(overlayContainer.style.zIndex).toBe('100');
    });

    it('sets pointer-events to none on overlay container', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const overlayContainer = container.querySelector('.ud-config-preview-overlay') as HTMLElement;
      expect(overlayContainer.style.pointerEvents).toBe('none');
    });

    it('sets tile-id data attribute on tile overlays', () => {
      const model = createMockModel({
        tiles: [createTile('my-tile', 0, 0, 100, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      const tileOverlay = container.querySelector('.ud-config-preview-tile') as HTMLElement;
      expect(tileOverlay.dataset.tileId).toBe('my-tile');
    });
  });

  describe('edge cases', () => {
    it('handles calling endPreview without startPreview', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      // Should not throw
      expect(() => overlay.endPreview()).not.toThrow();
    });

    it('handles updatePreview without startPreview', () => {
      const model = createMockModel();
      const overlay = new ConfigPreviewOverlay(container, model);

      // Should not throw and should not create overlay
      expect(() => overlay.updatePreview({ minTile: { width: 20, height: 20 } })).not.toThrow();
      expect(overlay.isPreviewActive()).toBe(false);
    });

    it('handles minTile at boundary values', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 100, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      // minTile at 100% - rectangle covers entire tile
      overlay.startPreview({ minTile: { width: 100, height: 100 } });

      // Should render min size rectangle at 100% of tile
      const minSizeRect = container.querySelector('.ud-min-size-rect') as HTMLElement;
      expect(minSizeRect).not.toBeNull();
      expect(minSizeRect.style.width).toBe('100%');
      expect(minSizeRect.style.height).toBe('100%');
    });

    it('handles single tile covering entire area', () => {
      const model = createMockModel({
        tiles: [createTile('t1', 0, 0, 100, 100)],
      });
      const overlay = new ConfigPreviewOverlay(container, model);

      overlay.startPreview({ minTile: { width: 10, height: 10 } });

      expect(overlay.isPreviewActive()).toBe(true);
      expect(overlay.getAffectedTiles()).toHaveLength(0);
    });
  });
});
