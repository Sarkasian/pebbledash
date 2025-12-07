import type { TileId } from '../index.js';
import type { DashboardState } from '../entities/DashboardState.js';
import { Tile } from '../entities/Tile.js';
import { computeCoverageOptions, type SeamOption } from './seam-graph.js';
import { HeuristicDeleteStrategy } from '../strategies/DeleteStrategy.js';
import { normalizeTiles } from './normalize-layout.js';

export interface DeletePlan {
  option: SeamOption;
}

export function planDelete(state: DashboardState, tileId: TileId): DeletePlan | undefined {
  const options = computeCoverageOptions(state, tileId);
  if (options.length === 0) return undefined;
  const strategy = new HeuristicDeleteStrategy();
  const chosen = strategy.choose(options);
  if (!chosen) return undefined;
  return { option: chosen };
}

export function applyDeletePlan(
  state: DashboardState,
  tileId: TileId,
  plan: DeletePlan,
): DashboardState {
  const target = state.tiles.get(tileId);
  if (!target) throw new Error(`Tile ${String(tileId)} not found`);
  const tiles = state.toArray().filter((t) => t.id !== tileId);
  const updated = new Map<string, Tile>();
  for (const t of tiles) updated.set(String(t.id), t);

  if (plan.option.axis === 'vertical') {
    const delta = target.width;
    if (plan.option.side === 'left') {
      for (const n of plan.option.neighbors) {
        const prev = updated.get(String(n.id))!;
        const next = new Tile({
          id: prev.id,
          x: prev.x,
          y: prev.y,
          width: prev.width + delta,
          height: prev.height,
          locked: prev.locked,
          meta: prev.meta,
        });
        updated.set(String(prev.id), next);
      }
      // No need to translate right region
    } else {
      // side === 'right'
      for (const n of plan.option.neighbors) {
        const prev = updated.get(String(n.id))!;
        const next = new Tile({
          id: prev.id,
          x: prev.x - delta,
          y: prev.y,
          width: prev.width + delta,
          height: prev.height,
          locked: prev.locked,
          meta: prev.meta,
        });
        updated.set(String(prev.id), next);
      }
      // No need to translate left region
    }
  } else {
    const delta = target.height;
    if (plan.option.side === 'top') {
      for (const n of plan.option.neighbors) {
        const prev = updated.get(String(n.id))!;
        const next = new Tile({
          id: prev.id,
          x: prev.x,
          y: prev.y,
          width: prev.width,
          height: prev.height + delta,
          locked: prev.locked,
          meta: prev.meta,
        });
        updated.set(String(prev.id), next);
      }
    } else {
      // side === 'bottom'
      for (const n of plan.option.neighbors) {
        const prev = updated.get(String(n.id))!;
        const next = new Tile({
          id: prev.id,
          x: prev.x,
          y: prev.y - delta,
          width: prev.width,
          height: prev.height + delta,
          locked: prev.locked,
          meta: prev.meta,
        });
        updated.set(String(prev.id), next);
      }
    }
  }

  const nextTiles = normalizeTiles(Array.from(updated.values()));
  return new (state.constructor as any)(
    { tiles: nextTiles, groups: state.groups },
    state.adjacencyVersion + 1,
  ) as DashboardState;
}
