import type { TileId } from '../../index.js';
import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { adjacent } from '../../utils/geometry.js';

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

export function GroupPolicyAllowsDelete() {
  return new ConditionNode(
    'GroupPolicyAllowsDelete',
    (ctx: DecisionContext<{ tileId: TileId }>) => {
      const groups = ctx.state.groups;
      const tileId = ctx.params.tileId;
      if (!groups) return true;
      const gid = findGroupId(groups, tileId);
      if (!gid) return true;
      const members = groups.get(gid);
      if (!members || members.size <= 1) {
        // Last member: allowed; group will be removed after
        return true;
      }
      // Require at least one same-group edge-sharing neighbor
      const target = ctx.state.tiles.get(tileId);
      if (!target) return false;
      for (const otherId of members) {
        if (otherId === tileId) continue;
        const other = ctx.state.tiles.get(otherId);
        if (!other) continue;
        if (adjacent(target, other)) {
          return true;
        }
      }
      return false;
    },
    () => ({
      code: 'GroupIsolated',
      message:
        'Cannot delete grouped tile: no adjacent same-group neighbor to satisfy within-group fill policy',
    }),
  );
}
