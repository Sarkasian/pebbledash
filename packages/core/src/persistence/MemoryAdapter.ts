import type { PersistenceAdapter, SnapshotV1 } from './PersistenceAdapter.js';

export class MemoryAdapter implements PersistenceAdapter {
  private readonly store = new Map<string, SnapshotV1>();
  async save(key: string, snapshot: SnapshotV1): Promise<void> {
    this.store.set(key, snapshot);
  }
  async load(key: string): Promise<SnapshotV1 | null> {
    return this.store.get(key) ?? null;
  }
  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.store.keys());
    return prefix ? keys.filter((k) => k.startsWith(prefix)) : keys;
  }
}
