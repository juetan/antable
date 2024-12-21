import { Cascader, CascaderInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
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

function render(this: AnForm, item: AnFormItem) {
  return <Cascader {...item.setterProps}>{{ ...item.setterSlots }}</Cascader>
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
