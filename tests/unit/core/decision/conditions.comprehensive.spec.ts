import { describe, it, expect } from 'vitest';
import {
  DashboardState,
  Tile,
  createConfig,
  type TileId,
} from '../../../../packages/core/src/index';
import { BoundsValid } from '../../../../packages/core/src/decision-engine/conditions/BoundsValid';
import { MaxTileCount } from '../../../../packages/core/src/decision-engine/conditions/MaxTileCount';
import { NotOnlyTile } from '../../../../packages/core/src/decision-engine/conditions/NotOnlyTile';
import { TileExists } from '../../../../packages/core/src/decision-engine/conditions/TileExists';
import { FullSpanSeamAvailable } from '../../../../packages/core/src/decision-engine/conditions/FullSpanSeamAvailable';
import { MinTileSize } from '../../../../packages/core/src/decision-engine/conditions/MinTileSize';
import { NotLocked } from '../../../../packages/core/src/decision-engine/conditions/NotLocked';
import { CoverageTight } from '../../../../packages/core/src/decision-engine/conditions/CoverageTight';
import type { DecisionContext } from '../../../../packages/core/src/decision-engine/types';

function id(s: string): TileId {
  return s as TileId;
}

function createTile(
  tileId: string,
  x: number,
  y: number,
  width: number,
  height: number,
  locked = false,
): Tile {
  return new Tile({ id: id(tileId), x, y, width, height, locked });
}

function createState(tiles: Tile[]): DashboardState {
  return new DashboardState({ tiles });
}

function createContext<P = any>(
  state: DashboardState,
  params: P,
  configOverrides?: any,
): DecisionContext<P> {
  const config = createConfig(configOverrides || {});
  return {
    state,
    op: 'test' as any,
    params,
    config,
  };
}

describe('BoundsValid', () => {
  it('has correct label', () => {
    const condition = BoundsValid();
    expect(condition.label).toBe('BoundsValid');
  });

  it('returns true when all tiles are within bounds', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = BoundsValid();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns true for 2x2 grid within bounds', () => {
    const state = createState([
      createTile('t1', 0, 0, 50, 50),
      createTile('t2', 50, 0, 50, 50),
      createTile('t3', 0, 50, 50, 50),
      createTile('t4', 50, 50, 50, 50),
    ]);
    const ctx = createContext(state, {});

    const condition = BoundsValid();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns error with correct code', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = BoundsValid();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('OutOfBounds');
    expect(error.message).toContain('out of bounds');
  });

  it('evaluate returns valid result when tiles within bounds', async () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = BoundsValid();
    const result = await condition.evaluate(ctx);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});

describe('MaxTileCount', () => {
  it('has correct label', () => {
    const condition = MaxTileCount();
    expect(condition.label).toBe('MaxTileCount');
  });

  it('returns true when no maxTiles configured', () => {
    const state = createState([createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)]);
    const ctx = createContext(state, {});

    const condition = MaxTileCount();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns true when tile count equals maxTiles', () => {
    const state = createState([createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)]);
    const ctx = createContext(state, {}, { maxTiles: 2 });

    const condition = MaxTileCount();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns true when tile count is below maxTiles', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {}, { maxTiles: 5 });

    const condition = MaxTileCount();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns false when tile count exceeds maxTiles', () => {
    const state = createState([
      createTile('t1', 0, 0, 25, 100),
      createTile('t2', 25, 0, 25, 100),
      createTile('t3', 50, 0, 25, 100),
      createTile('t4', 75, 0, 25, 100),
    ]);
    const ctx = createContext(state, {}, { maxTiles: 3 });

    const condition = MaxTileCount();
    expect(condition.predicate(ctx)).toBe(false);
  });

  it('returns error with max tiles count in message', () => {
    const state = createState([createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)]);
    const ctx = createContext(state, {}, { maxTiles: 5 });

    const condition = MaxTileCount();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('MaxTilesExceeded');
    expect(error.message).toContain('5');
  });

  it('evaluate returns invalid result when exceeds maxTiles', async () => {
    const state = createState([
      createTile('t1', 0, 0, 25, 100),
      createTile('t2', 25, 0, 25, 100),
      createTile('t3', 50, 0, 25, 100),
      createTile('t4', 75, 0, 25, 100),
    ]);
    const ctx = createContext(state, {}, { maxTiles: 3 });

    const condition = MaxTileCount();
    const result = await condition.evaluate(ctx);
    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].code).toBe('MaxTilesExceeded');
  });
});

describe('NotOnlyTile', () => {
  it('has correct label', () => {
    const condition = NotOnlyTile();
    expect(condition.label).toBe('NotOnlyTile');
  });

  it('returns true when there are multiple tiles', () => {
    const state = createState([createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)]);
    const ctx = createContext(state, {});

    const condition = NotOnlyTile();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns false when there is only one tile', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = NotOnlyTile();
    expect(condition.predicate(ctx)).toBe(false);
  });

  it('returns true for 4 tiles', () => {
    const state = createState([
      createTile('t1', 0, 0, 50, 50),
      createTile('t2', 50, 0, 50, 50),
      createTile('t3', 0, 50, 50, 50),
      createTile('t4', 50, 50, 50, 50),
    ]);
    const ctx = createContext(state, {});

    const condition = NotOnlyTile();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns error with correct code', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = NotOnlyTile();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('LastTile');
    expect(error.message).toContain('last');
  });

  it('evaluate returns invalid result for single tile', async () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = NotOnlyTile();
    const result = await condition.evaluate(ctx);
    expect(result.valid).toBe(false);
    expect(result.violations[0].code).toBe('LastTile');
  });
});

describe('TileExists', () => {
  it('has correct label', () => {
    const condition = TileExists();
    expect(condition.label).toBe('TileExists');
  });

  it('returns true when tile exists', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = TileExists();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns false when tile does not exist', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('nonexistent') });

    const condition = TileExists();
    expect(condition.predicate(ctx)).toBe(false);
  });

  it('finds tile among multiple tiles', () => {
    const state = createState([createTile('t1', 0, 0, 50, 100), createTile('t2', 50, 0, 50, 100)]);
    const ctx = createContext(state, { tileId: id('t2') });

    const condition = TileExists();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns error with tile ID in message', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('missing-tile') });

    const condition = TileExists();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('TileNotFound');
    expect(error.message).toContain('missing-tile');
  });

  it('evaluate returns invalid result for missing tile', async () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('nonexistent') });

    const condition = TileExists();
    const result = await condition.evaluate(ctx);
    expect(result.valid).toBe(false);
    expect(result.violations[0].code).toBe('TileNotFound');
  });
});

describe('FullSpanSeamAvailable', () => {
  it('has correct label', () => {
    const condition = FullSpanSeamAvailable();
    expect(condition.label).toBe('FullSpanSeamAvailable');
  });

  it('returns error code NoFullSpanCoverage', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = FullSpanSeamAvailable();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('NoFullSpanCoverage');
  });
});

describe('MinTileSize', () => {
  it('has correct label', () => {
    const condition = MinTileSize();
    expect(condition.label).toBe('MinTileSize');
  });

  it('returns true when tile meets minimum size', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') }, { minTile: { width: 10, height: 10 } });

    const condition = MinTileSize();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns true when no minTile configured', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = MinTileSize();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns error code MinSize', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = MinTileSize();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('MinSize');
  });
});

describe('NotLocked', () => {
  it('has correct label', () => {
    const condition = NotLocked();
    expect(condition.label).toBe('NotLocked');
  });

  it('returns true when tile is not locked', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100, false)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = NotLocked();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns false when tile is locked', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100, true)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = NotLocked();
    expect(condition.predicate(ctx)).toBe(false);
  });

  it('returns false when tile does not exist', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('nonexistent') });

    const condition = NotLocked();
    // Tile doesn't exist, predicate returns false
    expect(condition.predicate(ctx)).toBe(false);
  });

  it('returns error code TileLocked', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100, true)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = NotLocked();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('TileLocked');
  });

  it('evaluate returns invalid result for locked tile', async () => {
    const state = createState([createTile('t1', 0, 0, 100, 100, true)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const condition = NotLocked();
    const result = await condition.evaluate(ctx);
    expect(result.valid).toBe(false);
    expect(result.violations[0].code).toBe('TileLocked');
  });
});

describe('CoverageTight', () => {
  it('has correct label', () => {
    const condition = CoverageTight();
    expect(condition.label).toBe('CoverageTight');
  });

  it('returns true when tiles cover container exactly', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = CoverageTight();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns true for 2x2 grid with full coverage', () => {
    const state = createState([
      createTile('t1', 0, 0, 50, 50),
      createTile('t2', 50, 0, 50, 50),
      createTile('t3', 0, 50, 50, 50),
      createTile('t4', 50, 50, 50, 50),
    ]);
    const ctx = createContext(state, {});

    const condition = CoverageTight();
    expect(condition.predicate(ctx)).toBe(true);
  });

  it('returns error code CoverageGap', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const condition = CoverageTight();
    const error = condition.violationFactory(ctx);
    expect(error.code).toBe('CoverageGap');
  });
});

describe('ConditionNode behavior', () => {
  it('conditions return boolean from predicate', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, {});

    const conditions = [BoundsValid(), MaxTileCount(), NotOnlyTile(), CoverageTight()];

    for (const condition of conditions) {
      const result = condition.predicate(ctx);
      expect(typeof result).toBe('boolean');
    }
  });

  it('conditions return error object from violationFactory', () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const conditions = [
      BoundsValid(),
      MaxTileCount(),
      NotOnlyTile(),
      TileExists(),
      CoverageTight(),
    ];

    for (const condition of conditions) {
      const error = condition.violationFactory(ctx);
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(typeof error.code).toBe('string');
      expect(typeof error.message).toBe('string');
    }
  });

  it('conditions return DecisionResult from evaluate', async () => {
    const state = createState([createTile('t1', 0, 0, 100, 100)]);
    const ctx = createContext(state, { tileId: id('t1') });

    const conditions = [BoundsValid(), MaxTileCount(), CoverageTight()];

    for (const condition of conditions) {
      const result = await condition.evaluate(ctx);
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('violations');
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
    }
  });
});
