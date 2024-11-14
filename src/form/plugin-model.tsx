import { defaultsDeep } from 'lodash-es'
import { Recordable } from '../core'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface AnForm {
    getModel<T extends Recordable = Recordable>(raw?: boolean): T
    resetModel(addtional?: Recordable): void
  }
}

AnForm.prototype.getModel = function () {
  return this.state.model as any
}

AnForm.prototype.resetModel = function (addtional = {}) {
  const state = this.getState()
  const source = defaultsDeep(addtional, state.model)
  const target = state.model
  for (const key of Object.keys(target)) {
    target[key] = source[key]
  }
}

export default defineFormPlugin({
  name: 'model',
})
