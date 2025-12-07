import type { TileId } from '../index.js';
import type { DashboardState } from '../entities/DashboardState.js';
import { EPSILON, bottom, right } from '../utils/geometry.js';
import { Tile } from '../entities/Tile.js';

export type Axis = 'vertical' | 'horizontal';
export type Side = 'left' | 'right' | 'top' | 'bottom';

export interface SeamOption {
  axis: Axis;
  side: Side;
  neighbors: Tile[];
  allUnlocked: boolean;
}

function findGroupId(
  groups: Map<string, Set<TileId>> | undefined,
  tileId: TileId,
): string | undefined {
  if (!groups) return undefined;
  for (const [gid, members] of groups.entries()) {
    if (members.has(tileId)) return gid;
  }
  return undefined;
}

function tilesForGroup(state: DashboardState, gid?: string): Set<TileId> | undefined {
  if (!gid || !state.groups) return undefined;
  return state.groups.get(gid);
}

function isWithin(v: number, min: number, max: number): boolean {
  return v >= min - EPSILON && v <= max + EPSILON;
}

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON;
}

function coverageBySide(
  state: DashboardState,
  target: Tile,
  side: Side,
  sameGroupOnly: boolean,
  gid?: string,
): Tile[] | undefined {
  const tiles = Array.from(state.tiles.values());
  const candidates = tiles.filter((t) => {
    if (t.id === target.id) return false;
    if (sameGroupOnly) {
      const groupMembers = tilesForGroup(state, gid);
      if (!groupMembers || !groupMembers.has(t.id)) return false;
    }
    if (side === 'left') {
      // neighbor to the left touching target.x
      if (!nearlyEqual(right(t), target.x)) return false;
      // fully within target's vertical span
      return (
        isWithin(t.y, target.y, bottom(target)) && isWithin(bottom(t), target.y, bottom(target))
      );
    } else if (side === 'right') {
      if (!nearlyEqual(t.x, right(target))) return false;
      return (
        isWithin(t.y, target.y, bottom(target)) && isWithin(bottom(t), target.y, bottom(target))
      );
    } else if (side === 'top') {
      if (!nearlyEqual(bottom(t), target.y)) return false;
      return isWithin(t.x, target.x, right(target)) && isWithin(right(t), target.x, right(target));
    } else {
      // bottom
      if (!nearlyEqual(t.y, bottom(target))) return false;
      return isWithin(t.x, target.x, right(target)) && isWithin(right(t), target.x, right(target));
    }
  });

  if (side === 'left' || side === 'right') {
    // sort by y asc and ensure perfect tiling of [target.y, target.bottom]
    const sorted = candidates.sort((a, b) => a.y - b.y);
    if (sorted.length === 0) return undefined;
    let cursor = target.y;
    for (const n of sorted) {
      if (!nearlyEqual(n.y, cursor)) return undefined;
      cursor = bottom(n);
    }
    if (!nearlyEqual(cursor, bottom(target))) return undefined;
    return sorted;
  } else {
    const sorted = candidates.sort((a, b) => a.x - b.x);
    if (sorted.length === 0) return undefined;
    let cursor = target.x;
    for (const n of sorted) {
      if (!nearlyEqual(n.x, cursor)) return undefined;
      cursor = right(n);
    }
    if (!nearlyEqual(cursor, right(target))) return undefined;
    return sorted;
  }
}

export function computeCoverageOptions(state: DashboardState, tileId: TileId): SeamOption[] {
  const target = state.tiles.get(tileId);
  if (!target) return [];
  const gid = findGroupId(state.groups, tileId);
  const members = gid && state.groups ? state.groups.get(gid) : undefined;
  const sameGroupOnly = Boolean(members && members.size > 1);

  const options: SeamOption[] = [];
  const sides: Side[] = ['left', 'right', 'top', 'bottom'];
  for (const side of sides) {
    const axis: Axis = side === 'left' || side === 'right' ? 'vertical' : 'horizontal';
    const neighbors = coverageBySide(state, target, side, sameGroupOnly, gid);
    if (!neighbors) continue;
    const allUnlocked = neighbors.every((n) => !n.locked);
    options.push({ axis, side, neighbors, allUnlocked });
  }
  return options;
}
