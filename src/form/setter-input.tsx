import { Input, InputInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemInput extends UseFormItemBase {
    setter: 'input'
    setterProps?: InputInstance['$props']
    setterSlots?: AnFormItemSlotMapping<'prepend' | 'append' | 'suffix' | 'prefix'>
  }
  interface UseFormItems {
    input: UseFormItemInput
  }
  interface AnFormConfig {
    input: UseFormItemInput
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <Input {...item.setterProps} v-model={model[item.field]} placeholder={this.t(item.placeholder)}>
      {{ ...item.setterSlots }}
    </Input>
  )
}

export default defineFormPlugin({
  name: 'input',
  onOptionsItemBefore(item) {
    if (item.setter !== 'input') {
      return
    }
    defaultsDeep(item, this.config.input)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
