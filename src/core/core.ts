import { defaultsDeep } from 'lodash-es'
import { ComponentOptions, h, reactive, watchEffect } from 'vue'
import { arraify, DeepPartial, maybeFn, mergeOrDefaults, Recordable } from './utils'

export interface AnConfig<P = any> {
  name: string
  plugins: P[]
}

export interface AnOption<T = any, C = any> {
  name?: string
  config?: DeepPartial<Omit<C, 'name' | 'plugins'>>
  plugins?: T[]
}

export interface AnState {
  rootProps: Recordable
  rootItems: AnChild[]
}

export interface AnChild {
  (): any
  key?: string
  order?: number
}

export interface AnPlugin<T = any, O = any, C = any> {
  name: string
  order?: number
  version?: string
  description?: string
  onInit?: (this: T, instance: T) => void
  onConfig?: (this: T, config: C) => C | void
  onOptionsBefore?: (this: T) => void
  onOptions?: (this: T, options: O) => void
  onOptionsAfter?: (this: T) => void
  onComponent?: (this: T, component: ComponentOptions) => void
  onSetup?: (this: T, exposes: Recordable) => void
}

export type AnHooks<T> = {
  [k in keyof T as k extends `on${string}` ? k : never]: T[k] extends (...args: any[]) => any ? T[k] : never
}

export abstract class AnCore<
  O extends AnOption = AnOption,
  S extends AnState = AnState,
  C extends AnConfig = AnConfig,
  P extends AnPlugin = AnPlugin,
  H extends AnHooks<P> = AnHooks<P>
> {
  protected readonly config: C
  protected readonly state: S
  protected readonly options: O
  protected readonly plugins: P[]
  protected readonly shared: Recordable

  constructor(optionOrFn: O | ((ctx: any) => O)) {
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

  private initState(): S {
    const state = reactive({ rootProps: {}, rootItems: [] }) as S
    watchEffect(() => state.rootItems.sort((a, b) => (a.order ?? 10) - (b.order ?? 10)))
    return state
  }

  private initPlugins(): P[] {
    const globalCfg = (this as any).constructor.config ?? {}
    this.options.plugins ??= []
    this.options.plugins.unshift(...globalCfg.plugins)
    return this.options.plugins
  }

  private initConfig(): C {
    const globalCfg = (this as any).constructor.config ?? {}
    const config = defaultsDeep((this.options.config ??= {}), globalCfg)
    delete this.options.plugins
    delete this.options.config
    return config
  }

  private initComponent() {
    const component = Object.create(this)
    component.name = this.options.name ?? this.config.name
    component.setup = this.setup.bind(this)
    component.render = this.render.bind(this)
    this.callParal('onComponent', component)
    return component
  }

  protected setup() {
    const result = {}
    this.callParal('onSetup', result)
    return result
  }

  protected render() {
    const items = this.state.rootItems.map(i => h(i, { key: i.key }))
    return h('div', this.state.rootProps, items)
  }

  protected setState(state: DeepPartial<S>, mode?: 'merge' | 'defaults') {
    mergeOrDefaults(this.state, state, mode)
    return this
  }

  protected addChild(child: AnChild, order = 10) {
    child.key ??= child.name.replace('bound ', '')
    child.order ??= order
    this.state.rootItems.push(child)
    return this
  }

  protected callParal<K extends keyof H = keyof H>(key: K, ...args: any[]): ReturnType<H[K]>[] {
    const result: any[] = []
    for (const plugin of this.plugins ?? []) {
      const fn = plugin[key as keyof P]
      if (typeof fn !== 'function') continue
      const data = fn.apply(this, args)
      if (data) result.push(fn.apply(this, args))
    }
    return result
  }

  protected callFirst<K extends keyof H = keyof H>(key: K, ...args: any[]): ReturnType<H[K]> | undefined {
    const fns = this.plugins.map(i => i[key as keyof P])
    const valid = fns.filter(i => typeof i === 'function')
    for (const fn of valid) {
      const res = fn.call(this, ...args)
      if (res) return res
    }
  }

  protected async callFirstAsync<K extends keyof H = keyof H>(
    key: K,
    ...args: any[]
  ): Promise<ReturnType<H[K]>[] | undefined> {
    const fns = this.plugins.map(i => i[key as keyof P])
    const valid = fns.filter(i => typeof i === 'function')
    for (const fn of valid) {
      const res = await fn.apply(this, args)
      if (res) return res
    }
  }

  protected t(key?: string) {
    return key
  }

  static config: AnConfig = { name: 'AnCore', plugins: [] }

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
