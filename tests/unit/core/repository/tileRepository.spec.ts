import { describe, it, expect } from 'vitest';
import { Tile, type TileId } from '../../../../packages/core/src/index';
import { TileRepository } from '../../../../packages/core/src/repository/TileRepository';

function id(s: string): TileId {
  return s as TileId;
}

function createTile(tileId: string, x: number, y: number, width: number, height: number): Tile {
  return new Tile({ id: id(tileId), x, y, width, height });
}

describe('TileRepository', () => {
  describe('version tracking', () => {
    it('starts with version 0', () => {
      const repo = new TileRepository();
      expect(repo.version).toBe(0);
    });

    it('increments version on add', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 0, 0, 50, 50));

      expect(repo.version).toBe(1);
    });

    it('increments version on upsert', () => {
      const repo = new TileRepository();
      repo.upsert(createTile('t1', 0, 0, 50, 50));

      expect(repo.version).toBe(1);
    });

    it('increments version on update', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 0, 0, 50, 50));

      repo.update(id('t1'), (t) => t.with({ width: 60 }));

      expect(repo.version).toBe(2);
    });

    it('increments version on remove', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 0, 0, 50, 50));

      repo.remove(id('t1'));

      expect(repo.version).toBe(2);
    });

    it('does not increment version on remove of nonexistent tile', () => {
      const repo = new TileRepository();

      repo.remove(id('nonexistent'));

      expect(repo.version).toBe(0);
    });

    it('increments version on clear', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 0, 0, 50, 50));

      repo.clear();

      expect(repo.version).toBe(2);
    });
  });

  describe('add', () => {
    it('adds a tile', () => {
      const repo = new TileRepository();
      const tile = createTile('t1', 10, 20, 30, 40);

      repo.add(tile);

      expect(repo.get(id('t1'))).toBe(tile);
    });

    it('adds multiple tiles', () => {
      const repo = new TileRepository();
      const t1 = createTile('t1', 0, 0, 50, 50);
      const t2 = createTile('t2', 50, 0, 50, 50);

      repo.add(t1);
      repo.add(t2);

      expect(repo.all()).toHaveLength(2);
    });
  });

  describe('upsert', () => {
    it('adds a new tile', () => {
      const repo = new TileRepository();
      const tile = createTile('t1', 10, 20, 30, 40);

      repo.upsert(tile);

      expect(repo.get(id('t1'))).toBe(tile);
    });

    it('updates an existing tile', () => {
      const repo = new TileRepository();
      const original = createTile('t1', 10, 20, 30, 40);
      const updated = createTile('t1', 15, 25, 35, 45);

      repo.add(original);
      repo.upsert(updated);

      expect(repo.get(id('t1'))).toBe(updated);
    });
  });

  describe('update', () => {
    it('updates a tile using transform function', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 10, 20, 30, 40));

      const result = repo.update(id('t1'), (t) => t.with({ width: 50 }));

      expect(result.width).toBe(50);
      expect(repo.get(id('t1'))?.width).toBe(50);
    });

    it('returns the updated tile', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 10, 20, 30, 40));

      const result = repo.update(id('t1'), (t) => t.with({ x: 15 }));

      expect(result.x).toBe(15);
    });

    it('throws when updating nonexistent tile', () => {
      const repo = new TileRepository();

      expect(() => {
        repo.update(id('nonexistent'), (t) => t);
      }).toThrow('Tile nonexistent not found');
    });
  });

  describe('remove', () => {
    it('removes an existing tile', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 10, 20, 30, 40));

      const removed = repo.remove(id('t1'));

      expect(removed).toBeDefined();
      expect(repo.get(id('t1'))).toBeUndefined();
    });

    it('returns the removed tile', () => {
      const repo = new TileRepository();
      const tile = createTile('t1', 10, 20, 30, 40);
      repo.add(tile);

      const removed = repo.remove(id('t1'));

      expect(removed).toBe(tile);
    });

    it('returns undefined for nonexistent tile', () => {
      const repo = new TileRepository();

      const removed = repo.remove(id('nonexistent'));

      expect(removed).toBeUndefined();
    });
  });

  describe('get', () => {
    it('returns tile by ID', () => {
      const repo = new TileRepository();
      const tile = createTile('t1', 10, 20, 30, 40);
      repo.add(tile);

      expect(repo.get(id('t1'))).toBe(tile);
    });

    it('returns undefined for nonexistent ID', () => {
      const repo = new TileRepository();

      expect(repo.get(id('nonexistent'))).toBeUndefined();
    });
  });

  describe('require', () => {
    it('returns tile by ID', () => {
      const repo = new TileRepository();
      const tile = createTile('t1', 10, 20, 30, 40);
      repo.add(tile);

      expect(repo.require(id('t1'))).toBe(tile);
    });

    it('throws for nonexistent ID', () => {
      const repo = new TileRepository();

      expect(() => repo.require(id('nonexistent'))).toThrow('Tile nonexistent not found');
    });
  });

  describe('has', () => {
    it('returns true for existing tile', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 10, 20, 30, 40));

      expect(repo.has(id('t1'))).toBe(true);
    });

    it('returns false for nonexistent tile', () => {
      const repo = new TileRepository();

      expect(repo.has(id('nonexistent'))).toBe(false);
    });
  });

  describe('all', () => {
    it('returns empty array for empty repository', () => {
      const repo = new TileRepository();

      expect(repo.all()).toEqual([]);
    });

    it('returns all tiles', () => {
      const repo = new TileRepository();
      const t1 = createTile('t1', 0, 0, 50, 50);
      const t2 = createTile('t2', 50, 0, 50, 50);

      repo.add(t1);
      repo.add(t2);

      const all = repo.all();

      expect(all).toHaveLength(2);
      expect(all).toContain(t1);
      expect(all).toContain(t2);
    });
  });

  describe('clear', () => {
    it('removes all tiles', () => {
      const repo = new TileRepository();
      repo.add(createTile('t1', 0, 0, 50, 50));
      repo.add(createTile('t2', 50, 0, 50, 50));

      repo.clear();

      expect(repo.all()).toHaveLength(0);
    });

    it('clears an empty repository', () => {
      const repo = new TileRepository();

      repo.clear();

      expect(repo.all()).toHaveLength(0);
    });
  });
});
