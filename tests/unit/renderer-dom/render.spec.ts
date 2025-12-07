/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';
import { DomRenderer } from '../../../packages/renderer-dom/src/index';

describe('DomRenderer', () => {
  it('renders tiles as absolutely positioned divs', async () => {
    const container = document.createElement('div');
    const model = new DashboardModel();
    await model.initialize();
    const renderer = new DomRenderer({ container });
    renderer.mount(model);
    expect(container.querySelectorAll('.ud-tile').length).toBe(1);
  });
});
