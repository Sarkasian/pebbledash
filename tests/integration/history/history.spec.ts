import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('HistoryManager via DashboardModel', () => {
  it('records states and supports undo/redo', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const first = model.getState().toArray()[0];
    await model.splitTile(first.id, { orientation: 'vertical', ratio: 0.5 });
    expect(model.getState().toArray()).toHaveLength(2);
    expect(model.canUndo()).toBe(true);
    model.undo();
    expect(model.getState().toArray()).toHaveLength(1);
    expect(model.canRedo()).toBe(true);
    model.redo();
    expect(model.getState().toArray()).toHaveLength(2);
  });
});
