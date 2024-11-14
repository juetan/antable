import { Select, SelectInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { onMounted } from 'vue'
import { MaybePromise, Recordable } from '../core'
import type { AnFormItem, UseFormItemSelect, UseFormSelectItemOptions } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface AnFormSelectOption {
    label: string
    value: any
    raw?: any
  }
  interface UseFormSelectItemOptions {
    /**
     * 用于加载数据的函数，应返回数组
     * @example
     * ```ts
     * async load() {
     *   const data = await api.getUserSelectOptions()
     *   return data.map(item => {
     *     label: item.nickename,
     *     value: item.id,
     *     raw: item
     *   })
     * }
     * ```
     */
    load?: (item: UseFormItemSelect) => MaybePromise<AnFormSelectOption[]>
    /**
     * 是否在 vue 的生命周期里自动加载
     * @example
     * ```ts
     * 'mounted'
     * ```
     */
    loadOn?: 'mounted' | 'setup' | false
    loader?: any
  }
  interface UseFormItemSelect extends UseFormItemBase {
    options?:
      | AnFormSelectOption[]
      | UseFormSelectItemOptions['load']
      | UseFormSelectItemOptions
    setter: 'select'
    setterProps?: SelectInstance['$props']
    setterSlots?: AnFormItemSlotMapping<
      'prepend' | 'append' | 'suffix' | 'prefix'
    >
  }
  interface UseFormItems {
    select: UseFormItemSelect
  }
  interface AnFormConfig {
    select: UseFormItemSelect
    selectOpt: UseFormSelectItemOptions
  }
}

function parseItemOptions(item: UseFormItemSelect) {
  const defaults = AnForm.config.selectOpt
  const options: UseFormSelectItemOptions = defaultsDeep({}, defaults)
  const rawOptions = item.options!
  if (Array.isArray(rawOptions)) {
    options.load = () => rawOptions
  } else if (typeof rawOptions === 'function') {
    options.load = rawOptions
  } else if (typeof rawOptions === 'object') {
    Object.assign(options, rawOptions)
  }
  return options
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <Select
      {...(item.setterProps as any)}
      v-model={model[item.field]}
      placeholder={this.t(item.placeholder)}
    >
      {{ ...item.setterSlots }}
    </Select>
  )
}

export async function loader(item: UseFormItemSelect) {
  const options = item.options as UseFormSelectItemOptions
  const res = await options.load?.(item)
  item.setterProps!.options = res
}

export default defineFormPlugin({
  name: 'select',
  onOptionsItemBefore(item) {
    if (item.setter !== 'select') {
      return
    }
    if (item.options) {
      item.options = parseItemOptions(item)
    }
    defaultsDeep(item, this.config.select)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
  onSetupItem(item) {
    if (item.setter !== 'select') {
      return
    }
    const options = (item as UseFormItemSelect).options
    if (!options) {
      return
    }
    const { loader, loadOn } = options as UseFormSelectItemOptions
    if (loadOn === 'setup') {
      loader?.(item)
    } else if (loadOn === 'mounted') {
      onMounted(() => loader?.(item))
    }
  },
})
