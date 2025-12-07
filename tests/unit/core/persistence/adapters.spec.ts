import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIAdapter } from '../../../../packages/core/src/persistence/APIAdapter';
import { LocalStorageAdapter } from '../../../../packages/core/src/persistence/LocalStorageAdapter';
import type { SnapshotV1 } from '../../../../packages/core/src/persistence/PersistenceAdapter';

const mockSnapshot: SnapshotV1 = {
  version: 1,
  tiles: [{ id: 'tile-0' as any, x: 0, y: 0, width: 100, height: 100 }],
};

describe('APIAdapter', () => {
  let originalFetch: typeof global.fetch;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalFetch = global.fetch;
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('save', () => {
    it('sends PUT request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      await adapter.save('my-layout', mockSnapshot);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/layouts/my-layout',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(mockSnapshot),
        }),
      );
    });

    it('includes custom headers', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const adapter = new APIAdapter('https://api.example.com/layouts', {
        Authorization: 'Bearer token',
      });
      await adapter.save('my-layout', mockSnapshot);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          }),
        }),
      );
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const adapter = new APIAdapter('https://api.example.com/layouts');

      await expect(adapter.save('my-layout', mockSnapshot)).rejects.toThrow('API save failed: 500');
    });

    it('encodes key in URL', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      await adapter.save('my layout/special', mockSnapshot);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/layouts/my%20layout%2Fspecial',
        expect.any(Object),
      );
    });

    it('handles trailing slash in base URL', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const adapter = new APIAdapter('https://api.example.com/layouts/');
      await adapter.save('key', mockSnapshot);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/layouts/key',
        expect.any(Object),
      );
    });
  });

  describe('load', () => {
    it('fetches and parses JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSnapshot),
      });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      const result = await adapter.load('my-layout');

      expect(result).toEqual(mockSnapshot);
    });

    it('returns null for 404 response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      const result = await adapter.load('nonexistent');

      expect(result).toBeNull();
    });

    it('throws on other non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

      const adapter = new APIAdapter('https://api.example.com/layouts');

      await expect(adapter.load('forbidden')).rejects.toThrow('API load failed: 403');
    });

    it('includes custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSnapshot),
      });

      const adapter = new APIAdapter('https://api.example.com/layouts', { 'X-Custom': 'value' });
      await adapter.load('my-layout');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'X-Custom': 'value' }),
        }),
      );
    });
  });

  describe('list', () => {
    it('fetches list of keys', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(['key1', 'key2']),
      });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      const result = await adapter.list();

      expect(result).toEqual(['key1', 'key2']);
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/layouts', expect.any(Object));
    });

    it('includes prefix in query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(['prefix-key1']),
      });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      await adapter.list('prefix');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/layouts?prefix=prefix',
        expect.any(Object),
      );
    });

    it('encodes prefix in query string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const adapter = new APIAdapter('https://api.example.com/layouts');
      await adapter.list('my prefix/special');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/layouts?prefix=my%20prefix%2Fspecial',
        expect.any(Object),
      );
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const adapter = new APIAdapter('https://api.example.com/layouts');

      await expect(adapter.list()).rejects.toThrow('API list failed: 500');
    });
  });
});

describe('LocalStorageAdapter', () => {
  let mockStorage: Map<string, string>;

  beforeEach(() => {
    mockStorage = new Map();

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => mockStorage.set(key, value),
      key: (index: number) => Array.from(mockStorage.keys())[index] ?? null,
      get length() {
        return mockStorage.size;
      },
      removeItem: (key: string) => mockStorage.delete(key),
      clear: () => mockStorage.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('save', () => {
    it('saves snapshot with namespaced key', async () => {
      const adapter = new LocalStorageAdapter('myapp');
      await adapter.save('layout1', mockSnapshot);

      expect(mockStorage.get('myapp:layout1')).toBe(JSON.stringify(mockSnapshot));
    });

    it('uses default namespace', async () => {
      const adapter = new LocalStorageAdapter();
      await adapter.save('layout1', mockSnapshot);

      expect(mockStorage.get('dashboarding:layout1')).toBe(JSON.stringify(mockSnapshot));
    });
  });

  describe('load', () => {
    it('loads and parses snapshot', async () => {
      mockStorage.set('dashboarding:layout1', JSON.stringify(mockSnapshot));

      const adapter = new LocalStorageAdapter();
      const result = await adapter.load('layout1');

      expect(result).toEqual(mockSnapshot);
    });

    it('returns null for non-existent key', async () => {
      const adapter = new LocalStorageAdapter();
      const result = await adapter.load('nonexistent');

      expect(result).toBeNull();
    });

    it('respects custom namespace', async () => {
      mockStorage.set('custom:layout1', JSON.stringify(mockSnapshot));

      const adapter = new LocalStorageAdapter('custom');
      const result = await adapter.load('layout1');

      expect(result).toEqual(mockSnapshot);
    });
  });

  describe('list', () => {
    it('lists all keys in namespace', async () => {
      mockStorage.set('dashboarding:layout1', '{}');
      mockStorage.set('dashboarding:layout2', '{}');
      mockStorage.set('other:layout3', '{}');

      const adapter = new LocalStorageAdapter();
      const result = await adapter.list();

      expect(result).toContain('layout1');
      expect(result).toContain('layout2');
      expect(result).not.toContain('layout3');
    });

    it('filters by prefix', async () => {
      mockStorage.set('dashboarding:project-a', '{}');
      mockStorage.set('dashboarding:project-b', '{}');
      mockStorage.set('dashboarding:other', '{}');

      const adapter = new LocalStorageAdapter();
      const result = await adapter.list('project');

      expect(result).toContain('project-a');
      expect(result).toContain('project-b');
      expect(result).not.toContain('other');
    });

    it('returns empty array when no matching keys', async () => {
      const adapter = new LocalStorageAdapter();
      const result = await adapter.list('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
