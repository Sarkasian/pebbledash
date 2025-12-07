import type { DashboardModel } from '@pebbledash/core';
import type { DomRenderer, WidgetRegistry } from '@pebbledash/renderer-dom';

export class UDDashboard extends HTMLElement {
  #renderer?: DomRenderer;
  #model?: DashboardModel;
  #widgets?: WidgetRegistry;

  set model(m: DashboardModel | undefined) {
    this.#model = m;
    if (this.isConnected && m) {
      this.mount();
    }
  }
  get model() {
    return this.#model;
  }

  /** Registry of widget factories keyed by widget type */
  set widgets(w: WidgetRegistry | undefined) {
    this.#widgets = w;
    // Re-mount if already connected with a model
    if (this.isConnected && this.#model) {
      this.#renderer?.unmount();
      this.mount();
    }
  }
  get widgets() {
    return this.#widgets;
  }

  connectedCallback() {
    this.style.display = 'block';
    if (this.#model) this.mount();
  }

  disconnectedCallback() {
    this.#renderer?.unmount();
    this.#renderer = undefined;
  }

  private async mount() {
    if (!this.#model) return;
    // Import renderer package (dev alias maps to source via Vite in the demo)
    const { DomRenderer } = await import('@pebbledash/renderer-dom');
    this.#renderer = new DomRenderer({
      container: this,
      widgets: this.#widgets,
    });
    this.#renderer.mount(this.#model);
  }
}

customElements.define('ud-dashboard', UDDashboard);

// Re-export widget types for convenience
export type {
  Widget,
  WidgetFactory,
  WidgetRegistry,
  WidgetContext,
} from '@pebbledash/renderer-dom';
