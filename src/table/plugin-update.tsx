import { defaultsDeep } from 'lodash-es'
import { AnForm, AnFormConfig, useForm, UseFormItem, UseFormOptions } from '../form'
import { AnTable, defineTablePlugin } from './table'
import { defaultsItems } from './plugin-search'
import { Recordable } from '../core'

declare module './table' {
  type UseTableUpdateItem = UseFormItem & {}
  interface UseTableUpdate extends Omit<UseFormOptions, 'name' | 'items'> {
    /**
     * 是否在行操作中，添加一个修改按钮
     * @default
     * ```ts
     * true
     * ```
     */
    showInColumnActions?: boolean
    /**
     * 表单项
     * @by update
     * @see useForm.item
     */
    items?: UseTableUpdateItem[]
  }
  interface UseTableOptions {
    /**
     * 更新表单(弹窗)
     * @by update
     * @example
     * ```js
     * items: [], 
     * submit: (model) => console.log(model)
     * ```
     */
    update?: UseTableUpdate
  }
  interface AnTable {
    /**
     * 获取更新表单
     * @by update
     * @example
     * ```ts
     * getUpdateForm()?.validate()  // 校验表单
     * ```
     */
    getUpdateForm: () => AnForm | undefined
    /**
     * 打开更新表单
     * @by update
     * @example
     * ```ts
     * openUpdateModal({ name })  // 携带表单数据打开
     * ```
     */
    openUpdateModal: (data?: Recordable) => void
  }
  interface AnTableConfigUpdate extends AnFormConfig {}
  interface AnTableConfig {
    update: AnTableConfigUpdate
  }
}

AnTable.prototype.getUpdateForm = function () {
  return this.shared.update
}

AnTable.prototype.openUpdateModal = function (data) {
  this.shared.update?.openModal(data)
}

function UpdateForm(this: AnTable) {
  if (!this.shared.update) {
    return null
  }
  return <this.shared.update />
}

export default defineTablePlugin({
  name: 'update',
  onOptionsColumnBefore(column) {
    if (!this.options.update) {
      return
    }
    if (!this.options.update.showInColumnActions) {
      return
    }
    if (!column.actions) {
      return
    }
    const action = column.actions.find(i => i.type === 'update')
    if (action) {
      return
    }
    column.actions.unshift({
      text: '修改',
      onClick: arg => this.openUpdateModal(arg.record),
    })
  },
  onOptions(options) {
    if (!options.update) {
      return
    }
    const update = options.update
    update.modal ??= {}
    update.config = defaultsDeep((update.config ??= {}), this.config.update)
    update.items = defaultsItems(update.items ?? [], options.items ?? [])
    this.shared.update = useForm(update)
    this.addChild(UpdateForm.bind(this))
  },
})
