import { Button } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import type { AnFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface UseFormItemSubmit extends UseFormItemBase {
    setter: 'submit'
    setterProps?: {
      submitText?: string
      resetText?: string
    }
    setterSlots?: {}
  }
  interface UseFormItems {
    submit: UseFormItemSubmit
  }
  interface AnFormConfig {
    submit: UseFormItemSubmit
  }
}

function render(this: AnForm, item: AnFormItem) {
  return (
    <>
      <Button type="primary" class="mr-3" onClick={this.submit.bind(this)}>
        {item.setterProps?.submitText}
      </Button>
      <Button style="margin-left: 12px">{item.setterProps?.resetText}</Button>
    </>
  )
}

export default defineFormPlugin({
  name: 'submit',
  onOptionsItem(item, target) {
    if (item.setter !== 'submit') {
      return
    }
    target = defaultsDeep(target, this.config.submit)
    target.itemSlots ??= {}
    target.itemSlots.default ??= render.bind(this)
  }
})
