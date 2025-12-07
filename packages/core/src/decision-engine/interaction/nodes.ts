import { ActionNode, ConditionNode, SequenceNode } from '../nodes.js';
import type { DecisionContext, InteractionDecisionContext } from '../types.js';
import type { TileId } from '../../index.js';
import type { Tile } from '../../entities/Tile.js';
import type { BoundaryGroup, InsertionBoundary } from '../../interaction/InsertionNavigator.js';
import { EPSILON } from '../../utils/geometry.js';
import { coversFullSpanVertical, coversFullSpanHorizontal } from '../../seams/coverage.js';

type HoverEdgeParams = {
  edgeId: string;
  pointer: { xPct: number; yPct: number };
  fromTileId?: TileId;
};

interface ParsedEdge {
  tileId: string;
  side: 'left' | 'right' | 'top' | 'bottom';
}

function parseEdgeId(id: string): ParsedEdge | null {
  if (!id.startsWith('edge|')) return null;
  const parts = id.split('|');
  const tileId = parts[1];
  const side = parts[2] as 'left' | 'right' | 'top' | 'bottom' | undefined;
  if (!tileId || !side) return null;
  return { tileId, side };
}

function seamEpsFromCtx(ctx: DecisionContext | InteractionDecisionContext): number {
  const base = ctx.config.epsilon ?? EPSILON;
  return Math.max(base, 1e-2);
}

function computeSeam(
  ctx: DecisionContext<HoverEdgeParams> | InteractionDecisionContext<HoverEdgeParams>,
): { orientation: 'vertical' | 'horizontal'; coord: number } | null {
  const parsed = parseEdgeId(ctx.params.edgeId);
  if (!parsed) return null;
  const { tileId, side } = parsed;
  const ref = ctx.state.tiles.get(tileId as TileId);
  if (!ref) return null;
  if (side === 'left' || side === 'right') {
    const x = side === 'left' ? ref.x : ref.x + ref.width;
    return { orientation: 'vertical', coord: x };
  } else {
    const y = side === 'top' ? ref.y : ref.y + ref.height;
    return { orientation: 'horizontal', coord: y };
  }
}

export function SameSeamReentry() {
  return new ConditionNode<HoverEdgeParams>(
    'SameSeamReentry',
    (ctx) => {
      const interactionCtx = ctx as InteractionDecisionContext<HoverEdgeParams>;
      const g = interactionCtx.config.interaction?.group;
      if (!g) return false;
      const seam = computeSeam(interactionCtx);
      if (!seam) return false;
      const eps = seamEpsFromCtx(interactionCtx);
      return seam.orientation === g.orientation && Math.abs(seam.coord - g.seamCoord) <= eps;
    },
    () => ({ code: 'DifferentSeam', message: 'Hover moved to a different seam' }),
  );
}

export function PreserveFocusOnReentry() {
  return new ActionNode<HoverEdgeParams>(async (ctx) => {
    // No-op; keep current group/focus. Could emit a focus-change for consistency.
    const interactionCtx = ctx as InteractionDecisionContext<HoverEdgeParams>;
    const group = interactionCtx.config.interaction?.group;
    if (group) {
      const model = interactionCtx.config.model;
      // Update active edge id for completeness
      interactionCtx.config.interaction?.setActiveEdge(ctx.params.edgeId);
      await model.lifecycle.emit('interaction:group-update', { group });
      const boundary = group.boundaries[group.focusedIndex];
      if (boundary) await model.lifecycle.emit('interaction:focus-change', { boundary });
    }
  });
}

export function ComputeGroupAndFocus() {
  return new ActionNode<HoverEdgeParams>(async (ctx) => {
    const interactionCtx = ctx as InteractionDecisionContext<HoverEdgeParams>;
    const model = interactionCtx.config.model;
    const interaction = interactionCtx.config.interaction;
    const { edgeId, pointer, fromTileId } = ctx.params;
    interaction.setActiveEdge(edgeId);
    const parsed = parseEdgeId(edgeId);
    if (!parsed) return;
    const { tileId, side } = parsed;
    const tiles = ctx.state.toArray();
    const ref = ctx.state.tiles.get(tileId as TileId);
    if (!ref) return;
    const eps = seamEpsFromCtx(ctx);

    const orientation = side === 'left' || side === 'right' ? 'vertical' : 'horizontal';
    let boundaries: InsertionBoundary[] = [];
    if (orientation === 'vertical') {
      const seamX = side === 'left' ? ref.x : ref.x + ref.width;
      const leftNeighbors = tiles.filter((t) => Math.abs(t.x + t.width - seamX) <= eps);
      const rightNeighbors = tiles.filter((t) => Math.abs(t.x - seamX) <= eps);
      const fromSide = pickFromSideVertical(interaction.fromTileId ?? fromTileId, ctx, seamX);
      const fromTiles = fromSide === 'left' ? leftNeighbors : rightNeighbors;
      const insSideForFrom = fromSide === 'left' ? 'right' : 'left';
      const origin = selectOriginVertical(
        fromTiles,
        interaction.fromTileId ?? fromTileId,
        pointer,
        eps,
      );
      const sortedFrom = fromTiles.slice().sort((a, b) => a.y - b.y);
      // Always include all from-side segments along the seam
      boundaries = sortedFrom.map((t, idx) => ({
        id: `boundary|${t.id}|${insSideForFrom}|${idx}`,
        refTileId: t.id,
        side: insSideForFrom,
        orientation: 'vertical' as const,
        x: seamX,
        y: t.y,
        width: 0,
        height: t.height,
      }));
      const oppTiles = fromSide === 'left' ? rightNeighbors : leftNeighbors;
      const oppInsSide = fromSide === 'left' ? 'left' : 'right';
      // If opposite side fully covers seam (possibly multiple tiles), add a synthetic full-span boundary
      if (coversFullSpanVertical(oppTiles, eps)) {
        boundaries.push({
          id: `boundary|__fullspan__|${oppInsSide}|${boundaries.length}`,
          refTileId: '__fullspan__' as TileId,
          side: oppInsSide,
          orientation: 'vertical' as const,
          x: seamX,
          y: 0,
          width: 0,
          height: 100,
        });
      } else if (oppTiles.length === 0) {
        // Outer seam: include container full-span
        boundaries.push({
          id: `boundary|__container__|${side}|${boundaries.length}`,
          refTileId: '__container__' as TileId,
          side,
          orientation: 'vertical' as const,
          x: seamX,
          y: 0,
          width: 0,
          height: 100,
        });
      }
      const idx = boundaries.findIndex((b) => String(b.refTileId) === String(origin?.id));
      const initialFocus = idx >= 0 ? idx : 0;
      const group: BoundaryGroup = {
        id: `seam|vertical|${seamX}`,
        orientation: 'vertical',
        seamCoord: seamX,
        edgeId,
        fromTileId: interaction.fromTileId ?? fromTileId,
        boundaries,
        focusedIndex: initialFocus,
      };
      // initial focus: origin if exists, otherwise 0
      interaction.setGroup(group);
      await model.lifecycle.emit('interaction:hover-start', { group });
      await model.lifecycle.emit('interaction:group-update', { group });
      const boundary = group.boundaries[group.focusedIndex];
      if (boundary) await model.lifecycle.emit('interaction:focus-change', { boundary });
      return;
    }
    // horizontal
    const seamY = side === 'top' ? ref.y : ref.y + ref.height;
    const topNeighbors = tiles.filter((t) => Math.abs(t.y + t.height - seamY) <= eps);
    const bottomNeighbors = tiles.filter((t) => Math.abs(t.y - seamY) <= eps);
    const fromSide = pickFromSideHorizontal(interaction.fromTileId ?? fromTileId, ctx, seamY);
    const fromTiles = fromSide === 'top' ? topNeighbors : bottomNeighbors;
    const insSideForFrom = fromSide === 'top' ? 'bottom' : 'top';
    const origin = selectOriginHorizontal(
      fromTiles,
      interaction.fromTileId ?? fromTileId,
      pointer,
      eps,
    );
    const sortedFrom = fromTiles.slice().sort((a, b) => a.x - b.x);
    // Always include all from-side segments along the seam
    boundaries = sortedFrom.map((t, idx) => ({
      id: `boundary|${t.id}|${insSideForFrom}|${idx}`,
      refTileId: t.id,
      side: insSideForFrom,
      orientation: 'horizontal' as const,
      x: t.x,
      y: seamY,
      width: t.width,
      height: 0,
    }));
    const oppTiles = fromSide === 'top' ? bottomNeighbors : topNeighbors;
    const oppInsSide = fromSide === 'top' ? 'top' : 'bottom';
    if (coversFullSpanHorizontal(oppTiles, eps)) {
      boundaries.push({
        id: `boundary|__fullspan__|${oppInsSide}|${boundaries.length}`,
        refTileId: '__fullspan__' as TileId,
        side: oppInsSide,
        orientation: 'horizontal' as const,
        x: 0,
        y: seamY,
        width: 100,
        height: 0,
      });
    } else if (oppTiles.length === 0) {
      boundaries.push({
        id: `boundary|__container__|${side}|${boundaries.length}`,
        refTileId: '__container__' as TileId,
        side,
        orientation: 'horizontal' as const,
        x: 0,
        y: seamY,
        width: 100,
        height: 0,
      });
    }
    const idx = boundaries.findIndex((b) => String(b.refTileId) === String(origin?.id));
    const initialFocus = idx >= 0 ? idx : 0;
    const group: BoundaryGroup = {
      id: `seam|horizontal|${seamY}`,
      orientation: 'horizontal',
      seamCoord: seamY,
      edgeId,
      fromTileId: interaction.fromTileId ?? fromTileId,
      boundaries,
      focusedIndex: initialFocus,
    };
    interaction.setGroup(group);
    await model.lifecycle.emit('interaction:hover-start', { group });
    await model.lifecycle.emit('interaction:group-update', { group });
    const boundary = group.boundaries[group.focusedIndex];
    if (boundary) await model.lifecycle.emit('interaction:focus-change', { boundary });
  });
}

function pickFromSideVertical(
  fromTileId: string | undefined,
  ctx: DecisionContext | InteractionDecisionContext,
  seamX: number,
): 'left' | 'right' {
  const eps = seamEpsFromCtx(ctx);
  if (fromTileId) {
    const t = ctx.state.tiles.get(fromTileId as TileId);
    if (t) {
      if (Math.abs(t.x + t.width - seamX) <= eps) return 'left';
      if (Math.abs(t.x - seamX) <= eps) return 'right';
    }
  }
  // default left
  return 'left';
}

function pickFromSideHorizontal(
  fromTileId: string | undefined,
  ctx: DecisionContext | InteractionDecisionContext,
  seamY: number,
): 'top' | 'bottom' {
  const eps = seamEpsFromCtx(ctx);
  if (fromTileId) {
    const t = ctx.state.tiles.get(fromTileId as TileId);
    if (t) {
      if (Math.abs(t.y + t.height - seamY) <= eps) return 'top';
      if (Math.abs(t.y - seamY) <= eps) return 'bottom';
    }
  }
  return 'top';
}

function selectOriginVertical(
  candidates: Tile[],
  fromTileId: string | undefined,
  pointer: { yPct: number },
  eps: number,
): Tile | undefined {
  if (fromTileId) {
    const match = candidates.find((t) => String(t.id) === String(fromTileId));
    if (match) return match;
  }
  return (
    candidates.find((t) => pointer.yPct >= t.y - eps && pointer.yPct <= t.y + t.height + eps) ??
    candidates[0]
  );
}

function selectOriginHorizontal(
  candidates: Tile[],
  fromTileId: string | undefined,
  pointer: { xPct: number },
  eps: number,
): Tile | undefined {
  if (fromTileId) {
    const match = candidates.find((t) => String(t.id) === String(fromTileId));
    if (match) return match;
  }
  return (
    candidates.find((t) => pointer.xPct >= t.x - eps && pointer.xPct <= t.x + t.width + eps) ??
    candidates[0]
  );
}

export function CycleFocusForwardAndEmit() {
  return new ActionNode(async (ctx) => {
    const interactionCtx = ctx as InteractionDecisionContext;
    const interaction = interactionCtx.config.interaction;
    const group = interaction?.group;
    if (!group || group.boundaries.length === 0) return;
    group.focusedIndex = (group.focusedIndex + 1) % group.boundaries.length;
    const boundary = group.boundaries[group.focusedIndex];
    const model = interactionCtx.config.model;
    await model.lifecycle.emit('interaction:focus-change', { boundary });
    // Emit group update so renderers can redraw the group with updated active boundary
    await model.lifecycle.emit('interaction:group-update', { group });
  });
}

export function CommitCurrentBoundary() {
  return new ActionNode(async (ctx) => {
    const interactionCtx = ctx as InteractionDecisionContext;
    const interaction = interactionCtx.config.interaction;
    const group = interaction?.group;
    if (!group) return;
    const boundary = group.boundaries[group.focusedIndex];
    if (!boundary) return;
    const model = interactionCtx.config.model;
    const eps = seamEpsFromCtx(ctx);
    let res;
    if (String(boundary.refTileId) === '__container__') {
      res = await model.insertAtContainerEdge({ side: boundary.side, size: 0.5 });
    } else if (
      String(boundary.refTileId) === '__fullspan__' ||
      String(boundary.id).includes('__fullspan')
    ) {
      // Handle seams at container borders by falling back to container insert
      if (group.orientation === 'vertical') {
        const atLeft = Math.abs(group.seamCoord - 0) <= eps;
        const atRight = Math.abs(group.seamCoord - 100) <= eps;
        if ((boundary.side === 'left' && atLeft) || (boundary.side === 'right' && atRight)) {
          res = await model.insertAtContainerEdge({ side: boundary.side, size: 0.5 });
        } else {
          res = await model.insertFullSpanAtSeam({
            orientation: group.orientation,
            seamCoord: group.seamCoord,
            side: boundary.side,
            size: 0.5,
          });
        }
      } else {
        const atTop = Math.abs(group.seamCoord - 0) <= eps;
        const atBottom = Math.abs(group.seamCoord - 100) <= eps;
        if ((boundary.side === 'top' && atTop) || (boundary.side === 'bottom' && atBottom)) {
          res = await model.insertAtContainerEdge({ side: boundary.side, size: 0.5 });
        } else {
          res = await model.insertFullSpanAtSeam({
            orientation: group.orientation,
            seamCoord: group.seamCoord,
            side: boundary.side,
            size: 0.5,
          });
        }
      }
    } else {
      res = await model.insertTile(boundary.refTileId, { side: boundary.side, size: 0.5 });
    }
    await model.lifecycle.emit('interaction:committed', { result: res });
  });
}

export function ClearHoverState() {
  return new ActionNode(async (ctx) => {
    const interactionCtx = ctx as InteractionDecisionContext;
    const interaction = interactionCtx.config.interaction;
    const model = interactionCtx.config.model;
    interaction.setActiveEdge(undefined);
    interaction.setGroup(undefined);
    await model.lifecycle.emit('interaction:hover-end', {});
  });
}

export function HoverEdgeGraph() {
  return new SequenceNode([
    // Same-seam fast path
    new (class {
      async evaluate(ctx: DecisionContext) {
        const cond = SameSeamReentry();
        const res = await cond.evaluate(ctx);
        if (res.valid) {
          return await PreserveFocusOnReentry().evaluate(ctx);
        }
        return {
          valid: true,
          violations: [{ code: 'Rebuild', message: 'Proceed to rebuild' }],
        };
      }
    })(),
    ComputeGroupAndFocus(),
  ]);
}

export function KeyTabGraph() {
  return new SequenceNode([CycleFocusForwardAndEmit()]);
}

export function CommitGraph() {
  return new SequenceNode([CommitCurrentBoundary()]);
}

export function HoverEndGraph() {
  return new SequenceNode([ClearHoverState()]);
}
