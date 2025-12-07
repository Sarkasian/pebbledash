import { describe, it, expect } from 'vitest';
import { DashboardModel, clampSeamDelta, applySeamDelta } from '../../../packages/core/src/index';

describe('Seam clamp and apply (vertical)', () => {
  it('clamps positive delta by right tile min width and applies', async () => {
    const model = new DashboardModel({ useSeamCore: true, minTile: { width: 5, height: 5 } });
    await model.initialize({
      layout: {
        tiles: [
          { id: 'L' as any, x: 0, y: 0, width: 50, height: 50 },
          { id: 'R' as any, x: 50, y: 0, width: 50, height: 50 },
          { id: 'B' as any, x: 0, y: 50, width: 100, height: 50 },
        ],
      },
    });
    const seamId = 'seam|v|50.000000';
    const clamp = clampSeamDelta(model.getState() as any, seamId, 100, {
      minTile: { width: 5, height: 5 },
    });
    expect(clamp.max).toBeGreaterThan(0);
    // Right tile width is 50, min 5 => max +delta = 45
    expect(Math.round(clamp.max)).toBe(45);
    const next = applySeamDelta(model.getState() as any, seamId, clamp.max);
    const tiles = next.toArray();
    const left = tiles.find((t) => String(t.id) === 'L')!;
    const right = tiles.find((t) => String(t.id) === 'R')!;
    expect(Math.round(left.width)).toBe(95);
    expect(Math.round(right.width)).toBe(5);
  });
});
