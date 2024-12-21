import { DatePicker, DatePickerInstance } from '@arco-design/web-vue'
import { PickerProps } from '@arco-design/web-vue/es/date-picker/interface'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemDate extends UseFormItemBase {
    setter: 'date'
    setterProps?: DatePickerInstance['$props'] & Partial<PickerProps>
    setterSlots?: AnFormItemSlotMapping<
      | 'prefix'
      | 'suffixIcon'
      | 'iconNextDouble'
      | 'iconPrevDouble'
      | 'iconNext'
      | 'iconPrev'
      | 'cell'
      | 'extra'
    >
  }
  interface UseFormItems {
    date: UseFormItemDate
  }
  interface AnFormConfig {
    date: UseFormItemDate
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <DatePicker {...item.setterProps}>
      {{ ...item.setterSlots }}
    </DatePicker>
  )
}

export default defineFormPlugin({
  name: 'date',
  onOptionsItemBefore(item) {
    if (item.setter !== 'date') {
      return
    }
    defaultsDeep(item, this.config.date)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
