import { defaultsDeep } from 'lodash-es'
import { AnForm, AnFormConfig, useForm, UseFormItem, UseFormOptions } from '../form'
import { AnTable, defineTablePlugin } from './table'
import { defaultsItems } from './plugin-search'
import { Recordable } from '../core'

declare module './table' {
  type UseTableCreateItem = UseFormItem & {}
  interface UseTableCreate extends Omit<UseFormOptions, 'name' | 'items'> {
    /**
     * 表单项
     */
    items?: UseTableCreateItem[]
  }
  interface AnTableCreateConfig extends AnFormConfig {
    /**
     * 是否在工具栏显示新增按钮
     * @default
     * ```js
     * true
     * ```
     */
    showInToolbar: boolean
    /**
     * 显示在工具栏的顺序
     * @default
     * ```js
     * -50
     * ```
     */
    orderInToolbar: number
  }
  interface UseTableOptions {
    /**
     * 新增表单。默认在工具栏左侧，添加一个新增按钮。
     * @see useForm
     */
    create?: UseTableCreate
  }
  interface AnTable {
    /**
     * 获取新增表单
     * @example
     * ```ts
     * getCreateForm()?.validate()  // 校验表单
     * ```
     */
    getCreateForm: () => AnForm | undefined
    /**
     * 打开新增表单
     * @example
     * ```ts
     * openCreateModal({ name })  // 携带表单数据打开
     * ```
     */
    openCreateModal: (data?: Recordable) => undefined
  }
  interface AnTableConfig {
    create: AnTableCreateConfig
  }
}

AnTable.prototype.getCreateForm = function () {
  return this.shared.create
}

AnTable.prototype.openCreateModal = function (data) {
  this.getCreateForm()?.openModal(data)
}

function CreateForm(this: AnTable) {
  if (!this.shared.create) {
    return null
  }
  return <this.shared.create />
}

export default defineTablePlugin({
  name: 'create',
  onOptionsBefore() {
    if (!this.options.create) {
      return
    }
    if (!this.config.create.showInToolbar) {
      return
    }
    this.options.toolbar ??= []
    this.options.toolbar.push({
      // key: 'create',
      text: '新增',
      sort: this.config.create.orderInToolbar ?? 0,
      buttonType: 'primary',
      onClick: () => this.openCreateModal(),
    })
  },
  onOptions(options) {
    if (!options.create) {
      return
    }
    const create = options.create
    create.modal ??= {}
    create.config ??= {}
    create.config = defaultsDeep(create.config, this.config.create)
    create.items = defaultsItems(create.items ?? [], options.items ?? [])
    this.shared.create = useForm(create)
    this.addChild(CreateForm.bind(this))
  },
})
