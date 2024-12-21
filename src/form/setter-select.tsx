import { Select, SelectInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { onMounted } from 'vue'
import { MaybePromise } from '../core'
import type { AnFormItem, UseFormSelectItemOptions } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormSelectItemOptions {
    /**
     * 加载数据的函数
     * @example
     * ```ts
     * () => []
     * ```
     */
    load?: (item: AnFormItem) => MaybePromise<any[]>
    /**
     * 什么情况下加载
     * @default
     * ```ts
     * 'setup'
     * ```
     */
    loadOn?: 'mounted' | 'setup' | false
  }
  interface UseFormItemSelect extends UseFormItemBase {
    setter: 'select'
    setterProps?: SelectInstance['$props']
    setterSlots?: AnFormItemSlotMapping<'prepend' | 'append' | 'suffix' | 'prefix'>
    /**
     * 选项源，可以是数组，函数或更复杂的对象
     * @by select
     * @example
     * ```ts
     * [{ label: '视频', value: 1 }]
     * ```
     */
    options?: any[] | UseFormSelectItemOptions['load'] | UseFormSelectItemOptions
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

function render(this: AnForm, item: AnFormItem) {
  return <Select {...item.setterProps}>{{ ...item.setterSlots }}</Select>
}

async function loadOption(item: AnFormItem) {
  const options = item.shared.options as UseFormSelectItemOptions
  if (!options || !options.load) {
    return
  }
  const result = await options.load(item)
  if (Array.isArray(result)) {
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
    if (!item.shared.options) {
      return
    }
    const options = item.shared.options
    if (options.loadOn === 'setup') {
      loadOption(item)
      return
    }
    if (options.loadOn === 'mounted') {
      onMounted(() => loadOption(item))
      return
    }
  },
})
