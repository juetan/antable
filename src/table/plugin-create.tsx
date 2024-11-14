import { defaultsDeep } from 'lodash-es'
import { AnForm, AnFormConfig, useForm, UseFormItem, UseFormOptions } from '../form'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  type UseTableCreateItem = UseFormItem & {}
  interface UseTableCreate extends Omit<UseFormOptions, 'name' | 'items'> {
    items?: UseTableCreateItem[]
  }
  interface AnTableCreateConfig extends AnFormConfig {
    orderInToolbar: number
  }
  interface UseTableOptions {
    create?: UseTableCreate
  }
  interface AnTable {
    getCreateForm(): AnForm | undefined
  }
  interface AnTableConfig {
    create: AnTableCreateConfig
  }
}

AnTable.prototype.getCreateForm = function () {
  return this.shared.create
}

function itemRender(this: AnTable) {
  if (!this.shared.create) {
    return null
  }
  return <this.shared.create></this.shared.create>
}

export default defineTablePlugin({
  name: 'create',
  onOptions({ create }) {
    if (!create) {
      return
    }
    create.modal ??= {}
    create.modal.trigger ??= {}
    create.config ??= {}
    create.config = defaultsDeep(create.config, this.config.create)
    this.shared.create = useForm(create)
  },
  onOptionsAfter() {
    this.state.toolbar.items.push({
      key: 'create',
      props: {},
      slots: {},
      order: this.config.create.orderInToolbar ?? -100,
      render: itemRender.bind(this),
    })
  },
})
