import { describe, it, expect } from 'vitest';
import {
  SequenceNode,
  SelectorNode,
  ConditionNode,
  GraphRegistry,
  DecisionEngine,
} from '../../../../packages/core/src/internal';

const ok = new ConditionNode(
  'ok',
  () => true,
  () => ({ code: 'X', message: 'x' }),
);
const bad = new ConditionNode(
  'bad',
  () => false,
  () => ({ code: 'Bad', message: 'bad' }),
);

const ctx = {
  state: { tiles: new Map(), adjacencyVersion: 0 } as any,
  op: 'validate',
  params: {},
  config: {},
};

describe('Sequence/Selector nodes', () => {
  it('Sequence passes when all pass', async () => {
    const reg = new GraphRegistry();
    reg.register('validate', new SequenceNode([ok, ok]));
    const engine = new DecisionEngine(reg);
    const res = await engine.evaluate('validate', ctx);
    expect(res.valid).toBe(true);
    expect(res.violations.length).toBe(0);
  });

  it('Sequence fails on first failure', async () => {
    const reg = new GraphRegistry();
    reg.register('validate', new SequenceNode([ok, bad, ok]));
    const engine = new DecisionEngine(reg);
    const res = await engine.evaluate('validate', ctx);
    expect(res.valid).toBe(false);
    expect(res.violations[0].code).toBe('Bad');
  });

  it('Selector passes if any child passes', async () => {
    const reg = new GraphRegistry();
    reg.register('validate', new SelectorNode([bad, ok]));
    const engine = new DecisionEngine(reg);
    const res = await engine.evaluate('validate', ctx);
    expect(res.valid).toBe(true);
  });
});
