import { AnCore, AnConfig, AnOption, AnPlugin, AnState, DeepPartial } from '../core'

export interface AnFormPlugin extends AnPlugin<AnForm, UseFormOptions, AnFormConfig> {}
export interface AnFormConfig extends AnConfig<AnFormPlugin> {}
export interface AnFormState extends AnState {}
export interface UseFormOptions extends AnOption<AnFormPlugin, AnFormConfig> {}
export const defineFormPlugin = (plugin: AnFormPlugin) => plugin

export class AnForm extends AnCore<UseFormOptions, AnFormState, AnFormConfig, AnFormPlugin> {
  static readonly config = {} as AnFormConfig
  static readonly setConfig: (config: DeepPartial<AnFormConfig>) => void
  static readonly usePlugin: (...plugins: AnFormPlugin[]) => void
}
