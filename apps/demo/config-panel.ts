import type { BaseDashboard } from '@pebbledash/renderer-dom';
import type { ExtendedConfig, PartialExtendedConfig } from '@pebbledash/core';
import { DEFAULT_CONFIG, createConfig } from '@pebbledash/core';

/**
 * Configuration panel UI for the demo app.
 * Provides a simple form interface for all configuration options.
 */
export class ConfigPanel {
  private container: HTMLElement;
  private dashboard: BaseDashboard;
  private panel: HTMLElement | null = null;
  private isOpen = false;
  private previewActive = false;

  constructor(container: HTMLElement, dashboard: BaseDashboard) {
    this.container = container;
    this.dashboard = dashboard;
  }

  /**
   * Toggle the config panel visibility.
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the config panel.
   */
  open(): void {
    if (this.isOpen) return;

    this.panel = this.createPanel();
    this.container.appendChild(this.panel);
    this.isOpen = true;

    // Add keyboard listener for Escape
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Close the config panel.
   */
  close(): void {
    if (!this.isOpen) return;

    // End any active preview
    if (this.previewActive) {
      this.dashboard.endConfigPreview();
      this.previewActive = false;
    }

    this.panel?.remove();
    this.panel = null;
    this.isOpen = false;

    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.close();
    }
  };

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'ud-config-panel';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      height: 100vh;
      background: #ffffff;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      color: #333;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Dashboard Configuration';
    title.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600;';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      border: none;
      background: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      line-height: 1;
    `;
    closeBtn.addEventListener('click', () => this.close());
    header.appendChild(closeBtn);

    panel.appendChild(header);

    // Body (scrollable)
    const body = document.createElement('div');
    body.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    `;

    // Get current config
    const model = this.dashboard.getModel();
    const configManager = model.getConfigManager('demo');
    const currentConfig = configManager.getConfig();

    // Create form sections
    body.appendChild(
      this.createSection('Layout Constraints', [
        this.createNumberInput(
          'minTile.width',
          'Min Tile Width (%)',
          currentConfig.minTile.width,
          1,
          50,
        ),
        this.createNumberInput(
          'minTile.height',
          'Min Tile Height (%)',
          currentConfig.minTile.height,
          1,
          50,
        ),
        this.createNumberInput('maxTiles', 'Max Tiles', currentConfig.maxTiles ?? 0, 0, 100, true),
      ]),
    );

    body.appendChild(
      this.createSection('Visual Settings', [
        this.createNumberInput('gutter', 'Gutter (px)', currentConfig.gutter, 0, 20),
        this.createNumberInput(
          'border.width',
          'Border Width (px)',
          currentConfig.border.width,
          0,
          10,
        ),
        this.createSelect('border.style', 'Border Style', currentConfig.border.style, [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'none', label: 'None' },
        ]),
        this.createColorInput('border.color', 'Border Color', currentConfig.border.color),
      ]),
    );

    body.appendChild(
      this.createSection('Animation', [
        this.createCheckbox(
          'animation.enabled',
          'Enable Animations',
          currentConfig.animation.enabled,
        ),
        this.createNumberInput(
          'animation.duration',
          'Duration (ms)',
          currentConfig.animation.duration,
          0,
          2000,
        ),
        this.createTextInput('animation.easing', 'Easing', currentConfig.animation.easing),
      ]),
    );

    body.appendChild(
      this.createSection('Behavior', [
        this.createNumberInput(
          'snapThresholds.resize',
          'Resize Snap (%)',
          currentConfig.snapThresholds.resize,
          0,
          10,
        ),
        this.createNumberInput(
          'snapThresholds.grid',
          'Grid Snap (%)',
          currentConfig.snapThresholds.grid ?? 0,
          0,
          25,
          true,
        ),
        this.createSelect('interactionMode', 'Interaction Mode', currentConfig.interactionMode, [
          { value: 'insert', label: 'Insert' },
          { value: 'resize', label: 'Resize' },
          { value: 'locked', label: 'Locked' },
        ]),
      ]),
    );

    body.appendChild(
      this.createSection('Tile Defaults', [
        this.createNumberInput(
          'tileDefaults.maxWidth',
          'Max Width (%)',
          currentConfig.tileDefaults.maxWidth ?? 100,
          10,
          100,
        ),
        this.createNumberInput(
          'tileDefaults.maxHeight',
          'Max Height (%)',
          currentConfig.tileDefaults.maxHeight ?? 100,
          10,
          100,
        ),
      ]),
    );

    panel.appendChild(body);

    // Footer with actions
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 16px 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      background: #f8f9fa;
    `;

    const previewBtn = document.createElement('button');
    previewBtn.textContent = 'Preview';
    previewBtn.style.cssText = this.getButtonStyle('secondary');
    previewBtn.addEventListener('click', () => this.togglePreview());
    footer.appendChild(previewBtn);

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = this.getButtonStyle('primary');
    applyBtn.addEventListener('click', () => this.applyConfig());
    footer.appendChild(applyBtn);

    const revertBtn = document.createElement('button');
    revertBtn.textContent = 'Reset';
    revertBtn.style.cssText = this.getButtonStyle('danger');
    revertBtn.addEventListener('click', () => this.resetConfig());
    footer.appendChild(revertBtn);

    panel.appendChild(footer);

    return panel;
  }

  private createSection(title: string, inputs: HTMLElement[]): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom: 24px;';

    const heading = document.createElement('h3');
    heading.textContent = title;
    heading.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
    `;
    section.appendChild(heading);

    for (const input of inputs) {
      section.appendChild(input);
    }

    return section;
  }

  private createNumberInput(
    path: string,
    label: string,
    value: number,
    min: number,
    max: number,
    optional = false,
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 12px;';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display: block; margin-bottom: 4px; font-weight: 500;';
    wrapper.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = 'number';
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
    input.dataset.path = path;
    input.dataset.optional = String(optional);
    input.style.cssText = this.getInputStyle();
    wrapper.appendChild(input);

    return wrapper;
  }

  private createTextInput(path: string, label: string, value: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 12px;';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display: block; margin-bottom: 4px; font-weight: 500;';
    wrapper.appendChild(labelEl);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.dataset.path = path;
    input.style.cssText = this.getInputStyle();
    wrapper.appendChild(input);

    return wrapper;
  }

  private createColorInput(path: string, label: string, value: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 12px;';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display: block; margin-bottom: 4px; font-weight: 500;';
    wrapper.appendChild(labelEl);

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = 'display: flex; gap: 8px;';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = value;
    colorInput.dataset.path = path;
    colorInput.style.cssText =
      'width: 40px; height: 32px; padding: 0; border: 1px solid #ddd; cursor: pointer;';
    inputWrapper.appendChild(colorInput);

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = value;
    textInput.style.cssText = this.getInputStyle() + 'flex: 1;';
    textInput.addEventListener('input', () => {
      colorInput.value = textInput.value;
    });
    colorInput.addEventListener('input', () => {
      textInput.value = colorInput.value;
    });
    inputWrapper.appendChild(textInput);

    wrapper.appendChild(inputWrapper);

    return wrapper;
  }

  private createSelect(
    path: string,
    label: string,
    value: string,
    options: Array<{ value: string; label: string }>,
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 12px;';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = 'display: block; margin-bottom: 4px; font-weight: 500;';
    wrapper.appendChild(labelEl);

    const select = document.createElement('select');
    select.dataset.path = path;
    select.style.cssText = this.getInputStyle();

    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      option.selected = opt.value === value;
      select.appendChild(option);
    }

    wrapper.appendChild(select);

    return wrapper;
  }

  private createCheckbox(path: string, label: string, checked: boolean): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom: 12px; display: flex; align-items: center; gap: 8px;';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.dataset.path = path;
    input.id = `config-${path}`;
    wrapper.appendChild(input);

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.htmlFor = `config-${path}`;
    labelEl.style.cssText = 'font-weight: 500; cursor: pointer;';
    wrapper.appendChild(labelEl);

    return wrapper;
  }

  private getInputStyle(): string {
    return `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    `;
  }

  private getButtonStyle(variant: 'primary' | 'secondary' | 'danger'): string {
    const base = `
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `;

    switch (variant) {
      case 'primary':
        return base + 'background: #4285f4; color: white;';
      case 'secondary':
        return base + 'background: #e0e0e0; color: #333;';
      case 'danger':
        return base + 'background: #f44336; color: white;';
    }
  }

  private getFormValues(): PartialExtendedConfig {
    if (!this.panel) return {};

    const values: Record<string, unknown> = {};

    // Get all inputs
    const inputs = this.panel.querySelectorAll('input, select');
    for (const input of inputs) {
      const el = input as HTMLInputElement | HTMLSelectElement;
      const path = el.dataset.path;
      if (!path) continue;

      let value: unknown;
      if (el.type === 'checkbox') {
        value = (el as HTMLInputElement).checked;
      } else if (el.type === 'number') {
        const num = parseFloat(el.value);
        const optional = el.dataset.optional === 'true';
        if (optional && (isNaN(num) || num === 0)) {
          value = undefined;
        } else {
          value = num;
        }
      } else {
        value = el.value;
      }

      // Set nested value
      this.setNestedValue(values, path, value);
    }

    return values as PartialExtendedConfig;
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  private togglePreview(): void {
    if (this.previewActive) {
      this.dashboard.endConfigPreview();
      this.previewActive = false;
    } else {
      const values = this.getFormValues();
      this.dashboard.startConfigPreview(values);
      this.previewActive = true;
    }

    // Update button text
    const previewBtn = this.panel?.querySelector('button');
    if (previewBtn) {
      previewBtn.textContent = this.previewActive ? 'Hide Preview' : 'Preview';
    }
  }

  private async applyConfig(): Promise<void> {
    const model = this.dashboard.getModel();
    const configManager = model.getConfigManager('demo');

    // End preview first
    if (this.previewActive) {
      this.dashboard.endConfigPreview();
      this.previewActive = false;
    }

    const values = this.getFormValues();
    const result = await configManager.setConfig(values);

    if (result.success) {
      // Show success feedback
      this.showToast('Configuration applied successfully!', 'success');

      // Update the interaction mode in the dashboard if it changed
      if (values.interactionMode) {
        const mode = values.interactionMode as 'insert' | 'resize';
        if (mode !== 'locked') {
          this.dashboard.setMode(mode);
        }
      }
    } else {
      // Show error feedback
      this.showToast(`Error: ${result.error ?? 'Unknown error'}`, 'error');
    }
  }

  private resetConfig(): void {
    // End preview first
    if (this.previewActive) {
      this.dashboard.endConfigPreview();
      this.previewActive = false;
    }

    // Reset form to defaults
    if (this.panel) {
      const inputs = this.panel.querySelectorAll('input, select');
      for (const input of inputs) {
        const el = input as HTMLInputElement | HTMLSelectElement;
        const path = el.dataset.path;
        if (!path) continue;

        const defaultValue = this.getNestedValue(DEFAULT_CONFIG as Record<string, unknown>, path);
        if (defaultValue !== undefined) {
          if (el.type === 'checkbox') {
            (el as HTMLInputElement).checked = Boolean(defaultValue);
          } else {
            el.value = String(defaultValue ?? '');
          }
        }
      }
    }

    this.showToast('Configuration reset to defaults', 'info');
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 2000;
      animation: fadeInOut 3s ease-in-out forwards;
    `;

    switch (type) {
      case 'success':
        toast.style.background = '#4CAF50';
        break;
      case 'error':
        toast.style.background = '#f44336';
        break;
      case 'info':
        toast.style.background = '#2196F3';
        break;
    }

    // Add animation keyframes if not already added
    if (!document.querySelector('#ud-toast-style')) {
      const style = document.createElement('style');
      style.id = 'ud-toast-style';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          90% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

/**
 * Create a settings button that opens the config panel.
 */
export function createConfigButton(container: HTMLElement, dashboard: BaseDashboard): HTMLElement {
  const panel = new ConfigPanel(document.body, dashboard);

  const btn = document.createElement('button');
  btn.innerHTML = '⚙️';
  btn.title = 'Dashboard Configuration (Ctrl+,)';
  btn.style.cssText = `
    position: fixed;
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    font-size: 20px;
    cursor: pointer;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  });

  btn.addEventListener('click', () => panel.toggle());

  // Add keyboard shortcut (Ctrl+,)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      panel.toggle();
    }
  });

  container.appendChild(btn);
  return btn;
}
