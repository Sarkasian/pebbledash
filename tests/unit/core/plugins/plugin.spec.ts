import { describe, it, expect } from 'vitest';
import { Plugin } from '../../../../packages/core/src/plugins/Plugin';

class TestPlugin extends Plugin {
  initialized = false;
  cleanedUp = false;

  override initialize(_model: unknown): void {
    this.initialized = true;
  }

  override cleanup(): void {
    this.cleanedUp = true;
  }
}

class NoOpPlugin extends Plugin {
  // Uses default implementations
}

describe('Plugin', () => {
  describe('constructor', () => {
    it('stores name and version', () => {
      const plugin = new TestPlugin('test-plugin', '1.0.0');
      expect(plugin.name).toBe('test-plugin');
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('initialize', () => {
    it('can be overridden to perform initialization', () => {
      const plugin = new TestPlugin('test', '1.0.0');
      expect(plugin.initialized).toBe(false);

      plugin.initialize({});
      expect(plugin.initialized).toBe(true);
    });

    it('has a no-op default implementation', () => {
      const plugin = new NoOpPlugin('noop', '1.0.0');
      expect(() => plugin.initialize({})).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('can be overridden to perform cleanup', () => {
      const plugin = new TestPlugin('test', '1.0.0');
      expect(plugin.cleanedUp).toBe(false);

      plugin.cleanup();
      expect(plugin.cleanedUp).toBe(true);
    });

    it('has a no-op default implementation', () => {
      const plugin = new NoOpPlugin('noop', '1.0.0');
      expect(() => plugin.cleanup()).not.toThrow();
    });
  });
});
