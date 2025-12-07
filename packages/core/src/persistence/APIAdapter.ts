import type { PersistenceAdapter, SnapshotV1 } from './PersistenceAdapter.js';

export class APIAdapter implements PersistenceAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly headers?: Record<string, string>,
  ) {}

  async save(key: string, snapshot: SnapshotV1): Promise<void> {
    const res = await fetch(this.url(key), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(this.headers ?? {}) },
      body: JSON.stringify(snapshot),
    });
    if (!res.ok) throw new Error(`API save failed: ${res.status}`);
  }
  async load(key: string): Promise<SnapshotV1 | null> {
    const res = await fetch(this.url(key), { headers: this.headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API load failed: ${res.status}`);
    return (await res.json()) as SnapshotV1;
  }
  async list(prefix?: string): Promise<string[]> {
    const url = this.baseUrl + (prefix ? `?prefix=${encodeURIComponent(prefix)}` : '');
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`API list failed: ${res.status}`);
    return (await res.json()) as string[];
  }

  private url(key: string) {
    return `${this.baseUrl.replace(/\/$/, '')}/${encodeURIComponent(key)}`;
  }
}
