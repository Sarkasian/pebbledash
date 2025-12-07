import { describe, it, expect } from 'vitest';
import { StrategyRegistry, type DeleteStrategy } from '../../../../packages/core/src/index';
import {
  LinearResizeStrategy,
  AutomaticResizeStrategy,
  EqualSplitStrategy,
  RatioSplitStrategy,
} from '../../../../packages/core/src/internal';

// Create a mock delete strategy since HeuristicDeleteStrategy is not exported
class MockDeleteStrategy implements DeleteStrategy {
  readonly key = 'heuristic';
  choose() {
    return undefined;
  }
}

class AnotherDeleteStrategy implements DeleteStrategy {
  readonly key = 'another';
  choose() {
    return undefined;
  }
}

describe('StrategyRegistry', () => {
  describe('resize strategies', () => {
    it('registers and retrieves resize strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerResize(new LinearResizeStrategy());

      reg.setActiveResize('linear');

      expect(reg.getResize().key).toBe('linear');
    });

    it('can register multiple resize strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerResize(new LinearResizeStrategy());
      reg.registerResize(new AutomaticResizeStrategy());

      reg.setActiveResize('linear');
      expect(reg.getResize().key).toBe('linear');

      reg.setActiveResize('automatic');
      expect(reg.getResize().key).toBe('automatic');
    });

    it('throws when setting unknown resize strategy', () => {
      const reg = new StrategyRegistry();

      expect(() => reg.setActiveResize('unknown')).toThrow('Unknown resize strategy unknown');
    });

    it('throws when getting resize without active strategy', () => {
      const reg = new StrategyRegistry();

      expect(() => reg.getResize()).toThrow('No active resize strategy');
    });
  });

  describe('split strategies', () => {
    it('registers and retrieves split strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerSplit(new EqualSplitStrategy());

      reg.setActiveSplit('equal');

      expect(reg.getSplit().key).toBe('equal');
    });

    it('can register multiple split strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerSplit(new EqualSplitStrategy());
      reg.registerSplit(new RatioSplitStrategy());

      reg.setActiveSplit('equal');
      expect(reg.getSplit().key).toBe('equal');

      reg.setActiveSplit('ratio');
      expect(reg.getSplit().key).toBe('ratio');
    });

    it('throws when setting unknown split strategy', () => {
      const reg = new StrategyRegistry();

      expect(() => reg.setActiveSplit('unknown')).toThrow('Unknown split strategy unknown');
    });

    it('throws when getting split without active strategy', () => {
      const reg = new StrategyRegistry();

      expect(() => reg.getSplit()).toThrow('No active split strategy');
    });
  });

  describe('delete strategies', () => {
    it('registers and retrieves delete strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerDelete(new MockDeleteStrategy());

      reg.setActiveDelete('heuristic');

      expect(reg.getDelete().key).toBe('heuristic');
    });

    it('can register multiple delete strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerDelete(new MockDeleteStrategy());
      reg.registerDelete(new AnotherDeleteStrategy());

      reg.setActiveDelete('heuristic');
      expect(reg.getDelete().key).toBe('heuristic');

      reg.setActiveDelete('another');
      expect(reg.getDelete().key).toBe('another');
    });

    it('throws when setting unknown delete strategy', () => {
      const reg = new StrategyRegistry();

      expect(() => reg.setActiveDelete('unknown')).toThrow('Unknown delete strategy unknown');
    });

    it('throws when getting delete without active strategy', () => {
      const reg = new StrategyRegistry();

      expect(() => reg.getDelete()).toThrow('No active delete strategy');
    });
  });

  describe('combined usage', () => {
    it('registers and retrieves all strategy types', () => {
      const reg = new StrategyRegistry();
      reg.registerResize(new LinearResizeStrategy());
      reg.registerResize(new AutomaticResizeStrategy());
      reg.registerSplit(new EqualSplitStrategy());
      reg.registerSplit(new RatioSplitStrategy());
      reg.registerDelete(new MockDeleteStrategy());

      reg.setActiveResize('linear');
      reg.setActiveSplit('equal');
      reg.setActiveDelete('heuristic');

      expect(reg.getResize().key).toBe('linear');
      expect(reg.getSplit().key).toBe('equal');
      expect(reg.getDelete().key).toBe('heuristic');
    });

    it('can switch active strategies', () => {
      const reg = new StrategyRegistry();
      reg.registerResize(new LinearResizeStrategy());
      reg.registerResize(new AutomaticResizeStrategy());
      reg.registerSplit(new EqualSplitStrategy());
      reg.registerSplit(new RatioSplitStrategy());

      // Start with one set
      reg.setActiveResize('linear');
      reg.setActiveSplit('equal');
      expect(reg.getResize().key).toBe('linear');
      expect(reg.getSplit().key).toBe('equal');

      // Switch to another
      reg.setActiveResize('automatic');
      reg.setActiveSplit('ratio');
      expect(reg.getResize().key).toBe('automatic');
      expect(reg.getSplit().key).toBe('ratio');
    });
  });

  describe('strategy overwriting', () => {
    it('overwrites existing strategy with same key', () => {
      const reg = new StrategyRegistry();
      const strat1 = new LinearResizeStrategy();
      const strat2 = new LinearResizeStrategy();

      reg.registerResize(strat1);
      reg.setActiveResize('linear');

      // Register another with same key
      reg.registerResize(strat2);

      // The strategy should be the new one
      const retrieved = reg.getResize();
      expect(retrieved.key).toBe('linear');
    });
  });
});
