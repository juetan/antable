import { cloneDeep, merge } from 'lodash-es'
import { Recordable } from '../core'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface AnForm {
    getModel: <T extends Recordable = Recordable>(raw?: boolean) => T
    setModel: (data: Recordable, raw?: boolean) => void
    resetModel: () => void
  }
}

AnForm.prototype.getModel = function (raw) {
  return raw ? this.state.model : ({} as any)
}

AnForm.prototype.setModel = function (data, raw) {
  raw ? merge(this.state.model, data) : null
}

AnForm.prototype.resetModel = function () {
  const model = cloneDeep(this.shared.model)
  Object.assign(this.state.model, model)
}

export default defineFormPlugin({
  name: 'model',
  onOptionsItem(item) {
    if (item.field) {
      const model = (this.options.model ??= {})
      model[item.field] ??= item.value
    }
  },
  onOptionsAfter() {
    this.shared.model = cloneDeep(this.state.model)
  }
})
