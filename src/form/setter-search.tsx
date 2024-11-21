import { InputSearch, InputSearchInstance } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemSearch extends UseFormItemBase {
    setter: 'search'
    setterProps?: InputSearchInstance['$props']
    setterSlots?: {}
  }
  interface UseFormItems {
    search: UseFormItemSearch
  }
  interface AnFormConfig {
    search: UseFormItemSearch
  }
}

function render(this: AnForm, item: AnFormItem, model: Recordable) {
  return (
    <InputSearch
      {...item.setterProps}
      v-model={model[item.field]}
      // @ts-ignore
      placeholder={this.t(item.placeholder)}
    >
      {{ ...item.setterSlots }}
    </InputSearch>
  )
}

export default defineFormPlugin({
  name: 'search',
  onOptionsItemBefore(item) {
    if (item.setter !== 'password') {
      return
    }
    defaultsDeep(item, this.config.search)
    item.itemSlots ??= {}
    item.itemSlots.default = render.bind(this)
  },
})
