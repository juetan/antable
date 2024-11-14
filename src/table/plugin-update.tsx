import { defaultsDeep } from 'lodash-es'
import { AnForm, AnFormConfig, useForm, UseFormItem, UseFormOptions } from '../form'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  type UseTableUpdateItem = UseFormItem & {}
  interface UseTableUpdate extends Omit<UseFormOptions, 'name' | 'items'> {
    items?: UseTableUpdateItem[]
  }
  interface UseTableOptions {
    update?: UseTableUpdate
  }
  interface AnTableConfigUpdate extends AnFormConfig {}
  interface AnTable {
    getUpdateForm(): AnForm | undefined
    openUpdateModal(): void
  }
  interface AnTableConfig {
    update: AnTableConfigUpdate
  }
}

AnTable.prototype.getUpdateForm = function () {
  return this.shared.modify
}

AnTable.prototype.openUpdateModal = function () {
  this.shared.modify?.openModal()
}

function render(this: AnTable) {
  if (!this.shared.update) {
    return null
  }
  return <this.shared.update />
}

export default defineTablePlugin({
  name: 'update',
  onOptions({ update }) {
    if (!update) {
      return
    }
    update.modal ??= {}
    update.modal.trigger = false
    update.config = defaultsDeep((update.config ??= {}), this.config.update)
    this.shared.modify = useForm(update)
    this.addChild(render.bind(this))
  },
})
