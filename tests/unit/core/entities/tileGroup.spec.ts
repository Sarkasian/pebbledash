import { describe, it, expect } from 'vitest';
import { TileGroup } from '../../../../packages/core/src/entities/TileGroup';
import type { TileId } from '../../../../packages/core/src/index';

const id = (s: string) => s as TileId;

describe('TileGroup', () => {
  describe('constructor', () => {
    it('creates a group with an id and empty tiles by default', () => {
      const group = new TileGroup('group-1');
      expect(group.id).toBe('group-1');
      expect(group.tiles.size).toBe(0);
    });

    it('creates a group with initial tiles', () => {
      const tiles = [id('tile-1'), id('tile-2')];
      const group = new TileGroup('group-1', tiles);
      expect(group.id).toBe('group-1');
      expect(group.tiles.size).toBe(2);
      expect(group.tiles.has(id('tile-1'))).toBe(true);
      expect(group.tiles.has(id('tile-2'))).toBe(true);
    });

    it('is frozen after construction', () => {
      const group = new TileGroup('group-1');
      expect(Object.isFrozen(group)).toBe(true);
    });
  });

  describe('add', () => {
    it('returns a new TileGroup with the tile added', () => {
      const group = new TileGroup('group-1');
      const newGroup = group.add(id('tile-1'));

      expect(newGroup).not.toBe(group);
      expect(newGroup.id).toBe('group-1');
      expect(newGroup.tiles.has(id('tile-1'))).toBe(true);
      expect(group.tiles.has(id('tile-1'))).toBe(false);
    });

    it('preserves existing tiles when adding', () => {
      const group = new TileGroup('group-1', [id('tile-1')]);
      const newGroup = group.add(id('tile-2'));

      expect(newGroup.tiles.size).toBe(2);
      expect(newGroup.tiles.has(id('tile-1'))).toBe(true);
      expect(newGroup.tiles.has(id('tile-2'))).toBe(true);
    });
  });

  describe('remove', () => {
    it('returns a new TileGroup with the tile removed', () => {
      const group = new TileGroup('group-1', [id('tile-1'), id('tile-2')]);
      const newGroup = group.remove(id('tile-1'));

      expect(newGroup).not.toBe(group);
      expect(newGroup.id).toBe('group-1');
      expect(newGroup.tiles.has(id('tile-1'))).toBe(false);
      expect(newGroup.tiles.has(id('tile-2'))).toBe(true);
      expect(group.tiles.has(id('tile-1'))).toBe(true);
    });

    it('returns a new group even if tile was not present', () => {
      const group = new TileGroup('group-1', [id('tile-1')]);
      const newGroup = group.remove(id('tile-99'));

      expect(newGroup).not.toBe(group);
      expect(newGroup.tiles.size).toBe(1);
      expect(newGroup.tiles.has(id('tile-1'))).toBe(true);
    });
  });
});
