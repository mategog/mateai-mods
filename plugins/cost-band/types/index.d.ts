export type Cost = { turns: number; total: number | null; last: number | null }

declare module 'claude-code' {
  interface PluginState {
    'cost-band': { cost: Cost }
  }
}
