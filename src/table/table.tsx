import { AnComponent, AnConfig, AnOption, AnPlugin, AnState, applyConfigTo, DeepPartial } from '../core'

export interface AnTablePlugin extends AnPlugin<AnTable, UseTableOptions, AnTableConfig> {}
export interface AnTableConfig extends AnConfig<AnTablePlugin> {}
export interface AnTableState extends AnState {}
export interface UseTableOptions extends AnOption<AnTablePlugin, AnTableConfig> {}
export const defineTablePlugin = (plugin: AnTablePlugin) => plugin
export class AnTable extends AnComponent<UseTableOptions, AnTableState, AnTableConfig, AnTablePlugin> {
  static readonly config: AnTableConfig
  static readonly usePlugin: (...plugins: AnTablePlugin[]) => void
  static readonly setConfig: (config: DeepPartial<AnTableConfig>) => void
  static {
    applyConfigTo(this)
  }
}
