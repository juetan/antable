import { InputNumber, InputNumberInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemNumber extends UseFormItemBase {
    setter: 'number'
    setterProps?: InputNumberInstance['$props']
    setterSlots?: AnFormItemSlotMapping<'minus' | 'plus' | 'append' | 'prepend' | 'suffix' | 'prefix'>
  }
  interface UseFormItems {
    number: UseFormItemNumber
  }
  interface AnFormConfig {
    number: UseFormItemNumber
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <InputNumber {...item.setterProps} v-model={model[item.field]} placeholder={AnForm.t(item.placeholder!)}>
      {{ ...item.setterSlots }}
    </InputNumber>
  )
}

export default defineFormPlugin({
  name: 'number',
  onOptionsItemBefore(item) {
    if (item.setter !== 'number') {
      return
    }
    defaultsDeep(item, this.config.number)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
