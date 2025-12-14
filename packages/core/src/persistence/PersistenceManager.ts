import type { Snapshot, PersistenceAdapter } from './PersistenceAdapter.js';

export class PersistenceManager {
  constructor(private adapter: PersistenceAdapter) {}
  setAdapter(a: PersistenceAdapter) {
    this.adapter = a;
  }
  async save(key: string, snapshot: Snapshot) {
    await this.adapter.save(key, snapshot);
  }
  async load(key: string) {
    return this.adapter.load(key);
  }
  async list(prefix?: string) {
    return this.adapter.list(prefix);
  }
}
