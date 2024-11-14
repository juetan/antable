import { InputPassword, InputPasswordInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnForm, AnFormItem } from './form'
import { defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemPassword extends UseFormItemBase {
    setter: 'password'
    setterProps?: InputPasswordInstance['$props']
    setterSlots?: {}
  }
  interface UseFormItems {
    password: UseFormItemPassword
  }
  interface AnFormConfig {
    password: UseFormItemPassword
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <InputPassword {...item.setterProps} v-model={model[item.field]}>
      {{ ...item.setterSlots }}
    </InputPassword>
  )
}

export default defineFormPlugin({
  name: 'password',
  onOptionsItemBefore(item) {
    if (item.setter !== 'password') {
      return
    }
    defaultsDeep(item, this.config.password)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
