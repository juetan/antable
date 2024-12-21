import { cloneDeep, has, merge, set } from 'lodash-es'
import { Recordable, getModel, setModel } from '../core'
import { AnForm, defineFormPlugin } from './form'
import { computed } from 'vue'

declare module './form' {
  interface AnFormItem {}
  interface AnForm {
    /**
     * 返回格式化后的表单数据
     * @by model
     * @example
     * ```ts
     * { start: '2000', end: '2001' }      // 格式化后
     * { '[start,end]': ['2000', '2001'] } // 原始数据
     * ```
     */
    getModel: <T extends Recordable = Recordable>(raw?: boolean) => T
    /**
     * 设置表单数据
     * @by model
     */
    setModel: (data: Recordable, raw?: boolean) => void
    /**
     * 重置表单数据
     * @by model
     */
    resetModel: () => void
  }
}

AnForm.prototype.getModel = function (raw): any {
  if (raw) {
    return this.state.model
  }
  return getModel(this.state.model)
}

AnForm.prototype.setModel = function (data, raw) {
  if (raw) {
    merge(this.state.model, data)
    return
  }
  setModel(this.state.model, data)
}

AnForm.prototype.resetModel = function () {
  merge(this.state.model, this.shared.model)
}

export default defineFormPlugin({
  name: 'model',
  onOptionsItem(item) {
    if (!item.field) {
      return
    }
    const model = this.options.model!
    if (item.field.includes('.') && !has(model, item.field)) {
      set(model, item.field, item.value)
      return
    }
    model[item.field] ??= item.value
  },
  onOptionsAfter() {
    this.shared.model = cloneDeep(this.state.model)
    for (const item of this.state.items) {
      if (!item.field) {
        continue
      }
      const key = item.field
        .split('.')
        .map(i => `['${i}']`)
        .join('')
      const get = new Function('model', `return model${key}`)
      const set = new Function('model', 'value', `model${key} = value`)
      item.setterProps ??= {}
      item.setterProps.modelValue = computed(() => get(this.state.model))
      item.setterProps['onUpdate:modelValue'] = (val: unknown) => set(this.state.model, val)
    }
  },
})
