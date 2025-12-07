import { Plugin } from './Plugin.js';

export class PluginManager<M = unknown> {
  private readonly plugins: Plugin[] = [];
  constructor(private readonly model: M) {}
  register(p: Plugin) {
    this.plugins.push(p);
  }
  initializeAll() {
    for (const p of this.plugins) p.initialize(this.model);
  }
  cleanupAll() {
    for (const p of this.plugins) p.cleanup();
  }
}
