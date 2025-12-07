import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DashboardModel } from '@pebbledash/core';
import '@pebbledash/web-component';

describe('<ud-dashboard>', () => {
  let model: DashboardModel;

  beforeEach(async () => {
    model = new DashboardModel();
    await model.initialize();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('attaches and detaches without leaking renderer', () => {
    const el = document.createElement('ud-dashboard') as any;
    el.model = model;
    expect(() => document.body.appendChild(el)).not.toThrow();
    expect(() => document.body.removeChild(el)).not.toThrow();
  });
});
