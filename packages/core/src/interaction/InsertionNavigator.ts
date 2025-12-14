import type { TileId } from '../index.js';
import { DashboardModel } from '../model/DashboardModel.js';
import { EPSILON } from '../utils/geometry.js';
import { seamIdForEdge } from '../seams/ids.js';
import { coversFullSpanVertical, coversFullSpanHorizontal } from '../seams/coverage.js';
import { edgeId } from './navigator-helpers.js';

export type EdgeSide = 'left' | 'right' | 'top' | 'bottom';
export type Orientation = 'vertical' | 'horizontal';

export interface HoverEdge {
  id: string; // edge|<tileId>|<side>
  tileId: TileId;
  side: EdgeSide;
  orientation: Orientation;
  x: number; // percent [0,100]
  y: number; // percent [0,100]
  width: number; // percent [0,100]
  height: number; // percent [0,100]
  canResize?: boolean;
  seamId?: string;
}

export interface InsertionBoundary {
  id: string; // boundary|<refTileId>|<side>|<index>
  refTileId: TileId;
  side: EdgeSide; // direction to insert relative to refTileId
  orientation: Orientation; // orientation of seam/line
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundaryGroup {
  id: string; // seam|<orientation>|<coord>
  orientation: Orientation;
  seamCoord: number; // x or y depending on orientation
  edgeId: string; // the hovered edge id
  fromTileId?: TileId; // last tile pointer came from
  boundaries: InsertionBoundary[];
  focusedIndex: number;
}

export class InsertionNavigator {
  private readonly model: DashboardModel;
  constructor(model: DashboardModel) {
    this.model = model;
  }

  getHoverEdges(): HoverEdge[] {
    const tiles = this.model.getState().toArray();
    const edges: HoverEdge[] = [];
    for (const t of tiles) {
      const eps = EPSILON;
      // Compute canResize from real clamp range (non-zero range only; allow partial coverage)
      const clampLeft = this.model.clampResize(t.id, { edge: 'left', delta: 0 });
      const canLeft = clampLeft.max > eps || clampLeft.min < -eps;
      const clampRight = this.model.clampResize(t.id, { edge: 'right', delta: 0 });
      const canRight = clampRight.max > eps || clampRight.min < -eps;
      edges.push({
        id: edgeId(t.id, 'left'),
        tileId: t.id,
        side: 'left',
        orientation: 'vertical',
        x: t.x,
        y: t.y,
        width: 0,
        height: t.height,
        canResize: canLeft,
        seamId: seamIdForEdge(this.model.getState(), 'vertical', Number(t.x.toFixed(6))),
      });
      edges.push({
        id: edgeId(t.id, 'right'),
        tileId: t.id,
        side: 'right',
        orientation: 'vertical',
        x: t.x + t.width,
        y: t.y,
        width: 0,
        height: t.height,
        canResize: canRight,
        seamId: seamIdForEdge(
          this.model.getState(),
          'vertical',
          Number((t.x + t.width).toFixed(6)),
        ),
      });
      const clampTop = this.model.clampResize(t.id, { edge: 'top', delta: 0 });
      const canTop = clampTop.max > eps || clampTop.min < -eps;
      const clampBottom = this.model.clampResize(t.id, { edge: 'bottom', delta: 0 });
      const canBottom = clampBottom.max > eps || clampBottom.min < -eps;
      edges.push({
        id: edgeId(t.id, 'top'),
        tileId: t.id,
        side: 'top',
        orientation: 'horizontal',
        x: t.x,
        y: t.y,
        width: t.width,
        height: 0,
        canResize: canTop,
        seamId: seamIdForEdge(this.model.getState(), 'horizontal', Number(t.y.toFixed(6))),
      });
      edges.push({
        id: edgeId(t.id, 'bottom'),
        tileId: t.id,
        side: 'bottom',
        orientation: 'horizontal',
        x: t.x,
        y: t.y + t.height,
        width: t.width,
        height: 0,
        canResize: canBottom,
        seamId: seamIdForEdge(
          this.model.getState(),
          'horizontal',
          Number((t.y + t.height).toFixed(6)),
        ),
      });
    }
    return edges;
  }

  pointerEnterTile(tileId: TileId): void {
    this.model.interaction.setFromTile(String(tileId));
  }

  async pointerEnterEdge(
    edgeIdStr: string,
    pointer: { xPct: number; yPct: number },
    opts?: { fromTileId?: TileId },
  ): Promise<void> {
    // Synchronous precompute for immediate UX feedback in tests and renderers
    try {
      const [_, tileIdStr, side] = edgeIdStr.split('|');
      const ref = this.model.getState().tiles.get(tileIdStr as TileId);
      if (ref) {
        const orientation: Orientation =
          side === 'left' || side === 'right' ? 'vertical' : 'horizontal';
        // If we are re-entering the same seam, preserve current group/focus to avoid resetting selection
        const g = this.model.interaction.group;
        if (g && g.orientation === orientation) {
          const seamCoord =
            orientation === 'vertical'
              ? side === 'left'
                ? ref.x
                : ref.x + ref.width
              : side === 'top'
                ? ref.y
                : ref.y + ref.height;
          if (Math.abs(g.seamCoord - seamCoord) <= EPSILON) {
            this.model.interaction.setActiveEdge(edgeIdStr);
            void this.model.lifecycle.emit('interaction:group-update', { group: g });
            const boundary = g.boundaries[g.focusedIndex];
            if (boundary) void this.model.lifecycle.emit('interaction:focus-change', { boundary });
            // Still invoke the engine graph to maintain state coherency
            void this.model.interactionHoverEdge({
              edgeId: edgeIdStr,
              pointer,
              fromTileId: opts?.fromTileId,
            });
            return;
          }
        }
        const tiles = this.model.getState().toArray();
        const eps = EPSILON;
        const boundaries: InsertionBoundary[] = [];
        if (orientation === 'vertical') {
          const seamX = side === 'left' ? ref.x : ref.x + ref.width;
          const leftNeighbors = tiles.filter((t) => Math.abs(t.x + t.width - seamX) <= eps);
          const rightNeighbors = tiles.filter((t) => Math.abs(t.x - seamX) <= eps);
          const fromId = this.model.interaction.fromTileId ?? opts?.fromTileId;
          const fromTile = fromId ? this.model.getState().tiles.get(fromId) : undefined;
          const fromSide =
            fromId && fromTile && Math.abs(fromTile.x + fromTile.width - seamX) <= eps
              ? 'left'
              : fromId && fromTile && Math.abs(fromTile.x - seamX) <= eps
                ? 'right'
                : 'left';
          const fromTiles = fromSide === 'left' ? leftNeighbors : rightNeighbors;
          const insSideForFrom: EdgeSide = fromSide === 'left' ? 'right' : 'left';
          // Include all segments on the from-side
          const sortedFrom = fromTiles.slice().sort((a, b) => a.y - b.y);
          for (let i = 0; i < sortedFrom.length; i++) {
            const tseg = sortedFrom[i];
            if (!tseg) continue;
            boundaries.push({
              id: `boundary|${tseg.id}|${insSideForFrom}|${i}`,
              refTileId: tseg.id,
              side: insSideForFrom,
              orientation: 'vertical',
              x: seamX,
              y: tseg.y,
              width: 0,
              height: tseg.height,
            });
          }
          const oppTiles = fromSide === 'left' ? rightNeighbors : leftNeighbors;
          const oppInsSide: EdgeSide = fromSide === 'left' ? 'left' : 'right';
          if (coversFullSpanVertical(oppTiles, eps)) {
            boundaries.push({
              id: `boundary|__fullspan__|${oppInsSide}|${boundaries.length}`,
              refTileId: '__fullspan__' as TileId,
              side: oppInsSide,
              orientation: 'vertical',
              x: seamX,
              y: 0,
              width: 0,
              height: 100,
            });
          } else if (oppTiles.length === 0) {
            boundaries.push({
              id: `boundary|__container__|${side}|1`,
              refTileId: '__container__' as TileId,
              side: side as EdgeSide,
              orientation: 'vertical',
              x: seamX,
              y: 0,
              width: 0,
              height: 100,
            });
          }
          const origin = fromId
            ? (fromTiles.find((t) => String(t.id) === String(fromId)) ?? fromTiles[0])
            : fromTiles[0];
          const focusedIndex = origin
            ? boundaries.findIndex((b) => String(b.refTileId) === String(origin.id))
            : 0;
          const group: BoundaryGroup = {
            id: `seam|vertical|${seamX}`,
            orientation: 'vertical',
            seamCoord: seamX,
            edgeId: edgeIdStr,
            fromTileId: fromId,
            boundaries,
            focusedIndex: Math.max(0, focusedIndex),
          };
          this.model.interaction.setActiveEdge(edgeIdStr);
          this.model.interaction.setGroup(group);
          void this.model.lifecycle.emit('interaction:hover-start', { group });
          const boundary = group.boundaries[group.focusedIndex];
          if (boundary) void this.model.lifecycle.emit('interaction:focus-change', { boundary });
        } else {
          const seamY = side === 'top' ? ref.y : ref.y + ref.height;
          const topNeighbors = tiles.filter((t) => Math.abs(t.y + t.height - seamY) <= eps);
          const bottomNeighbors = tiles.filter((t) => Math.abs(t.y - seamY) <= eps);
          const fromId = this.model.interaction.fromTileId ?? opts?.fromTileId;
          const fromTile = fromId ? this.model.getState().tiles.get(fromId) : undefined;
          const fromSide =
            fromId && fromTile && Math.abs(fromTile.y + fromTile.height - seamY) <= eps
              ? 'top'
              : fromId && fromTile && Math.abs(fromTile.y - seamY) <= eps
                ? 'bottom'
                : 'top';
          const fromTiles = fromSide === 'top' ? topNeighbors : bottomNeighbors;
          const insSideForFrom: EdgeSide = fromSide === 'top' ? 'bottom' : 'top';
          const sortedFrom = fromTiles.slice().sort((a, b) => a.x - b.x);
          for (let i = 0; i < sortedFrom.length; i++) {
            const tseg = sortedFrom[i];
            if (!tseg) continue;
            boundaries.push({
              id: `boundary|${tseg.id}|${insSideForFrom}|${i}`,
              refTileId: tseg.id,
              side: insSideForFrom,
              orientation: 'horizontal',
              x: tseg.x,
              y: seamY,
              width: tseg.width,
              height: 0,
            });
          }
          const oppTiles = fromSide === 'top' ? bottomNeighbors : topNeighbors;
          const oppInsSide: EdgeSide = fromSide === 'top' ? 'top' : 'bottom';
          if (coversFullSpanHorizontal(oppTiles, eps)) {
            boundaries.push({
              id: `boundary|__fullspan__|${oppInsSide}|${boundaries.length}`,
              refTileId: '__fullspan__' as TileId,
              side: oppInsSide,
              orientation: 'horizontal',
              x: 0,
              y: seamY,
              width: 100,
              height: 0,
            });
          } else if (oppTiles.length === 0) {
            boundaries.push({
              id: `boundary|__container__|${side}|1`,
              refTileId: '__container__' as TileId,
              side: side as EdgeSide,
              orientation: 'horizontal',
              x: 0,
              y: seamY,
              width: 100,
              height: 0,
            });
          }
          const origin = fromId
            ? (fromTiles.find((t) => String(t.id) === String(fromId)) ?? fromTiles[0])
            : fromTiles[0];
          const focusedIndex = origin
            ? boundaries.findIndex((b) => String(b.refTileId) === String(origin.id))
            : 0;
          const group: BoundaryGroup = {
            id: `seam|horizontal|${seamY}`,
            orientation: 'horizontal',
            seamCoord: seamY,
            edgeId: edgeIdStr,
            fromTileId: fromId,
            boundaries,
            focusedIndex: Math.max(0, focusedIndex),
          };
          this.model.interaction.setActiveEdge(edgeIdStr);
          this.model.interaction.setGroup(group);
          void this.model.lifecycle.emit('interaction:hover-start', { group });
          const boundary = group.boundaries[group.focusedIndex];
          if (boundary) void this.model.lifecycle.emit('interaction:focus-change', { boundary });
        }
      }
    } catch {
      // ignore precompute errors; fall back to engine path
    }
    await this.model.interactionHoverEdge({
      edgeId: edgeIdStr,
      pointer,
      fromTileId: opts?.fromTileId,
    });
  }

  pointerLeaveEdge(edgeIdStr: string): void {
    if (this.model.interaction.activeEdgeId !== edgeIdStr) return;
    void this.model.interactionHoverEnd();
  }

  handleKey(code: 'Tab' | 'Enter'): void {
    if (code === 'Tab') {
      void this.model.interactionKeyTab();
    } else if (code === 'Enter') {
      void this.commit();
    }
  }

  async commit(): Promise<void> {
    await this.model.interactionCommit();
  }

  /**
   * Get the currently focused tile ID, if any.
   * Returns the tile ID from the focused boundary in the current group,
   * or the tile the pointer last came from.
   */
  getFocusedTile(): TileId | undefined {
    const group = this.model.interaction.group;
    if (group && group.boundaries.length > 0) {
      const focusedBoundary = group.boundaries[group.focusedIndex];
      if (focusedBoundary) {
        return focusedBoundary.refTileId;
      }
    }
    return this.model.interaction.fromTileId;
  }
}
