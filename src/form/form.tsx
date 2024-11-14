import { AnComponent, AnConfig, AnOption, AnPlugin, AnState, applyConfigTo, DeepPartial } from '../core'

export interface AnFormPlugin extends AnPlugin<AnForm, UseFormOptions, AnFormConfig> {}
export interface AnFormConfig extends AnConfig<AnFormPlugin, AnFormState> {}
export interface AnFormState extends AnState {}
export interface UseFormOptions extends AnOption<AnFormPlugin, AnFormConfig> {}
export const defineFormPlugin = (plugin: AnFormPlugin) => plugin
export class AnForm extends AnComponent<UseFormOptions, AnFormState, AnFormConfig, AnFormPlugin> {
  static readonly config: AnFormConfig
  static readonly usePlugin: (...plugins: AnFormPlugin[]) => void
  static readonly setConfig: (config: DeepPartial<AnFormConfig>) => void
  static readonly t: (value: string, ...args: any[]) => string
  static { applyConfigTo(this) }
}

