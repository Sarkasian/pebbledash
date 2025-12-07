import { describe, it, expect } from 'vitest';
import { TileState, Tile, type TileId } from '../../../packages/core/src/index';

const id = (s: string) => s as TileId;

describe('TileState', () => {
  it('adds, updates, removes tiles and emits events', () => {
    const state = new TileState();
    const events: string[] = [];
    state.on((e) => events.push(e.type));

    const t = new Tile({ id: id('a'), x: 0, y: 0, width: 100, height: 100 });
    state.addTile(t);
    expect(state.getTile(id('a'))).toBeTruthy();

    state.updateTile(id('a'), { width: 90 });
    expect(state.getTile(id('a'))?.width).toBeCloseTo(90);

    state.removeTile(id('a'));
    expect(state.getTile(id('a'))).toBeUndefined();

    expect(events).toEqual(['tile:added', 'tile:updated', 'tile:removed']);
  });
});
