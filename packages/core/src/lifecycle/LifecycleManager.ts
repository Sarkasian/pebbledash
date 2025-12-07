type Hook = (ctx: unknown) => boolean | void | Promise<boolean | void>;

export class LifecycleManager {
  private readonly map = new Map<string, Set<Hook>>();
  on(event: string, cb: Hook): () => void {
    const set = this.map.get(event) ?? new Set<Hook>();
    set.add(cb);
    this.map.set(event, set);
    return () => set.delete(cb);
  }
  async emit(event: string, ctx: unknown): Promise<boolean> {
    const set = this.map.get(event);
    if (!set) return true;
    for (const cb of set) {
      const res = await cb(ctx);
      if (res === false) return false;
    }
    return true;
  }
}
