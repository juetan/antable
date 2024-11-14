import { Cascader, CascaderInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemCascader extends UseFormItemBase {
    setter: 'cascader'
    setterProps?: CascaderInstance['$props']
    setterSlots?: AnFormItemSlotMapping<
      'label' | 'prefix' | 'arrowIcon' | 'loadingIcon' | 'searchIcon' | 'empty' | 'option'
    >
  }
  interface UseFormItems {
    cascader: UseFormItemCascader
  }
  interface AnFormConfig {
    cascader: UseFormItemCascader
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <Cascader {...item.setterProps} v-model={model[item.field]} placeholder={this.t(item.placeholder)}>
      {{ ...item.setterSlots }}
    </Cascader>
  )
}

export default defineFormPlugin({
  name: 'cascader',
  onOptionsItemBefore(item) {
    if (item.setter !== 'cascader') {
      return
    }
    defaultsDeep(item, this.config.cascader)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
