import type { TileId } from '../index.js';
import { Tile } from '../entities/Tile.js';
import { DashboardState } from '../entities/DashboardState.js';
import { canonicalizeState } from '../utils/canonicalize.js';
import { planDelete, applyDeletePlan } from '../operations/deletion-helper.js';
import type { DecisionResult } from '../decision-engine/types.js';
import { approxEqual } from '../utils/geometry.js';
import { clampSeamDelta as coreClampSeamDelta } from '../seams/clamp.js';
import { applySeamDelta as coreApplySeamDelta } from '../seams/apply.js';
import { resolveEdgeToSeamId as coreResolveEdgeToSeamId } from '../seams/ids.js';
import type { ModelContext } from './context.js';

type SplitParams = { tileId: TileId; orientation: 'horizontal' | 'vertical'; ratio?: number };
type InsertParams = { tileId: TileId; side: 'left' | 'right' | 'top' | 'bottom'; size?: number };
type ResizeParams = { tileId: TileId; edge: 'left' | 'right' | 'top' | 'bottom'; delta: number };

export async function splitTile(
  ctx: ModelContext,
  tileId: TileId,
  p: Omit<SplitParams, 'tileId'>,
): Promise<DecisionResult> {
  if (!(await ctx.getLifecycle().emit('before:split', { tileId, params: p }))) {
    return { valid: false, violations: [{ code: 'Cancelled', message: 'Cancelled by hook' }] };
  }
  const pre = await ctx
    .getEngine()
    .evaluate('split', ctx.makeDecisionContext('split', { tileId, ...p }));
  if (!pre.valid) return pre;
  const tile = ctx.getState().tiles.get(tileId);
  if (!tile) {
    return {
      valid: false,
      violations: [{ code: 'TileNotFound', message: `Tile ${String(tileId)} not found` }],
    };
  }
  const ratio = p.ratio ?? 0.5;
  let a: Tile;
  let b: Tile;
  if (p.orientation === 'vertical') {
    const w1 = tile.width * ratio;
    const w2 = tile.width - w1;
    a = new Tile({
      id: ctx.generateTileId(),
      x: tile.x,
      y: tile.y,
      width: w1,
      height: tile.height,
    });
    b = new Tile({
      id: ctx.generateTileId(),
      x: tile.x + w1,
      y: tile.y,
      width: w2,
      height: tile.height,
    });
  } else {
    const h1 = tile.height * ratio;
    const h2 = tile.height - h1;
    a = new Tile({ id: ctx.generateTileId(), x: tile.x, y: tile.y, width: tile.width, height: h1 });
    b = new Tile({
      id: ctx.generateTileId(),
      x: tile.x,
      y: tile.y + h1,
      width: tile.width,
      height: h2,
    });
  }
  const nextTiles = ctx
    .getState()
    .toArray()
    .filter((t) => t.id !== tileId);
  nextTiles.push(a, b);
  try {
    let nextState = new DashboardState({ tiles: nextTiles });
    nextState = canonicalizeState(nextState, ctx.getConfig().epsilon ?? 1e-6);
    ctx.setState(nextState);
    ctx.getHistory().record(nextState);
    const post = await ctx
      .getEngine()
      .evaluate('validate', ctx.makeDecisionContext('validate', {}));
    await ctx.getLifecycle().emit('after:split', { tileId, params: p, result: post });
    if (post.valid) ctx.notify('split');
    return post;
  } catch (e) {
    return { valid: false, violations: [{ code: 'InvalidSplit', message: (e as Error).message }] };
  }
}

export async function insertTile(
  ctx: ModelContext,
  refId: TileId,
  p: Omit<InsertParams, 'tileId'>,
): Promise<DecisionResult> {
  if (!(await ctx.getLifecycle().emit('before:insert', { tileId: refId, params: p }))) {
    return { valid: false, violations: [{ code: 'Cancelled', message: 'Cancelled by hook' }] };
  }
  const pre = await ctx
    .getEngine()
    .evaluate('insert', ctx.makeDecisionContext('insert', { tileId: refId, ...p }));
  if (!pre.valid) return pre;
  const ref = ctx.getState().tiles.get(refId);
  if (!ref) {
    return {
      valid: false,
      violations: [{ code: 'TileNotFound', message: `Tile ${String(refId)} not found` }],
    };
  }
  const ratio = p.size ?? 0.5;
  let a: Tile;
  let b: Tile;
  if (p.side === 'left' || p.side === 'right') {
    const newWidth = ref.width * ratio;
    if (p.side === 'left') {
      a = new Tile({
        id: ctx.generateTileId(),
        x: ref.x,
        y: ref.y,
        width: newWidth,
        height: ref.height,
      });
      b = new Tile({
        id: ref.id,
        x: ref.x + newWidth,
        y: ref.y,
        width: ref.width - newWidth,
        height: ref.height,
      });
    } else {
      a = new Tile({
        id: ref.id,
        x: ref.x,
        y: ref.y,
        width: ref.width - newWidth,
        height: ref.height,
      });
      b = new Tile({
        id: ctx.generateTileId(),
        x: ref.x + a.width,
        y: ref.y,
        width: newWidth,
        height: ref.height,
      });
    }
  } else {
    const newHeight = ref.height * ratio;
    if (p.side === 'top') {
      a = new Tile({
        id: ctx.generateTileId(),
        x: ref.x,
        y: ref.y,
        width: ref.width,
        height: newHeight,
      });
      b = new Tile({
        id: ref.id,
        x: ref.x,
        y: ref.y + newHeight,
        width: ref.width,
        height: ref.height - newHeight,
      });
    } else {
      a = new Tile({
        id: ref.id,
        x: ref.x,
        y: ref.y,
        width: ref.width,
        height: ref.height - newHeight,
      });
      b = new Tile({
        id: ctx.generateTileId(),
        x: ref.x,
        y: ref.y + a.height,
        width: ref.width,
        height: newHeight,
      });
    }
  }
  const nextTiles = ctx
    .getState()
    .toArray()
    .filter((t) => t.id !== refId);
  nextTiles.push(a, b);
  try {
    let nextState = new DashboardState({ tiles: nextTiles });
    nextState = canonicalizeState(nextState, ctx.getConfig().epsilon ?? 1e-6);
    ctx.setState(nextState);
    ctx.getHistory().record(nextState);
    const post = await ctx
      .getEngine()
      .evaluate('validate', ctx.makeDecisionContext('validate', {}));
    await ctx.getLifecycle().emit('after:insert', { tileId: refId, params: p, result: post });
    if (post.valid) ctx.notify('insert');
    return post;
  } catch (e) {
    return { valid: false, violations: [{ code: 'InvalidInsert', message: (e as Error).message }] };
  }
}

export async function deleteTile(ctx: ModelContext, tileId: TileId): Promise<DecisionResult> {
  if (!(await ctx.getLifecycle().emit('before:delete', { tileId }))) {
    return { valid: false, violations: [{ code: 'Cancelled', message: 'Cancelled by hook' }] };
  }
  const pre = await ctx
    .getEngine()
    .evaluate('delete', ctx.makeDecisionContext('delete', { tileId }));
  if (!pre.valid) return pre;
  const plan = planDelete(ctx.getState(), tileId);
  if (!plan) {
    return {
      valid: false,
      violations: [{ code: 'NoFullSpanCoverage', message: 'No feasible seam collapse plan' }],
    };
  }
  try {
    const nextState = applyDeletePlan(ctx.getState(), tileId, plan);
    ctx.setState(nextState);
    ctx.getHistory().record(nextState);
    const post = await ctx
      .getEngine()
      .evaluate('validate', ctx.makeDecisionContext('validate', {}));
    await ctx.getLifecycle().emit('after:delete', { tileId, result: post });
    if (post.valid) ctx.notify('delete');
    return post;
  } catch (e) {
    return { valid: false, violations: [{ code: 'InvalidDelete', message: (e as Error).message }] };
  }
}

export async function resizeTile(
  ctx: ModelContext,
  tileId: TileId,
  p: Omit<ResizeParams, 'tileId'>,
): Promise<DecisionResult> {
  if (!(await ctx.getLifecycle().emit('before:resize', { tileId, params: p }))) {
    return { valid: false, violations: [{ code: 'Cancelled', message: 'Cancelled by hook' }] };
  }
  const seamId = coreResolveEdgeToSeamId(ctx.getState(), tileId, p.edge);
  if (!seamId) {
    return { valid: false, violations: [{ code: 'NoSeam', message: 'Seam not found for edge' }] };
  }
  const res = await resizeSeam(ctx, seamId, p.delta);
  await ctx.getLifecycle().emit('after:resize', { tileId, params: p, result: res });
  if (res.valid) ctx.notify('resize');
  return res;
}

export function clampResize(ctx: ModelContext, tileId: TileId, p: Omit<ResizeParams, 'tileId'>) {
  const seamId = coreResolveEdgeToSeamId(ctx.getState(), tileId, p.edge);
  if (!seamId) return { clampedDelta: 0, min: 0, max: 0, chainCovered: false };
  return coreClampSeamDelta(ctx.getState(), seamId, p.delta, {
    minTile: ctx.getConfig().minTile,
    epsilon: ctx.getConfig().epsilon,
  });
}

export async function insertFullSpanAtSeam(
  ctx: ModelContext,
  p: {
    orientation: 'vertical' | 'horizontal';
    seamCoord: number;
    side: 'left' | 'right' | 'top' | 'bottom';
    size?: number;
  },
): Promise<DecisionResult> {
  const ratio = p.size ?? 0.5;
  const tiles = ctx.getState().toArray();
  const epsilon = ctx.getConfig().epsilon ?? 1e-6;
  if (p.orientation === 'vertical') {
    const seamX = p.seamCoord;
    const regionWidth = p.side === 'left' ? seamX : 100 - seamX;
    if (regionWidth <= epsilon)
      return { valid: false, violations: [{ code: 'NoRegion', message: 'No width to insert' }] };
    const delta = regionWidth * ratio;
    const factor = (regionWidth - delta) / regionWidth;
    const resized = tiles.map((t) => {
      if (p.side === 'left') {
        if (approxEqual(t.x + t.width, seamX, epsilon) || t.x + t.width <= seamX + epsilon) {
          return new Tile({
            id: t.id,
            x: t.x * factor,
            y: t.y,
            width: t.width * factor,
            height: t.height,
            locked: t.locked,
            meta: t.meta,
          });
        }
        return t;
      }
      if (t.x >= seamX - epsilon) {
        const xRel = t.x - seamX;
        return new Tile({
          id: t.id,
          x: seamX + xRel * factor,
          y: t.y,
          width: t.width * factor,
          height: t.height,
          locked: t.locked,
          meta: t.meta,
        });
      }
      return t;
    });
    const newTile = new Tile({
      id: ctx.generateTileId(),
      x: p.side === 'left' ? seamX - delta : seamX,
      y: 0,
      width: delta,
      height: 100,
    });
    const nextState = canonicalizeState(
      new DashboardState({ tiles: [...resized, newTile] }),
      epsilon,
    );
    ctx.setState(nextState);
    ctx.getHistory().record(nextState);
    const post = await ctx
      .getEngine()
      .evaluate('validate', ctx.makeDecisionContext('validate', {}));
    await ctx
      .getLifecycle()
      .emit('after:insert', { tileId: '__fullspan__', params: p, result: post });
    if (post.valid) ctx.notify('insert');
    return post;
  }
  const seamY = p.seamCoord;
  const regionHeight = p.side === 'top' ? seamY : 100 - seamY;
  if (regionHeight <= epsilon)
    return { valid: false, violations: [{ code: 'NoRegion', message: 'No height to insert' }] };
  const delta = regionHeight * ratio;
  const factor = (regionHeight - delta) / regionHeight;
  const resized = tiles.map((t) => {
    if (p.side === 'top') {
      if (approxEqual(t.y + t.height, seamY, epsilon) || t.y + t.height <= seamY + epsilon) {
        return new Tile({
          id: t.id,
          x: t.x,
          y: t.y * factor,
          width: t.width,
          height: t.height * factor,
          locked: t.locked,
          meta: t.meta,
        });
      }
      return t;
    }
    if (t.y >= seamY - epsilon) {
      const yRel = t.y - seamY;
      return new Tile({
        id: t.id,
        x: t.x,
        y: seamY + yRel * factor,
        width: t.width,
        height: t.height * factor,
        locked: t.locked,
        meta: t.meta,
      });
    }
    return t;
  });
  const newTile = new Tile({
    id: ctx.generateTileId(),
    x: 0,
    y: p.side === 'top' ? seamY - delta : seamY,
    width: 100,
    height: delta,
  });
  const nextState = canonicalizeState(
    new DashboardState({ tiles: [...resized, newTile] }),
    epsilon,
  );
  ctx.setState(nextState);
  ctx.getHistory().record(nextState);
  const post = await ctx.getEngine().evaluate('validate', ctx.makeDecisionContext('validate', {}));
  await ctx
    .getLifecycle()
    .emit('after:insert', { tileId: '__fullspan__', params: p, result: post });
  if (post.valid) ctx.notify('insert');
  return post;
}

export async function insertAtContainerEdge(
  ctx: ModelContext,
  p: { side: 'left' | 'right' | 'top' | 'bottom'; size?: number },
): Promise<DecisionResult> {
  const ratio = p.size ?? 0.5;
  const tiles = ctx.getState().toArray();
  const epsilon = ctx.getConfig().epsilon ?? 1e-6;
  let delta = 0;
  if (p.side === 'left' || p.side === 'right') {
    const base = 100;
    delta = base * ratio;
    const scale = 100 - delta;
    if (scale <= epsilon)
      return {
        valid: false,
        violations: [{ code: 'InvalidDelta', message: 'Delta too large for container insert' }],
      };
    const factor = scale / 100;
    const resized = tiles.map((t) => {
      if (p.side === 'left') {
        return new Tile({
          id: t.id,
          x: t.x * factor + delta,
          y: t.y,
          width: t.width * factor,
          height: t.height,
          locked: t.locked,
          meta: t.meta,
        });
      }
      return new Tile({
        id: t.id,
        x: t.x * factor,
        y: t.y,
        width: t.width * factor,
        height: t.height,
        locked: t.locked,
        meta: t.meta,
      });
    });
    const newTile = new Tile({
      id: ctx.generateTileId(),
      x: p.side === 'left' ? 0 : 100 - delta,
      y: 0,
      width: delta,
      height: 100,
    });
    const nextState = canonicalizeState(
      new DashboardState({ tiles: [...resized, newTile] }),
      epsilon,
    );
    ctx.setState(nextState);
    ctx.getHistory().record(nextState);
    const post = await ctx
      .getEngine()
      .evaluate('validate', ctx.makeDecisionContext('validate', {}));
    await ctx
      .getLifecycle()
      .emit('after:insert', { tileId: '__container__', params: p, result: post });
    if (post.valid) ctx.notify('insert');
    return post;
  }
  const base = 100;
  delta = base * ratio;
  const scale = 100 - delta;
  if (scale <= epsilon)
    return {
      valid: false,
      violations: [{ code: 'InvalidDelta', message: 'Delta too large for container insert' }],
    };
  const factor = scale / 100;
  const resized = tiles.map((t) => {
    if (p.side === 'top') {
      return new Tile({
        id: t.id,
        x: t.x,
        y: t.y * factor + delta,
        width: t.width,
        height: t.height * factor,
        locked: t.locked,
        meta: t.meta,
      });
    }
    return new Tile({
      id: t.id,
      x: t.x,
      y: t.y * factor,
      width: t.width,
      height: t.height * factor,
      locked: t.locked,
      meta: t.meta,
    });
  });
  const newTile = new Tile({
    id: ctx.generateTileId(),
    x: 0,
    y: p.side === 'top' ? 0 : 100 - delta,
    width: 100,
    height: delta,
  });
  const nextState = canonicalizeState(
    new DashboardState({ tiles: [...resized, newTile] }),
    epsilon,
  );
  ctx.setState(nextState);
  ctx.getHistory().record(nextState);
  const post = await ctx.getEngine().evaluate('validate', ctx.makeDecisionContext('validate', {}));
  await ctx
    .getLifecycle()
    .emit('after:insert', { tileId: '__container__', params: p, result: post });
  if (post.valid) ctx.notify('insert');
  return post;
}

export async function resizeSeam(
  ctx: ModelContext,
  seamId: string,
  delta: number,
  opts?: { span?: [number, number] },
): Promise<DecisionResult> {
  const { clampedDelta } = coreClampSeamDelta(ctx.getState(), seamId, delta, {
    minTile: ctx.getConfig().minTile,
    epsilon: ctx.getConfig().epsilon,
    span: opts?.span,
  });
  if (Math.abs(clampedDelta) <= (ctx.getConfig().epsilon ?? 1e-6)) {
    return { valid: true, violations: [] };
  }
  const next = coreApplySeamDelta(ctx.getState(), seamId, clampedDelta, {
    epsilon: ctx.getConfig().epsilon,
    span: opts?.span,
  });
  const normalized = canonicalizeState(next, ctx.getConfig().epsilon ?? 1e-6);
  const post = await ctx.getEngine().evaluate('validate', {
    state: normalized,
    op: 'validate',
    params: {},
    config: ctx.getConfig() as any,
  });
  if (!post.valid) return post;
  ctx.setState(normalized);
  ctx.getHistory().record(normalized);
  return post;
}
