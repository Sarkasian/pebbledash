export abstract class Plugin {
  constructor(
    public readonly name: string,
    public readonly version: string,
  ) {}
  initialize(_model: unknown): void {}
  cleanup(): void {}
}
