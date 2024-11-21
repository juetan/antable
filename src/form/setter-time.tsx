import { TimePicker, TimePickerInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItenTime extends UseFormItemBase {
    setter: 'time'
    setterProps?: TimePickerInstance['$props']
    setterSlots?: AnFormItemSlotMapping<'prefix' | 'suffixIcon' | 'extra'>
  }
  interface UseFormItems {
    time: UseFormItenTime
  }
  interface AnFormConfig {
    time: UseFormItenTime
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <TimePicker {...item.setterProps} v-model={model[item.field]} placeholder={this.t(item.placeholder)}>
      {{ ...item.setterSlots }}
    </TimePicker>
  )
}

export default defineFormPlugin({
  name: 'time',
  onOptionsItemBefore(item) {
    if (item.setter !== 'time') {
      return
    }
    defaultsDeep(item, this.config.time)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
