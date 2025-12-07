import { describe, it, expect } from 'vitest';
import { DashboardState } from '@pebbledash/core';
import { Tile } from '@pebbledash/core';
import type { TileId } from '@pebbledash/core';
import { EqualSplitStrategy } from '../../../../packages/core/src/strategies/split/EqualSplitStrategy';
import { RatioSplitStrategy } from '../../../../packages/core/src/strategies/split/RatioSplitStrategy';

const asId = (s: string) => s as TileId;

function createFullTileState(): DashboardState {
  const tile = new Tile({ id: asId('tile-0'), x: 0, y: 0, width: 100, height: 100 });
  return new DashboardState({ tiles: [tile] });
}

describe('EqualSplitStrategy', () => {
  const strategy = new EqualSplitStrategy();

  it('has key "equal"', () => {
    expect(strategy.key).toBe('equal');
  });

  it('splits tile vertically into two equal halves', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'vertical');

    const tiles = result.toArray();
    expect(tiles).toHaveLength(2);

    // Check that tiles are 50% each
    const left = tiles.find((t) => t.x === 0);
    const right = tiles.find((t) => t.x === 50);
    expect(left).toBeDefined();
    expect(right).toBeDefined();
    expect(left!.width).toBe(50);
    expect(right!.width).toBe(50);
    expect(left!.height).toBe(100);
    expect(right!.height).toBe(100);
  });

  it('splits tile horizontally into two equal halves', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'horizontal');

    const tiles = result.toArray();
    expect(tiles).toHaveLength(2);

    // Check that tiles are 50% each
    const top = tiles.find((t) => t.y === 0);
    const bottom = tiles.find((t) => t.y === 50);
    expect(top).toBeDefined();
    expect(bottom).toBeDefined();
    expect(top!.height).toBe(50);
    expect(bottom!.height).toBe(50);
    expect(top!.width).toBe(100);
    expect(bottom!.width).toBe(100);
  });

  it('returns unchanged state for non-existent tile', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('nonexistent'), 'vertical');

    expect(result.toArray()).toHaveLength(1);
    expect(result.toArray()[0].id).toBe(asId('tile-0'));
  });

  it('generates correct tile IDs after split', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'vertical');

    const tiles = result.toArray();
    const ids = tiles.map((t) => String(t.id));
    expect(ids).toContain('tile-0-split-a');
    expect(ids).toContain('tile-0-split-b');
  });
});

describe('RatioSplitStrategy', () => {
  const strategy = new RatioSplitStrategy();

  it('has key "ratio"', () => {
    expect(strategy.key).toBe('ratio');
  });

  it('splits tile vertically with custom ratio', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'vertical', 0.3);

    const tiles = result.toArray();
    expect(tiles).toHaveLength(2);

    const left = tiles.find((t) => t.x === 0);
    const right = tiles.find((t) => t.x > 0);
    expect(left).toBeDefined();
    expect(right).toBeDefined();
    expect(left!.width).toBeCloseTo(30, 1);
    expect(right!.width).toBeCloseTo(70, 1);
  });

  it('splits tile horizontally with custom ratio', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'horizontal', 0.7);

    const tiles = result.toArray();
    expect(tiles).toHaveLength(2);

    const top = tiles.find((t) => t.y === 0);
    const bottom = tiles.find((t) => t.y > 0);
    expect(top).toBeDefined();
    expect(bottom).toBeDefined();
    expect(top!.height).toBeCloseTo(70, 1);
    expect(bottom!.height).toBeCloseTo(30, 1);
  });

  it('clamps ratio to minimum 0.05', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'vertical', 0.01);

    const tiles = result.toArray();
    const left = tiles.find((t) => t.x === 0);
    expect(left!.width).toBeCloseTo(5, 1); // 5% of 100
  });

  it('clamps ratio to maximum 0.95', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'vertical', 0.99);

    const tiles = result.toArray();
    const left = tiles.find((t) => t.x === 0);
    expect(left!.width).toBeCloseTo(95, 1); // 95% of 100
  });

  it('uses default ratio 0.5 when not specified', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'vertical');

    const tiles = result.toArray();
    const left = tiles.find((t) => t.x === 0);
    expect(left!.width).toBe(50);
  });

  it('returns unchanged state for non-existent tile', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('nonexistent'), 'vertical', 0.3);

    expect(result.toArray()).toHaveLength(1);
    expect(result.toArray()[0].id).toBe(asId('tile-0'));
  });

  it('generates correct tile IDs after split', () => {
    const state = createFullTileState();
    const result = strategy.compute(state, asId('tile-0'), 'horizontal', 0.6);

    const tiles = result.toArray();
    const ids = tiles.map((t) => String(t.id));
    expect(ids).toContain('tile-0-ratio-a');
    expect(ids).toContain('tile-0-ratio-b');
  });
});
