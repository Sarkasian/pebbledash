import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConfigManager,
  MemoryConfigAdapter,
  LocalStorageConfigAdapter,
  CallbackConfigAdapter,
  createConfig,
  DEFAULT_CONFIG,
  type TileId,
} from '../../../../packages/core/src/index';

function id(s: string) {
  return s as TileId;
}

describe('ConfigManager', () => {
  describe('initialization', () => {
    it('creates with default config when no initial config provided', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const config = manager.getConfig();

      expect(config.version).toBe(1);
      expect(config.minTile).toEqual({ width: 5, height: 5 });
      expect(config.gutter).toBe(0);
    });

    it('merges initial config with defaults', () => {
      const manager = new ConfigManager({
        dashboardId: 'test',
        initialConfig: {
          minTile: { width: 10, height: 15 },
          gutter: 4,
        },
      });
      const config = manager.getConfig();

      expect(config.minTile).toEqual({ width: 10, height: 15 });
      expect(config.gutter).toBe(4);
      // Should still have defaults for unspecified fields
      expect(config.border).toEqual(DEFAULT_CONFIG.border);
    });
  });

  describe('setConfig', () => {
    it('updates config with partial changes', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      const result = await manager.setConfig({ gutter: 8 });

      expect(result.success).toBe(true);
      expect(manager.getConfig().gutter).toBe(8);
    });

    it('rejects invalid config', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      const result = await manager.setConfig({
        minTile: { width: -5, height: 10 },
      });

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.length).toBeGreaterThan(0);
    });

    it('emits lifecycle events', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const willChangeSpy = vi.fn();
      const didChangeSpy = vi.fn();

      manager.on('willChange', willChangeSpy);
      manager.on('didChange', didChangeSpy);

      await manager.setConfig({ gutter: 4 });

      expect(willChangeSpy).toHaveBeenCalled();
      expect(didChangeSpy).toHaveBeenCalled();
    });
  });

  describe('preview mode', () => {
    it('starts preview with proposed config', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      manager.startPreview({ gutter: 10 });

      expect(manager.isPreviewActive()).toBe(true);
      expect(manager.getPreviewConfig()?.gutter).toBe(10);
      // Active config should reflect preview
      expect(manager.getConfig().gutter).toBe(10);
      // Committed config should be unchanged
      expect(manager.getCommittedConfig().gutter).toBe(0);
    });

    it('reverts preview without applying changes', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      manager.startPreview({ gutter: 10 });
      manager.revertPreview();

      expect(manager.isPreviewActive()).toBe(false);
      expect(manager.getConfig().gutter).toBe(0);
    });

    it('commits preview as new config', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      manager.startPreview({ gutter: 10 });
      const result = await manager.commitPreview();

      expect(result.success).toBe(true);
      expect(manager.isPreviewActive()).toBe(false);
      expect(manager.getConfig().gutter).toBe(10);
      expect(manager.getCommittedConfig().gutter).toBe(10);
    });

    it('emits preview events', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const previewStartSpy = vi.fn();
      const previewEndSpy = vi.fn();

      manager.on('previewStart', previewStartSpy);
      manager.on('previewEnd', previewEndSpy);

      manager.startPreview({ gutter: 10 });
      expect(previewStartSpy).toHaveBeenCalled();

      manager.revertPreview();
      expect(previewEndSpy).toHaveBeenCalled();
    });
  });

  describe('tile constraints', () => {
    it('sets and gets tile constraints', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      manager.setTileConstraints(id('tile-1'), {
        minWidth: 20,
        maxWidth: 80,
      });

      const constraints = manager.getTileConstraints(id('tile-1'));
      expect(constraints?.minWidth).toBe(20);
      expect(constraints?.maxWidth).toBe(80);
    });

    it('clears tile constraints', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      manager.setTileConstraints(id('tile-1'), { minWidth: 20 });
      manager.clearTileConstraints(id('tile-1'));

      expect(manager.getTileConstraints(id('tile-1'))).toBeUndefined();
    });

    it('rejects invalid tile constraints', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      expect(() => {
        manager.setTileConstraints(id('tile-1'), {
          minWidth: 200, // > 100 is invalid
        });
      }).toThrow();
    });
  });

  describe('event subscription', () => {
    it('returns unsubscribe function', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const spy = vi.fn();

      const unsubscribe = manager.on('didChange', spy);
      unsubscribe();

      // Should not be called after unsubscribe
      manager.setConfig({ gutter: 4 });
      expect(spy).not.toHaveBeenCalled();
    });

    it('handles errors in event handlers gracefully', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const errorSpy = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      manager.on('didChange', errorSpy);

      // Should not throw, error should be caught
      await manager.setConfig({ gutter: 4 });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('emits validate event during setConfig', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const validateSpy = vi.fn();

      manager.on('validate', validateSpy);
      await manager.setConfig({ gutter: 4 });

      expect(validateSpy).toHaveBeenCalled();
    });
  });

  describe('getDashboardId', () => {
    it('returns the dashboard ID', () => {
      const manager = new ConfigManager({ dashboardId: 'my-dashboard-123' });
      expect(manager.getDashboardId()).toBe('my-dashboard-123');
    });
  });

  describe('setDashboardState', () => {
    it('sets the dashboard state reference', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const mockState = {
        tiles: new Map(),
        toArray: () => [],
      } as any;

      manager.setDashboardState(mockState);

      // State is used in getAffectedTiles
      const affected = manager.getAffectedTiles({ minTile: { width: 50, height: 50 } });
      expect(affected).toEqual([]);
    });
  });

  describe('validateConfig method', () => {
    it('validates a config object', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const config = createConfig({ gutter: 5 });

      const result = manager.validateConfig(config);

      expect(result.valid).toBe(true);
    });

    it('returns errors for invalid config', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const invalidConfig = { minTile: { width: -10, height: 5 } };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('persistence', () => {
    it('saves config via adapter', async () => {
      const adapter = new MemoryConfigAdapter();
      const manager = new ConfigManager({ dashboardId: 'test', adapter });

      await manager.setConfig({ gutter: 5 });
      await manager.save();

      const loaded = await adapter.load();
      expect(loaded?.gutter).toBe(5);
    });

    it('loads config from adapter', async () => {
      const adapter = new MemoryConfigAdapter();
      const initialConfig = createConfig({ gutter: 7 });
      await adapter.save(initialConfig);

      const manager = new ConfigManager({ dashboardId: 'test', adapter });
      const loaded = await manager.load();

      expect(loaded?.gutter).toBe(7);
      expect(manager.getConfig().gutter).toBe(7);
    });

    it('returns null when no config in adapter', async () => {
      const adapter = new MemoryConfigAdapter();
      const manager = new ConfigManager({ dashboardId: 'test', adapter });

      const loaded = await manager.load();

      expect(loaded).toBeNull();
    });

    it('clears storage via adapter', async () => {
      const adapter = new MemoryConfigAdapter();
      const manager = new ConfigManager({ dashboardId: 'test', adapter });

      await manager.setConfig({ gutter: 5 });
      await manager.save();
      await manager.clearStorage();

      const loaded = await adapter.load();
      expect(loaded).toBeNull();
    });

    it('auto-saves when autoSave is enabled', async () => {
      const adapter = new MemoryConfigAdapter();
      const manager = new ConfigManager({
        dashboardId: 'test',
        adapter,
        autoSave: true,
      });

      await manager.setConfig({ gutter: 5 });

      // Should be auto-saved
      const loaded = await adapter.load();
      expect(loaded?.gutter).toBe(5);
    });
  });

  describe('getAffectedTiles', () => {
    it('returns empty array when no dashboard state', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      const affected = manager.getAffectedTiles({ minTile: { width: 50, height: 50 } });

      expect(affected).toEqual([]);
    });
  });

  describe('preview mode edge cases', () => {
    it('throws when starting preview with invalid config', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      expect(() => {
        manager.startPreview({ minTile: { width: -5, height: 10 } });
      }).toThrow('Invalid preview config');
    });

    it('returns error when committing without active preview', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      const result = await manager.commitPreview();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No preview active');
    });

    it('does nothing when reverting without active preview', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      // Should not throw
      expect(() => manager.revertPreview()).not.toThrow();
    });

    it('emits commit event on commitPreview', async () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const commitSpy = vi.fn();

      manager.on('commit', commitSpy);
      manager.startPreview({ gutter: 10 });
      await manager.commitPreview();

      expect(commitSpy).toHaveBeenCalled();
    });

    it('emits revert event on revertPreview', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });
      const revertSpy = vi.fn();

      manager.on('revert', revertSpy);
      manager.startPreview({ gutter: 10 });
      manager.revertPreview();

      expect(revertSpy).toHaveBeenCalled();
    });
  });

  describe('getAllTileConstraints', () => {
    it('returns a copy of all tile constraints', () => {
      const manager = new ConfigManager({ dashboardId: 'test' });

      manager.setTileConstraints(id('tile-1'), { minWidth: 20 });
      manager.setTileConstraints(id('tile-2'), { maxWidth: 80 });

      const all = manager.getAllTileConstraints();

      expect(all.size).toBe(2);
      expect(all.get(id('tile-1'))?.minWidth).toBe(20);
      expect(all.get(id('tile-2'))?.maxWidth).toBe(80);

      // Should be a copy
      all.delete(id('tile-1'));
      expect(manager.getTileConstraints(id('tile-1'))).toBeDefined();
    });
  });
});

describe('MemoryConfigAdapter', () => {
  it('stores and retrieves config', async () => {
    const adapter = new MemoryConfigAdapter();
    const config = createConfig({ gutter: 5 });

    await adapter.save(config);
    const loaded = await adapter.load();

    expect(loaded?.gutter).toBe(5);
  });

  it('returns null when no config stored', async () => {
    const adapter = new MemoryConfigAdapter();
    const loaded = await adapter.load();

    expect(loaded).toBeNull();
  });

  it('clears stored config', async () => {
    const adapter = new MemoryConfigAdapter();
    const config = createConfig();

    await adapter.save(config);
    await adapter.clear();
    const loaded = await adapter.load();

    expect(loaded).toBeNull();
  });
});

describe('CallbackConfigAdapter', () => {
  it('calls onLoad callback', async () => {
    const mockConfig = createConfig({ gutter: 7 });
    const onLoad = vi.fn().mockResolvedValue(mockConfig);
    const onSave = vi.fn();

    const adapter = new CallbackConfigAdapter({ onLoad, onSave });
    const loaded = await adapter.load();

    expect(onLoad).toHaveBeenCalled();
    expect(loaded?.gutter).toBe(7);
  });

  it('calls onSave callback', async () => {
    const onLoad = vi.fn().mockResolvedValue(null);
    const onSave = vi.fn();

    const adapter = new CallbackConfigAdapter({ onLoad, onSave });
    const config = createConfig();
    await adapter.save(config);

    expect(onSave).toHaveBeenCalledWith(config);
  });

  it('returns null when onLoad returns null', async () => {
    const onLoad = vi.fn().mockResolvedValue(null);
    const onSave = vi.fn();

    const adapter = new CallbackConfigAdapter({ onLoad, onSave });
    const loaded = await adapter.load();

    expect(loaded).toBeNull();
  });
});

describe('LocalStorageConfigAdapter', () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  it('saves and loads config from localStorage', async () => {
    const adapter = new LocalStorageConfigAdapter({ dashboardId: 'test' });
    const config = createConfig({ gutter: 3 });

    await adapter.save(config);
    const loaded = await adapter.load();

    expect(loaded?.gutter).toBe(3);
  });

  it('uses namespaced storage key', async () => {
    const adapter = new LocalStorageConfigAdapter({
      dashboardId: 'my-dashboard',
      keyPrefix: 'app-config',
    });

    expect(adapter.getStorageKey()).toBe('app-config-my-dashboard');
  });

  it('returns null when no config in localStorage', async () => {
    const adapter = new LocalStorageConfigAdapter({ dashboardId: 'empty' });
    const loaded = await adapter.load();

    expect(loaded).toBeNull();
  });
});
