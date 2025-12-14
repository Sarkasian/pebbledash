import type { PersistenceAdapter, Snapshot } from './PersistenceAdapter.js';

export class LocalStorageAdapter implements PersistenceAdapter {
  constructor(private readonly namespace = 'dashboarding') {}
  private key(k: string) {
    return `${this.namespace}:${k}`;
  }
  async save(key: string, snapshot: Snapshot): Promise<void> {
    localStorage.setItem(this.key(key), JSON.stringify(snapshot));
  }
  async load(key: string): Promise<Snapshot | null> {
    const s = localStorage.getItem(this.key(key));
    return s ? (JSON.parse(s) as Snapshot) : null;
  }
  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    const p = this.namespace + ':' + (prefix ?? '');
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(p)) keys.push(k.substring(this.namespace.length + 1));
    }
    return keys;
  }
}
