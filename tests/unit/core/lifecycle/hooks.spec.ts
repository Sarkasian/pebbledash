import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../../packages/core/src/index';

describe('Lifecycle hooks', () => {
  it('before hook can cancel', async () => {
    const model = new DashboardModel();
    await model.initialize();
    model.lifecycle.on('before:split', () => false);
    const t = model.getState().toArray()[0];
    const res = await model.splitTile(t.id, { orientation: 'vertical', ratio: 0.5 });
    expect(res.valid).toBe(false);
  });
});
