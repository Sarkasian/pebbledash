import { describe, it, expect } from 'vitest';
import { PluginManager } from '../../../../packages/core/src/plugins/PluginManager';
import { Plugin } from '../../../../packages/core/src/plugins/Plugin';

class TestPlugin extends Plugin {
  initializeCalls: unknown[] = [];
  cleanupCalled = false;

  override initialize(model: unknown): void {
    this.initializeCalls.push(model);
  }

  override cleanup(): void {
    this.cleanupCalled = true;
  }
}

describe('PluginManager', () => {
  describe('register', () => {
    it('registers a plugin', () => {
      const model = { name: 'test-model' };
      const manager = new PluginManager(model);
      const plugin = new TestPlugin('test', '1.0.0');

      manager.register(plugin);
      // Plugin is registered, verify by calling initializeAll
      manager.initializeAll();
      expect(plugin.initializeCalls).toHaveLength(1);
    });

    it('can register multiple plugins', () => {
      const model = { name: 'test-model' };
      const manager = new PluginManager(model);
      const plugin1 = new TestPlugin('plugin-1', '1.0.0');
      const plugin2 = new TestPlugin('plugin-2', '2.0.0');

      manager.register(plugin1);
      manager.register(plugin2);

      manager.initializeAll();
      expect(plugin1.initializeCalls).toHaveLength(1);
      expect(plugin2.initializeCalls).toHaveLength(1);
    });
  });

  describe('initializeAll', () => {
    it('initializes all registered plugins with the model', () => {
      const model = { name: 'test-model' };
      const manager = new PluginManager(model);
      const plugin1 = new TestPlugin('plugin-1', '1.0.0');
      const plugin2 = new TestPlugin('plugin-2', '2.0.0');

      manager.register(plugin1);
      manager.register(plugin2);
      manager.initializeAll();

      expect(plugin1.initializeCalls).toEqual([model]);
      expect(plugin2.initializeCalls).toEqual([model]);
    });

    it('does nothing if no plugins are registered', () => {
      const model = { name: 'test-model' };
      const manager = new PluginManager(model);

      expect(() => manager.initializeAll()).not.toThrow();
    });
  });

  describe('cleanupAll', () => {
    it('calls cleanup on all registered plugins', () => {
      const model = { name: 'test-model' };
      const manager = new PluginManager(model);
      const plugin1 = new TestPlugin('plugin-1', '1.0.0');
      const plugin2 = new TestPlugin('plugin-2', '2.0.0');

      manager.register(plugin1);
      manager.register(plugin2);
      manager.cleanupAll();

      expect(plugin1.cleanupCalled).toBe(true);
      expect(plugin2.cleanupCalled).toBe(true);
    });

    it('does nothing if no plugins are registered', () => {
      const model = { name: 'test-model' };
      const manager = new PluginManager(model);

      expect(() => manager.cleanupAll()).not.toThrow();
    });
  });
});
