import { DashboardState } from '../entities/DashboardState.js';

export interface HistoryOptions {
  limit?: number;
}

export class HistoryManager {
  private readonly limit: number;
  private stack: DashboardState[] = [];
  private index = -1;

  constructor(opts?: HistoryOptions) {
    this.limit = opts?.limit ?? 100;
  }

  clear() {
    this.stack = [];
    this.index = -1;
  }

  record(state: DashboardState) {
    // Drop future states if we branched
    if (this.index < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.index + 1);
    }
    this.stack.push(state);
    if (this.stack.length > this.limit) {
      this.stack.shift();
    } else {
      this.index++;
    }
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }

  undo(): DashboardState {
    if (!this.canUndo()) throw new Error('Nothing to undo');
    this.index--;
    return this.stack[this.index]!;
  }

  redo(): DashboardState {
    if (!this.canRedo()) throw new Error('Nothing to redo');
    this.index++;
    return this.stack[this.index]!;
  }
}
