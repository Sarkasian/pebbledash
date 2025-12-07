import { DashboardState } from '../../entities/DashboardState.js';
import { Tile } from '../../entities/Tile.js';
import type { TileId } from '../../index.js';
import type { SplitStrategy } from '../StrategyRegistry.js';

export class EqualSplitStrategy implements SplitStrategy {
  readonly key = 'equal';

  compute(
    state: DashboardState,
    tileId: TileId,
    orientation: 'horizontal' | 'vertical',
  ): DashboardState {
    const tile = state.tiles.get(tileId);
    if (!tile) return state;
    const ratio = 0.5;
    return splitTile(state, tile, tileId, orientation, ratio);
  }
}

function splitTile(
  state: DashboardState,
  tile: Tile,
  tileId: TileId,
  orientation: 'horizontal' | 'vertical',
  ratio: number,
): DashboardState {
  let a: Tile;
  let b: Tile;
  if (orientation === 'vertical') {
    const w1 = tile.width * ratio;
    const w2 = tile.width - w1;
    a = new Tile({
      id: `${String(tileId)}-split-a` as TileId,
      x: tile.x,
      y: tile.y,
      width: w1,
      height: tile.height,
    });
    b = new Tile({
      id: `${String(tileId)}-split-b` as TileId,
      x: tile.x + w1,
      y: tile.y,
      width: w2,
      height: tile.height,
    });
  } else {
    const h1 = tile.height * ratio;
    const h2 = tile.height - h1;
    a = new Tile({
      id: `${String(tileId)}-split-a` as TileId,
      x: tile.x,
      y: tile.y,
      width: tile.width,
      height: h1,
    });
    b = new Tile({
      id: `${String(tileId)}-split-b` as TileId,
      x: tile.x,
      y: tile.y + h1,
      width: tile.width,
      height: h2,
    });
  }
  const nextTiles = state.toArray().filter((t) => t.id !== tileId);
  nextTiles.push(a, b);
  return new DashboardState({ tiles: nextTiles, groups: state.groups });
}
