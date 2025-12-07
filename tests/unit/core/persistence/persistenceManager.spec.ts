import { describe, it, expect } from 'vitest';
import { PersistenceManager } from '../../../../packages/core/src/persistence/PersistenceManager';
import { MemoryAdapter } from '../../../../packages/core/src/persistence/MemoryAdapter';
import type { SnapshotV1 } from '../../../../packages/core/src/persistence/PersistenceAdapter';

const createSnapshot = (tiles: number): SnapshotV1 => ({
  version: 1,
  tiles: Array.from({ length: tiles }, (_, i) => ({
    id: `tile-${i}`,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  })),
});

describe('PersistenceManager', () => {
  describe('constructor', () => {
    it('creates a manager with an adapter', () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);
      expect(manager).toBeInstanceOf(PersistenceManager);
    });
  });

  describe('setAdapter', () => {
    it('changes the adapter used for persistence', async () => {
      const adapter1 = new MemoryAdapter();
      const adapter2 = new MemoryAdapter();
      const manager = new PersistenceManager(adapter1);

      const snapshot = createSnapshot(1);
      await manager.save('key1', snapshot);

      // Switch adapter
      manager.setAdapter(adapter2);

      // Key should not exist in new adapter
      const loaded = await manager.load('key1');
      expect(loaded).toBeNull();

      // Save to new adapter
      await manager.save('key2', snapshot);
      const loaded2 = await manager.load('key2');
      expect(loaded2).toEqual(snapshot);
    });
  });

  describe('save', () => {
    it('saves a snapshot with the given key', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);
      const snapshot = createSnapshot(2);

      await manager.save('my-dashboard', snapshot);

      const loaded = await adapter.load('my-dashboard');
      expect(loaded).toEqual(snapshot);
    });

    it('overwrites existing snapshots with the same key', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);
      const snapshot1 = createSnapshot(1);
      const snapshot2 = createSnapshot(3);

      await manager.save('key', snapshot1);
      await manager.save('key', snapshot2);

      const loaded = await manager.load('key');
      expect(loaded?.tiles).toHaveLength(3);
    });
  });

  describe('load', () => {
    it('loads a saved snapshot', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);
      const snapshot = createSnapshot(2);

      await manager.save('key', snapshot);
      const loaded = await manager.load('key');

      expect(loaded).toEqual(snapshot);
    });

    it('returns null for non-existent keys', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);

      const loaded = await manager.load('non-existent');
      expect(loaded).toBeNull();
    });
  });

  describe('list', () => {
    it('lists all saved keys', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);

      await manager.save('dashboard-1', createSnapshot(1));
      await manager.save('dashboard-2', createSnapshot(2));
      await manager.save('project-1', createSnapshot(1));

      const keys = await manager.list();
      expect(keys).toContain('dashboard-1');
      expect(keys).toContain('dashboard-2');
      expect(keys).toContain('project-1');
    });

    it('filters keys by prefix', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);

      await manager.save('dashboard-1', createSnapshot(1));
      await manager.save('dashboard-2', createSnapshot(2));
      await manager.save('project-1', createSnapshot(1));

      const keys = await manager.list('dashboard');
      expect(keys).toContain('dashboard-1');
      expect(keys).toContain('dashboard-2');
      expect(keys).not.toContain('project-1');
    });

    it('returns empty array when no keys match', async () => {
      const adapter = new MemoryAdapter();
      const manager = new PersistenceManager(adapter);

      await manager.save('dashboard-1', createSnapshot(1));

      const keys = await manager.list('nonexistent');
      expect(keys).toEqual([]);
    });
  });
});
