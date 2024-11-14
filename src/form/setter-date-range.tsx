import { RangePicker, RangePickerInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemDateRange extends UseFormItemBase {
    setter: 'dateRange'
    setterProps?: RangePickerInstance['$props']
    setterSlots?: {}
  }
  interface UseFormItems {
    dateRange: UseFormItemDateRange
  }
  interface AnFormConfig {
    dateRange: UseFormItemDateRange
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <RangePicker {...item.setterProps} v-model={model[item.field]}>
      {{ ...item.setterSlots }}
    </RangePicker>
  )
}

export default defineFormPlugin({
  name: 'dateRange',
  onOptionsItemBefore(item) {
    if (item.setter !== 'dateRange') {
      return
    }
    defaultsDeep(item, this.config.dateRange)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
