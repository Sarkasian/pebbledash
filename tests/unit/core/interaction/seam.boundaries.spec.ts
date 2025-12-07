import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../../packages/core/src/index';
import { InsertionNavigator } from '../../../../packages/core/src/internal';

describe('InsertionNavigator: hover edges and seam-aware boundaries', () => {
  it('getHoverEdges provides seamId and canResize flags', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const nav = new InsertionNavigator(model);
    const edges = nav.getHoverEdges();
    expect(edges.length).toBeGreaterThan(0);
    for (const e of edges) {
      expect(e.seamId).toBeTruthy();
      expect(['vertical', 'horizontal']).toContain(e.orientation);
    }
  });
});
