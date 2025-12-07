import type { DecisionContext, DecisionResult, Violation } from './types.js';

export interface Node {
  evaluate(ctx: DecisionContext): Promise<DecisionResult> | DecisionResult;
}

/**
 * A condition node that evaluates a predicate and returns a violation if false.
 * @template P - Type of the params object in the DecisionContext
 */
export class ConditionNode<P = unknown> implements Node {
  constructor(
    readonly label: string,
    readonly predicate: (ctx: DecisionContext<P>) => boolean | Promise<boolean>,
    readonly violationFactory: (ctx: DecisionContext<P>) => Violation,
  ) {}

  async evaluate(ctx: DecisionContext): Promise<DecisionResult> {
    const ok = await this.predicate(ctx as DecisionContext<P>);
    return ok
      ? { valid: true, violations: [] }
      : { valid: false, violations: [this.violationFactory(ctx as DecisionContext<P>)] };
  }
}

/**
 * An action node that executes a side effect.
 * @template P - Type of the params object in the DecisionContext
 */
export class ActionNode<P = unknown> implements Node {
  constructor(readonly run: (ctx: DecisionContext<P>) => void | Promise<void>) {}
  async evaluate(ctx: DecisionContext): Promise<DecisionResult> {
    await this.run(ctx as DecisionContext<P>);
    return { valid: true, violations: [] };
  }
}

export class SequenceNode implements Node {
  constructor(readonly children: Node[]) {}
  async evaluate(ctx: DecisionContext): Promise<DecisionResult> {
    const violations: Violation[] = [];
    for (const child of this.children) {
      const res = await child.evaluate(ctx);
      if (!res.valid) {
        violations.push(...res.violations);
        return { valid: false, violations };
      }
    }
    return { valid: true, violations };
  }
}

export class SelectorNode implements Node {
  constructor(readonly children: Node[]) {}
  async evaluate(ctx: DecisionContext): Promise<DecisionResult> {
    const violations: Violation[] = [];
    for (const child of this.children) {
      const res = await child.evaluate(ctx);
      if (res.valid) {
        return { valid: true, violations: [] };
      }
      violations.push(...res.violations);
    }
    return { valid: false, violations };
  }
}
