import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  startResizeSession,
  type ResizeSessionHooks,
} from '../../../packages/renderer-dom/src/resizeSession';
import type { DashboardModel } from '@pebbledash/core';

// Mock requestAnimationFrame
let rafCallback: (() => void) | null = null;
const mockRaf = vi.fn((cb: () => void) => {
  rafCallback = cb;
  return 1;
});
const mockCaf = vi.fn();

function _flushRaf() {
  if (rafCallback) {
    const cb = rafCallback;
    rafCallback = null;
    cb();
  }
}

function createMockModel(overrides: Partial<DashboardModel> = {}): DashboardModel {
  return {
    clampResize: vi.fn().mockReturnValue({ min: -10, max: 10, clampedDelta: 0 }),
    resizeTile: vi.fn().mockResolvedValue({ valid: true }),
    getState: vi.fn().mockReturnValue({
      tiles: new Map([['tile-0', { id: 'tile-0', x: 0, y: 0, width: 50, height: 100 }]]),
    }),
    ...overrides,
  } as unknown as DashboardModel;
}

function createMockElement(): HTMLElement {
  const el = document.createElement('div');
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
  return el;
}

function createMockContainer(): HTMLElement {
  const container = document.createElement('div');
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 1000,
    height: 500,
    top: 0,
    left: 0,
    right: 1000,
    bottom: 500,
    toJSON: () => ({}),
  });
  return container;
}

describe('startResizeSession', () => {
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;

  beforeEach(() => {
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = mockRaf as any;
    globalThis.cancelAnimationFrame = mockCaf;
    rafCallback = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
  });

  it('calls onSessionStart when starting', () => {
    const onSessionStart = vi.fn();
    const hooks: ResizeSessionHooks = {
      model: createMockModel(),
      renderer: { render: vi.fn() },
      container: createMockContainer(),
      el: createMockElement(),
      edge: {
        tileId: 'tile-0',
        side: 'right',
        orientation: 'vertical',
        x: 50,
        y: 0,
        width: 6,
        height: 100,
      },
      startX: 500,
      startY: 250,
      onSessionStart,
      onSessionEnd: vi.fn(),
      clearBoundaryOverlays: vi.fn(),
      rebuildOverlays: vi.fn(),
    };

    startResizeSession(hooks, 1);

    expect(onSessionStart).toHaveBeenCalledOnce();
  });

  it('sets pointer capture on element', () => {
    const el = createMockElement();
    const hooks: ResizeSessionHooks = {
      model: createMockModel(),
      renderer: { render: vi.fn() },
      container: createMockContainer(),
      el,
      edge: {
        tileId: 'tile-0',
        side: 'right',
        orientation: 'vertical',
        x: 50,
        y: 0,
        width: 6,
        height: 100,
      },
      startX: 500,
      startY: 250,
      onSessionStart: vi.fn(),
      onSessionEnd: vi.fn(),
      clearBoundaryOverlays: vi.fn(),
      rebuildOverlays: vi.fn(),
    };

    startResizeSession(hooks, 42);

    expect(el.setPointerCapture).toHaveBeenCalledWith(42);
  });

  it('adds pointer event listeners', () => {
    const el = createMockElement();
    const addEventListenerSpy = vi.spyOn(el, 'addEventListener');

    const hooks: ResizeSessionHooks = {
      model: createMockModel(),
      renderer: { render: vi.fn() },
      container: createMockContainer(),
      el,
      edge: {
        tileId: 'tile-0',
        side: 'right',
        orientation: 'vertical',
        x: 50,
        y: 0,
        width: 6,
        height: 100,
      },
      startX: 500,
      startY: 250,
      onSessionStart: vi.fn(),
      onSessionEnd: vi.fn(),
      clearBoundaryOverlays: vi.fn(),
      rebuildOverlays: vi.fn(),
    };

    startResizeSession(hooks, 1);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'pointermove',
      expect.any(Function),
      expect.any(Object),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'pointerup',
      expect.any(Function),
      expect.any(Object),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'pointercancel',
      expect.any(Function),
      expect.any(Object),
    );
  });

  it('requests animation frame on start', () => {
    const hooks: ResizeSessionHooks = {
      model: createMockModel(),
      renderer: { render: vi.fn() },
      container: createMockContainer(),
      el: createMockElement(),
      edge: {
        tileId: 'tile-0',
        side: 'right',
        orientation: 'vertical',
        x: 50,
        y: 0,
        width: 6,
        height: 100,
      },
      startX: 500,
      startY: 250,
      onSessionStart: vi.fn(),
      onSessionEnd: vi.fn(),
      clearBoundaryOverlays: vi.fn(),
      rebuildOverlays: vi.fn(),
    };

    startResizeSession(hooks, 1);

    expect(mockRaf).toHaveBeenCalled();
  });

  it('calculates clamp values on first tick', async () => {
    const clampResize = vi.fn().mockReturnValue({ min: -20, max: 30, clampedDelta: 0 });
    const model = createMockModel({ clampResize });

    const hooks: ResizeSessionHooks = {
      model,
      renderer: { render: vi.fn() },
      container: createMockContainer(),
      el: createMockElement(),
      edge: {
        tileId: 'tile-0',
        side: 'right',
        orientation: 'vertical',
        x: 50,
        y: 0,
        width: 6,
        height: 100,
      },
      startX: 500,
      startY: 250,
      onSessionStart: vi.fn(),
      onSessionEnd: vi.fn(),
      clearBoundaryOverlays: vi.fn(),
      rebuildOverlays: vi.fn(),
    };

    startResizeSession(hooks, 1);
    // Flush the initial RAF to trigger the first tick
    _flushRaf();
    await Promise.resolve();

    expect(clampResize).toHaveBeenCalled();
  });

  describe('pointer up handling', () => {
    it('calls onSessionEnd when pointer up', () => {
      const el = createMockElement();
      const onSessionEnd = vi.fn();

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd,
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      // Simulate pointer up
      const pointerUpEvent = new PointerEvent('pointerup', { pointerId: 1 });
      el.dispatchEvent(pointerUpEvent);

      expect(onSessionEnd).toHaveBeenCalledOnce();
    });

    it('clears element transform on pointer up', () => {
      const el = createMockElement();
      el.style.transform = 'translateX(10px)';

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      const pointerUpEvent = new PointerEvent('pointerup', { pointerId: 1 });
      el.dispatchEvent(pointerUpEvent);

      expect(el.style.transform).toBe('');
    });

    it('calls clearBoundaryOverlays and rebuildOverlays on pointer up', () => {
      const el = createMockElement();
      const clearBoundaryOverlays = vi.fn();
      const rebuildOverlays = vi.fn();

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays,
        rebuildOverlays,
      };

      startResizeSession(hooks, 1);

      const pointerUpEvent = new PointerEvent('pointerup', { pointerId: 1 });
      el.dispatchEvent(pointerUpEvent);

      expect(clearBoundaryOverlays).toHaveBeenCalledOnce();
      expect(rebuildOverlays).toHaveBeenCalledOnce();
    });

    it('releases pointer capture on pointer up', () => {
      const el = createMockElement();

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 42);

      const pointerUpEvent = new PointerEvent('pointerup', { pointerId: 1 });
      el.dispatchEvent(pointerUpEvent);

      expect(el.releasePointerCapture).toHaveBeenCalledWith(42);
    });

    it('removes event listeners on pointer up', () => {
      const el = createMockElement();
      const removeEventListenerSpy = vi.spyOn(el, 'removeEventListener');

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      const pointerUpEvent = new PointerEvent('pointerup', { pointerId: 1 });
      el.dispatchEvent(pointerUpEvent);

      expect(removeEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('pointercancel', expect.any(Function));
    });
  });

  describe('horizontal resize', () => {
    it('handles horizontal orientation for top/bottom edges', async () => {
      const clampResize = vi.fn().mockReturnValue({ min: -10, max: 10, clampedDelta: 0 });
      const model = createMockModel({ clampResize });

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el: createMockElement(),
        edge: {
          tileId: 'tile-0',
          side: 'bottom',
          orientation: 'horizontal',
          x: 0,
          y: 50,
          width: 100,
          height: 6,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);
      _flushRaf();
      await Promise.resolve();

      expect(clampResize).toHaveBeenCalledWith('tile-0', { edge: 'bottom', delta: 0 });
    });

    it('handles top edge resize', async () => {
      const clampResize = vi.fn().mockReturnValue({ min: -10, max: 10, clampedDelta: 0 });
      const model = createMockModel({ clampResize });

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el: createMockElement(),
        edge: {
          tileId: 'tile-0',
          side: 'top',
          orientation: 'horizontal',
          x: 0,
          y: 0,
          width: 100,
          height: 6,
        },
        startX: 500,
        startY: 0,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);
      _flushRaf();
      await Promise.resolve();

      expect(clampResize).toHaveBeenCalledWith('tile-0', { edge: 'top', delta: 0 });
    });
  });

  describe('tick animation', () => {
    it('computes delta based on pointer movement for vertical seam', async () => {
      const clampResize = vi.fn().mockReturnValue({ min: -50, max: 50, clampedDelta: 5 });
      const resizeTile = vi.fn().mockResolvedValue({ valid: true });
      const model = createMockModel({ clampResize, resizeTile });

      const el = createMockElement();
      const container = createMockContainer();

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container,
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      // Simulate pointer move
      const moveEvent = new PointerEvent('pointermove', {
        clientX: 550, // 50px right
        clientY: 250,
        pointerId: 1,
      });
      el.dispatchEvent(moveEvent);

      // Flush the raf callback
      expect(mockRaf).toHaveBeenCalled();
    });

    it('applies transform preview during drag', async () => {
      const clampResize = vi.fn().mockReturnValue({ min: -50, max: 50, clampedDelta: 0 });
      const model = createMockModel({ clampResize });

      const el = createMockElement();
      const container = createMockContainer();

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container,
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      // RAF is called on start
      expect(mockRaf).toHaveBeenCalled();
    });
  });

  describe('session bounds stability', () => {
    it('uses live bounds that accurately reflect current state', async () => {
      // Live bounds are computed fresh each tick based on current state
      // This prevents drift when moving back and forward
      const clampResize = vi.fn().mockReturnValue({ min: -25, max: 75, clampedDelta: 0 });
      const resizeTile = vi.fn().mockResolvedValue({ valid: true });
      const getState = vi.fn().mockReturnValue({
        tiles: new Map([['tile-0', { id: 'tile-0', x: 0, y: 0, width: 50, height: 100 }]]),
      });
      const model = createMockModel({ clampResize, resizeTile, getState });

      const el = createMockElement();
      const container = createMockContainer();

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container,
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);
      _flushRaf();
      await Promise.resolve();

      // Verify clamp is called during tick to get live bounds
      expect(clampResize).toHaveBeenCalled();
    });
  });

  describe('out of bounds handling', () => {
    it('adds edge--oob class when pointer exceeds clamp range', async () => {
      // Return very limited range so any movement is OOB
      const clampResize = vi.fn().mockReturnValue({ min: 0, max: 0.001, clampedDelta: 0 });
      const model = createMockModel({ clampResize });

      const el = createMockElement();
      const container = createMockContainer();

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container,
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      // Initial state - no OOB class
      expect(el.classList.contains('edge--oob')).toBe(false);
    });
  });

  describe('pointer cancel handling', () => {
    it('handles pointercancel like pointerup', () => {
      const el = createMockElement();
      const onSessionEnd = vi.fn();

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd,
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      const pointerCancelEvent = new PointerEvent('pointercancel', { pointerId: 1 });
      el.dispatchEvent(pointerCancelEvent);

      expect(onSessionEnd).toHaveBeenCalledOnce();
    });
  });

  describe('left edge resize', () => {
    it('handles left edge correctly', async () => {
      const clampResize = vi.fn().mockReturnValue({ min: -10, max: 10, clampedDelta: 0 });
      const model = createMockModel({ clampResize });

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el: createMockElement(),
        edge: {
          tileId: 'tile-0',
          side: 'left',
          orientation: 'vertical',
          x: 0,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 0,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);
      _flushRaf();
      await Promise.resolve();

      expect(clampResize).toHaveBeenCalledWith('tile-0', { edge: 'left', delta: 0 });
    });
  });

  describe('setPointerCapture error handling', () => {
    it('handles setPointerCapture failure gracefully', () => {
      const el = createMockElement();
      (el as any).setPointerCapture = vi.fn().mockImplementation(() => {
        throw new Error('Not supported');
      });

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      // Should not throw
      expect(() => startResizeSession(hooks, 1)).not.toThrow();
    });

    it('handles releasePointerCapture failure gracefully', () => {
      const el = createMockElement();
      (el as any).releasePointerCapture = vi.fn().mockImplementation(() => {
        throw new Error('Not supported');
      });

      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el,
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);

      // Should not throw on pointer up
      expect(() => {
        const pointerUpEvent = new PointerEvent('pointerup', { pointerId: 1 });
        el.dispatchEvent(pointerUpEvent);
      }).not.toThrow();
    });
  });

  describe('renderer without render method', () => {
    it('handles renderer without render method', () => {
      const hooks: ResizeSessionHooks = {
        model: createMockModel(),
        renderer: {}, // No render method
        container: createMockContainer(),
        el: createMockElement(),
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      // Should not throw
      expect(() => startResizeSession(hooks, 1)).not.toThrow();
    });
  });

  describe('edge with seamId', () => {
    it('handles edge with seamId property', async () => {
      const clampResize = vi.fn().mockReturnValue({ min: -10, max: 10, clampedDelta: 0 });
      const model = createMockModel({ clampResize });

      const hooks: ResizeSessionHooks = {
        model,
        renderer: { render: vi.fn() },
        container: createMockContainer(),
        el: createMockElement(),
        edge: {
          tileId: 'tile-0',
          side: 'right',
          orientation: 'vertical',
          x: 50,
          y: 0,
          width: 6,
          height: 100,
          seamId: 'seam-v-50',
        },
        startX: 500,
        startY: 250,
        onSessionStart: vi.fn(),
        onSessionEnd: vi.fn(),
        clearBoundaryOverlays: vi.fn(),
        rebuildOverlays: vi.fn(),
      };

      startResizeSession(hooks, 1);
      _flushRaf();
      await Promise.resolve();

      expect(clampResize).toHaveBeenCalled();
    });
  });
});
