import { defaultsDeep } from 'lodash-es'
import { ComponentOptions, h, reactive, watchEffect } from 'vue'
import { arraify, DeepPartial, maybeFn, mergeOrDefaults, Recordable } from './utils'

export interface AnConfig<Plugin = any> {
  name: string
  plugins: Plugin[]
}

export interface AnOption<Plugin = any, Config = any> {
  /**
   * 组件名字。适用于 devtool 调试及唯一标识。
   * @by core
   * @example
   * ```ts
   * 'MyForm'
   * ```
   */
  name?: string
  /**
   * 额外配置。控制渲染流程及插件的一些默认行为。
   * @by core
   */
  config?: DeepPartial<Omit<Config, 'name' | 'plugins'>>
  /**
   * 插件列表
   * @by core
   */
  plugins?: Plugin[]
}

export interface AnState {
  rootType: any
  rootProps: Recordable
  rootChildren: AnChild[]
}

export interface AnChild {
  (): any
  key?: string
  order?: number
}

export interface AnPlugin<This = any, Option = any, Config = any> {
  /**
   * 插件名字，应为唯一标识符
   * @example
   * ```ts
   * 'myPlugin'
   * ```
   */
  name: string
  order?: number
  /**
   * 插件版本。使用 semver 格式。
   * @example
   * ```ts
   * '0.0.1'
   * ```
   */
  version?: string
  /**
   * 插件描述
   * @example
   * ```ts
   * 'my plugin'
   * ```
   */
  description?: string
  onInit?: (this: This, instance: This) => void
  onConfig?: (this: This, config: Config) => Config | void
  onOptionsBefore?: (this: This) => void
  onOptions?: (this: This, options: Option) => void
  onOptionsAfter?: (this: This) => void
  onComponent?: (this: This, component: ComponentOptions) => void
  onSetup?: (this: This, exposes: Recordable) => void
}

export type AnHooks<T> = {
  [k in keyof T as k extends `on${string}` ? k : never]: T[k] extends (...args: any[]) => any ? T[k] : never
}

export abstract class AnCore<
  Option extends AnOption = AnOption,
  State extends AnState = AnState,
  Config extends AnConfig = AnConfig,
  Plugin extends AnPlugin = AnPlugin,
  Hooks extends AnHooks<Plugin> = AnHooks<Plugin>,
> {
  protected readonly config: Config
  protected readonly state: State
  protected readonly options: Option
  protected readonly plugins: Plugin[]
  protected readonly shared: Recordable

  constructor(optionOrFn: Option | ((ctx: any) => Option)) {
    this.shared = {}
    this.state = this.initState()
    this.options = maybeFn(optionOrFn)
    this.plugins = this.initPlugins()
    this.config = this.initConfig()
    this.callParal('onInit')
    this.callParal('onConfig', this.config)
    this.callParal('onOptionsBefore')
    this.callParal('onOptions', this.options)
    this.callParal('onOptionsAfter')
    return this.initComponent()
  }

  private initState(): State {
    const state = reactive({ rootProps: {}, rootItems: [], rootChildren: [] }) as State
    watchEffect(() => state.rootChildren.sort((a, b) => (a.order ?? 10) - (b.order ?? 10)))
    return state
  }

  private initPlugins(): Plugin[] {
    const globalCfg = (this as any).constructor.config ?? {}
    this.options.plugins ??= []
    this.options.plugins.unshift(...globalCfg.plugins)
    return this.options.plugins
  }

  private initConfig(): Config {
    const globalCfg = (this as any).constructor.config ?? {}
    const config = defaultsDeep((this.options.config ??= {}), globalCfg)
    delete this.options.plugins
    delete this.options.config
    return config
  }

  private initComponent() {
    const component = Object.create(this)
    component.name = this.options.name ?? this.config.name
    component.setup = this.setupFn.bind(this)
    component.render = this.renderFn.bind(this)
    this.callParal('onComponent', component)
    return component
  }

  protected setupFn() {
    const result = { core: this }
    this.callParal('onSetup', result)
    return result
  }

  protected renderFn() {
    const items = this.state.rootChildren.map(i => h(i, { key: i.key }))
    return h('div', this.state.rootProps, items)
  }

  public getState(): State {
    return this.state
  }

  protected setState(state: DeepPartial<State>, mode?: 'merge' | 'defaults') {
    mergeOrDefaults(this.state, state, mode)
    return this
  }

  protected addChild(child: AnChild, order = 10) {
    child.key ??= child.name.replace('bound ', '')
    child.order ??= order
    this.state.rootChildren.push(child)
    return this
  }

  protected callParal<K extends keyof Hooks = keyof Hooks>(key: K, ...args: any[]): ReturnType<Hooks[K]>[] {
    const result: any[] = []
    for (const plugin of this.plugins ?? []) {
      const fn = plugin[key as keyof Plugin]
      if (typeof fn !== 'function') continue
      const data = fn.apply(this, args)
      if (data) result.push(fn.apply(this, args))
    }
    return result
  }

  protected callFirst<K extends keyof Hooks = keyof Hooks>(key: K, ...args: any[]): ReturnType<Hooks[K]> | undefined {
    const fns = this.plugins.map(i => i[key as keyof Plugin])
    const valid = fns.filter(i => typeof i === 'function')
    for (const fn of valid) {
      const res = fn.call(this, ...args)
      if (res) return res
    }
  }

  protected async callFirstAsync<K extends keyof Hooks = keyof Hooks>(
    key: K,
    ...args: any[]
  ): Promise<ReturnType<Hooks[K]>[] | undefined> {
    const fns = this.plugins.map(i => i[key as keyof Plugin])
    const valid = fns.filter(i => typeof i === 'function')
    for (const fn of valid) {
      const res = await fn.apply(this, args)
      if (res) return res
    }
  }

  protected t(key?: string) {
    return key
  }

  static config = { name: 'AnCore', plugins: [] } as AnConfig

  static setConfig(config: AnConfig, mode?: 'defaults' | 'merge') {
    mergeOrDefaults(this.config, config, mode)
  }

  static usePlugin(plugin: AnPlugin | AnPlugin[]) {
    const flated = arraify(plugin).flat().filter(Boolean)
    this.config.plugins ??= []
    this.config.plugins.push(...flated)
  }

  static t(key?: string) {
    return key
  }
}
