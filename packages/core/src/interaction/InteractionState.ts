import type { TileId } from '../index.js';
import type { BoundaryGroup } from './InsertionNavigator.js';

/**
 * Manages the current interaction state for the dashboard.
 * Tracks active edges, boundary groups, and the tile the pointer came from.
 */
export class InteractionState {
  activeEdgeId?: string;
  group?: BoundaryGroup;
  fromTileId?: TileId;

  setActiveEdge(edgeId: string | undefined): void {
    this.activeEdgeId = edgeId;
  }

  setGroup(group: BoundaryGroup | undefined): void {
    this.group = group;
  }

  setFromTile(tileId: string | undefined): void {
    this.fromTileId = tileId as TileId | undefined;
  }
}
