import { describe, it, expect } from 'vitest';
import { ConditionNode, ActionNode } from '../../../../packages/core/src/internal';

const ctx = {
  state: { tiles: new Map(), adjacencyVersion: 0 } as any,
  op: 'validate',
  params: {},
  config: {},
};

describe('Condition/Action nodes', () => {
  it('Condition produces violation when false', async () => {
    const n = new ConditionNode(
      'c',
      () => false,
      () => ({ code: 'No', message: 'no' }),
    );
    const res = await n.evaluate(ctx as any);
    expect(res.valid).toBe(false);
    expect(res.violations[0].code).toBe('No');
  });

  it('Action is always valid', async () => {
    let ran = false;
    const n = new ActionNode(() => {
      ran = true;
    });
    const res = await n.evaluate(ctx as any);
    expect(res.valid).toBe(true);
    expect(ran).toBe(true);
  });
});
