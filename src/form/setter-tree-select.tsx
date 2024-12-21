import { TreeSelect, TreeSelectInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemTreeSelect extends UseFormItemBase {
    setter: 'treeSelect'
    setterProps?: TreeSelectInstance['$props']
    setterSlots?: AnFormItemSlotMapping<
      | 'trigger'
      | 'prefix'
      | 'label'
      | 'header'
      | 'loader'
      | 'empty'
      | 'footer'
      | 'treeSlotExtra'
      | 'treeSlotTitle'
      | 'treeSlotIcon'
      | 'treeSlotSwitcherIcon'
    >
  }
  interface UseFormItems {
    treeSelect: UseFormItemTreeSelect
  }
  interface AnFormConfig {
    treeSelect: UseFormItemTreeSelect
  }
}

function render(this: AnForm, item: AnFormItem) {
  return (
    <TreeSelect {...item.setterProps}>
      {{ ...item.setterSlots }}
    </TreeSelect>
  )
}

export default defineFormPlugin({
  name: 'treeSelect',
  onOptionsItemBefore(item) {
    if (item.setter !== 'treeSelect') {
      return
    }
    defaultsDeep(item, this.config.treeSelect)
    item.itemSlots ??= {}
    item.itemSlots.default ??= render.bind(this)
  },
})
