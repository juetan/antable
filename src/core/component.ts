import { defaultsDeep, mergeWith } from 'lodash-es'
import { ComponentOptions, h, reactive, watchEffect } from 'vue'
import { DeepPartial, maybeFn, Recordable } from './utils'

export interface AnConfig<P = any, S = any> {
  name: string
  state: DeepPartial<S>
  plugins: P[]
}

export interface AnOption<T = any, C = any> {
  name?: string
  config?: DeepPartial<Omit<C, 'name' | 'plugins'>>
  plugins?: T[]
}

export interface AnState {
  node: {
    props: Recordable
    children: AnChild[]
  }
}

export interface AnPlugin<T = any, O = any, C = any> {
  name: string
  order?: number
  version?: string
  description?: string
  onInit?: (this: T, instance: T) => void
  onConfig?: (this: T, config: DeepPartial<C>) => DeepPartial<C> | void
  onOptionsBefore?: (this: T) => void
  onOptions?: (this: T, options: O) => void
  onOptionsAfter?: (this: T) => void
  onComponent?: (this: T, component: ComponentOptions) => void
  onSetup?: (this: T) => void
}

export type AnHooks<T> = {
  [k in keyof T as k extends `on${string}` ? k : never]: T[k] extends (...args: any[]) => any ? T[k] : never
}

export interface AnChild {
  key: string
  order?: number
  component: () => any
}

export abstract class AnComponent<
  O extends AnOption = AnOption,
  S extends AnState = AnState,
  C extends AnConfig = AnConfig,
  P extends AnPlugin = AnPlugin,
  H extends AnHooks<P> = AnHooks<P>,
> implements ComponentOptions
{
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
    this.callParal('onConfig', this.config)
    this.callParal('onInit')
    this.callParal('onOptionsBefore')
    this.callParal('onOptions', this.options)
    this.callParal('onOptionsAfter')
  }

  private initState() {
    const state = reactive({ node: { props: {}, children: [] } }) as S
    watchEffect(() => state.node.children.sort((a, b) => (a.order ?? 10) - (b.order ?? 10)))
    return state
  }

  private initPlugins(): P[] {
    const globalCfg = (this as any).constructor.config ?? {}
    this.options.plugins ??= []
    this.options.plugins.unshift(...globalCfg.plugins)
    return this.options.plugins
  }

  private initConfig() {
    const globalCfg = (this as any).constructor.config ?? {}
    this.options.config ??= {}
    this.options.config = defaultsDeep(this.options.config, globalCfg)
    this.options.config!.plugins = undefined
    return this.options.config as C
  }

  setup() {
    this.callParal('onSetup')
    return this.render.bind(this)
  }

  render() {
    const { props, children } = this.state.node
    const items = children.map(i => h(i.component, { key: i.key }))
    return h('div', props, items)
  }

  /**
   * 获取整个组件的数据状态，不熟悉的话尽量只做读取操作，更新请通过 updateState() 进行
   */
  getState() {
    return this.state
  }

  /**
   * 更新组件状态，如果值为数组类型，会追加到原数组后面
   * @example
   * ```ts
   * // before
   * { items: [1, 2] }
   * // then
   * updateState({ item: [3] })
   * // after
   * { items: [1, 2, 3] }
   * ```
   */
  protected setState(state: DeepPartial<S>, mode?: 'merge' | 'defaults') {
    if (mode === 'defaults') {
      defaultsDeep(this.state, state)
      return this
    }
    mergeWith(this.state, state, (val, argVal) => {
      if (Array.isArray(argVal) && Array.isArray(val)) {
        val.push(...argVal)
        return val
      }
    })
    return this
  }

  /**
   * 添加子组件，默认排序为 10，越小越靠前。考虑到性能，请使用函数式组件
   * @example
   * ```tsx
   * addChild({
   *   key: 'unique key for vue loop',
   *   sort: 10,
   *   component: () => <div>content</div>
   * })
   * ```
   */
  protected addChild(arg: AnChild | (() => any), sort = 10) {
    if (typeof arg === 'function') {
      arg = {
        key: arg.name,
        order: (arg as any).sort ?? sort,
        component: arg,
      }
    }
    this.state.node.children.push(arg)
    return this
  }

  protected mergeOptions(options: O) {
    mergeWith(this.options, options, (val, src) => {
      if (Array.isArray(val) && Array.isArray(src)) {
        val.push(...src)
      }
    })
  }

  protected defaultsOptions(options: O) {
    defaultsDeep(this.options, options)
    return this
  }

  protected defaultsConfig(config: O['config']) {
    this.options.config ??= {}
    defaultsDeep(this.options.config, config)
    return this
  }

  protected callParal<K extends keyof H = keyof H>(key: K, ...args: any[]): ReturnType<H[K]>[] {
    const res: ReturnType<H[K]>[] = []
    for (const plugin of this.plugins ?? []) {
      const fn = plugin[key as keyof P]
      if (typeof fn !== 'function') {
        continue
      }
      const data = fn.apply(this, args)
      if (data) {
        res.push(data)
      }
    }
    return res
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

  t(key?: string) {
    return key
  }
}
