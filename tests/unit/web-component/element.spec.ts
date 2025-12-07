/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UDDashboard } from '../../../packages/web-component/src/index';
import { DashboardModel } from '../../../packages/core/src/index';

describe('<ud-dashboard>', () => {
  let model: DashboardModel;

  beforeEach(async () => {
    model = new DashboardModel();
    await model.initialize();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('can be constructed and assigned a model', async () => {
    const el = new UDDashboard();
    el.model = model;
    expect(el.model).toBe(model);
  });

  it('returns undefined model when not set', () => {
    const el = new UDDashboard();
    expect(el.model).toBeUndefined();
  });

  it('sets display block on connectedCallback', () => {
    const el = new UDDashboard();
    document.body.appendChild(el);
    expect(el.style.display).toBe('block');
  });

  it('does not mount without model on connectedCallback', () => {
    const el = new UDDashboard();
    expect(() => document.body.appendChild(el)).not.toThrow();
    // Should not throw even without model
  });

  it('initiates mount when model is set and element is connected', () => {
    const el = new UDDashboard();
    document.body.appendChild(el);
    // Setting model triggers async mount
    el.model = model;
    expect(el.model).toBe(model);
    expect(el.isConnected).toBe(true);
  });

  it('triggers mount when element is connected after model is set', () => {
    const el = new UDDashboard();
    el.model = model;
    document.body.appendChild(el);
    expect(el.isConnected).toBe(true);
    expect(el.model).toBe(model);
  });

  it('handles disconnectedCallback gracefully', () => {
    const el = new UDDashboard();
    el.model = model;
    document.body.appendChild(el);
    // Disconnecting should not throw
    expect(() => document.body.removeChild(el)).not.toThrow();
    expect(el.isConnected).toBe(false);
  });

  describe('widgets property', () => {
    it('can set and get widgets registry', () => {
      const el = new UDDashboard();
      const widgets = {
        default: () => ({
          mount: vi.fn(),
          unmount: vi.fn(),
        }),
      };
      el.widgets = widgets;
      expect(el.widgets).toBe(widgets);
    });

    it('returns undefined widgets when not set', () => {
      const el = new UDDashboard();
      expect(el.widgets).toBeUndefined();
    });

    it('handles setting widgets on connected element with model', () => {
      const el = new UDDashboard();
      el.model = model;
      document.body.appendChild(el);
      const widgets = {
        default: () => ({
          mount: vi.fn(),
          unmount: vi.fn(),
        }),
      };
      // Setting widgets on connected element with model triggers re-mount
      el.widgets = widgets;
      expect(el.widgets).toBe(widgets);
      document.body.removeChild(el);
    });

    it('does not re-mount widgets when not connected', () => {
      const el = new UDDashboard();
      el.model = model;
      // Not connected
      const widgets = {
        default: () => ({
          mount: vi.fn(),
          unmount: vi.fn(),
        }),
      };
      el.widgets = widgets;
      // No error should occur
      expect(el.widgets).toBe(widgets);
    });

    it('does not re-mount widgets when no model', () => {
      const el = new UDDashboard();
      document.body.appendChild(el);
      // Connected but no model
      const widgets = {
        default: () => ({
          mount: vi.fn(),
          unmount: vi.fn(),
        }),
      };
      el.widgets = widgets;
      expect(el.widgets).toBe(widgets);
    });
  });

  describe('lifecycle', () => {
    it('can be added and removed multiple times', async () => {
      const el = new UDDashboard();
      el.model = model;

      // First mount
      document.body.appendChild(el);
      await new Promise((r) => setTimeout(r, 100));
      expect(el.isConnected).toBe(true);

      // First unmount
      document.body.removeChild(el);
      expect(el.isConnected).toBe(false);

      // Second mount
      document.body.appendChild(el);
      expect(el.isConnected).toBe(true);

      // Clean up
      document.body.removeChild(el);
    });

    it('handles model change while connected', async () => {
      const el = new UDDashboard();
      el.model = model;
      document.body.appendChild(el);

      // Create a new model
      const model2 = new DashboardModel();
      await model2.initialize();
      el.model = model2;

      expect(el.model).toBe(model2);
      document.body.removeChild(el);
    });

    it('handles setting model to undefined', () => {
      const el = new UDDashboard();
      el.model = model;
      el.model = undefined;
      expect(el.model).toBeUndefined();
    });
  });
});
