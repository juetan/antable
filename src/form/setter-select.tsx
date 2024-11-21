import { Select, SelectInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { onMounted } from 'vue'
import { MaybePromise, Recordable } from '../core'
import type { AnFormItem, UseFormSelectItemOptions } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
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
     *   })
     * }
     * ```
     */
    load?: (item: AnFormItem) => MaybePromise<AnFormSelectOption[]>
    /**
     * 什么情况下加载
     * @default
     * ```ts
     * 'setup'
     * ```
     */
    loadOn?: 'mounted' | 'setup' | false
    custom?: boolean
  }
  interface AnFormSelectOption {
    label: string
    value: any
    raw?: any
  }
  interface UseFormItemSelect extends UseFormItemBase {
    options?: AnFormSelectOption[] | UseFormSelectItemOptions['load'] | UseFormSelectItemOptions
    setter: 'select'
    setterProps?: SelectInstance['$props']
    setterSlots?: AnFormItemSlotMapping<'prepend' | 'append' | 'suffix' | 'prefix'>
  }
  interface UseFormItems {
    select: UseFormItemSelect
  }
  interface AnFormConfig {
    select: UseFormItemSelect
    selectOpt: UseFormSelectItemOptions
  }
  interface AnForm {
    loadOption: (field: string) => void
    loadOptions: () => void
  }
}

AnForm.prototype.loadOption = async function (field) {
  const item = this.state.items.find(i => i.field === field)
  item && loadOption(item)
}

AnForm.prototype.loadOptions = function () {
  this.state.items.forEach(loadOption)
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <Select {...item.setterProps} v-model={model[item.field]} placeholder={this.t(item.placeholder)}>
      {{ ...item.setterSlots }}
    </Select>
  )
}

async function loadOption(item: AnFormItem) {
  const options = item.shared.options as UseFormSelectItemOptions
  if (!options) {
    return
  }
  if (options.custom) {
    return options.load?.(item)
  }
  if (options.load) {
    const result = await options.load(item)
    if (!Array.isArray(result)) return
    item.setterProps ??= {}
    item.setterProps.options = result
  }
}

export default defineFormPlugin({
  name: 'select',
  onOptionsItemBefore(item) {
    if (item.setter !== 'select') {
      return
    }
    item = defaultsDeep(item, this.config.select)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
  onOptionsItem(item, target) {
    if (item.setter !== 'select' || !item.options) {
      return
    }
    const temp = defaultsDeep({}, this.config.selectOpt)
    const options = item.options
    if (Array.isArray(options)) {
      temp.load = () => options
    } else if (typeof options === 'function') {
      temp.load = options
    } else if (typeof options === 'object') {
      Object.assign(temp, options)
    }
    target.shared.options = temp
  },
  onSetupItem(item) {
    if (item.setter !== 'select') {
      return
    }
    const options = item.shared.options
    if (!options) {
      return
    }
    if (options.loadOn === 'setup') {
      return loadOption(item)
    }
    if (options.loadOn === 'mounted') {
      return onMounted(() => loadOption(item))
    }
  }
})
