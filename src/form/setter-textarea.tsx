import { InputSearchInstance, Textarea } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemTextarea extends UseFormItemBase {
    setter: 'textarea'
    setterProps?: InputSearchInstance['$props']
    setterSlots?: {}
  }
  interface UseFormItems {
    textarea: UseFormItemTextarea
  }
  interface AnFormConfig {
    textarea: UseFormItemTextarea
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <Textarea
      {...item.setterProps}
      v-model={model[item.field]}
      placeholder={this.t(item.placeholder)}
    >
      {{ ...item.setterSlots }}
    </Textarea>
  )
}

export default defineFormPlugin({
  name: 'textarea',
  onOptionsItemBefore(item) {
    if (item.setter !== 'textarea') {
      return
    }
    defaultsDeep(item, this.config.textarea)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
