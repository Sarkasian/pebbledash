import { describe, it, expect } from 'vitest';
import { MemoryAdapter, type SnapshotV1 } from '../../../packages/core/src/index';

describe('MemoryAdapter', () => {
  it('saves, loads, lists', async () => {
    const a = new MemoryAdapter();
    const snap: SnapshotV1 = {
      version: 1,
      tiles: [{ id: 't1' as any, x: 0, y: 0, width: 100, height: 100 }],
    };
    await a.save('layout-1', snap);
    const got = await a.load('layout-1');
    expect(got?.tiles[0].width).toBe(100);
    const list = await a.list('layout');
    expect(list).toContain('layout-1');
  });
});
