import type { PersistenceAdapter, Snapshot } from './PersistenceAdapter.js';

export class MemoryAdapter implements PersistenceAdapter {
  private readonly store = new Map<string, Snapshot>();
  async save(key: string, snapshot: Snapshot): Promise<void> {
    this.store.set(key, snapshot);
  }
  async load(key: string): Promise<Snapshot | null> {
    return this.store.get(key) ?? null;
  }
  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.store.keys());
    return prefix ? keys.filter((k) => k.startsWith(prefix)) : keys;
  }
}
