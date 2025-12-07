import type { Node } from './nodes.js';
import type { DecisionContext, DecisionResult, Operation } from './types.js';

export class GraphRegistry {
  private readonly graphs = new Map<Operation, Node>();
  register(op: Operation, root: Node): void {
    this.graphs.set(op, root);
  }
  get(op: Operation): Node {
    const node = this.graphs.get(op);
    if (!node) throw new Error(`No graph registered for operation ${op}`);
    return node;
  }

  getEntries(): [Operation, Node][] {
    return Array.from(this.graphs.entries());
  }
}

export class DecisionEngine {
  constructor(private readonly registry: GraphRegistry) {}
  async evaluate<P = unknown>(op: Operation, ctx: DecisionContext<P>): Promise<DecisionResult> {
    const root = this.registry.get(op);
    return root.evaluate(ctx as unknown as DecisionContext);
  }
}
