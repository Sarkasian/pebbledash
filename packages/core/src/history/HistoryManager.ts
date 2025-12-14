import { DashboardState } from '../entities/DashboardState.js';

export interface HistoryOptions {
  limit?: number;
  /** Optional callback fired after a state is recorded */
  onRecord?: (state: DashboardState, canUndo: boolean, canRedo: boolean) => void;
}

export class HistoryManager {
  private readonly limit: number;
  private stack: DashboardState[] = [];
  private index = -1;
  private onRecord?: (state: DashboardState, canUndo: boolean, canRedo: boolean) => void;

  constructor(opts?: HistoryOptions) {
    this.limit = opts?.limit ?? 100;
    this.onRecord = opts?.onRecord;
  }

  /** Set the onRecord callback (useful for late binding) */
  setOnRecord(cb: (state: DashboardState, canUndo: boolean, canRedo: boolean) => void): void {
    this.onRecord = cb;
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
    
    // Fire callback if set
    if (this.onRecord) {
      this.onRecord(state, this.canUndo(), this.canRedo());
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
