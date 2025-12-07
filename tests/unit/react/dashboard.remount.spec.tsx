import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { DashboardModel } from '@pebbledash/core';
import { Dashboard } from '@pebbledash/react';

describe('Dashboard (React)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  it('mounts, unmounts, and remounts without errors', async () => {
    const model = new DashboardModel();
    await model.initialize();
    expect(() => {
      root.render(React.createElement(Dashboard, { model }));
    }).not.toThrow();
    root.unmount();
    expect(() => {
      root = createRoot(container);
      root.render(React.createElement(Dashboard, { model }));
    }).not.toThrow();
  });
});
