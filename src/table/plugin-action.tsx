import { MaybeRefOrGetter } from 'vue'
import { defineTablePlugin } from './table'
import type { AnTable, AnTableColumnAction, AnTableColumnActionArg, AnTableColumnArg } from './table'
import { toBool } from '../core'
import { Link, Modal, ModalConfig } from '@arco-design/web-vue'
import { defaultsDeep, isString } from 'lodash-es'

declare module './table' {
  interface AnTableColumnActionBase {
    /**
     * 操作类型
     * @example
     * ```ts
     * 'delete'
     * ```
     */
    type?: string
    /**
     * 显示状态
     * @example
     * ```ts
     * 'danger'
     * ```
     */
    status?: 'normal' | 'warning' | 'success' | 'danger'
    /**
     * 悬浮时是否显示背景色
     * @default
     * false
     */
    hoverable?: boolean
    /**
     * 执行操作前，弹窗进行确认，适用于敏感操作。
     * @example
     * ```ts
     * '确定删除吗?'
     * ```
     */
    confirm?: string | ModalConfig
    /**
     * 是否可见
     * @example
     * ```ts
     * (arg) => arg.record.isAdmin
     * ```
     */
    visible?: MaybeRefOrGetter<boolean> | ((data: AnTableColumnActionArg) => boolean)
    /**
     * 是否禁用
     * @example
     * ```ts
     * (arg) => arg.record.isAdmin
     * ```
     */
    disable?: MaybeRefOrGetter<boolean> | ((data: AnTableColumnActionArg) => boolean)
    /**
     * 点击事件
     * @example
     * ```ts
     * (arg) => console.log(arg.record.id)
     * ```
     */
    onClick?: (arg: AnTableColumnActionArg) => void
    /**
     * 自定义渲染函数，指定此参数时其他参数将无效。
     * @example
     * ```tsx
     * () => <MyButton>button</MyButton>
     * ```
     */
    render?: (data: AnTableColumnActionArg) => any
  }
  interface UseTableColumnAction extends AnTableColumnActionBase {
    /**
     * 图标
     * @example
     * ```tsx
     * icon: 'icon-edit'         // 使用 css 类名
     * icon: () => <IconEdit />  // 使用 jsx 函数或 h 函数
     * ```
     */
    icon?: string | ((data: AnTableColumnActionArg) => any)
    /**
     * 显示文本
     * @example
     * ```tsx
     * text: '修改'            // 使用字符串
     * text: () => <MyEdit />  // 使用 jsx 函数或 h 函数
     * ```
     */
    text?: string | ((data: AnTableColumnActionArg) => any)
  }
  interface AnTableColumnAction extends AnTableColumnActionBase {
    icon?: (data: AnTableColumnActionArg) => any
    text?: (data: AnTableColumnActionArg) => any
    click?: any
  }
  interface AnTableColumnActionArg extends AnTableColumnArg {
    action: AnTableColumnAction
  }
  interface UseTableColumn {
    /**
     * 行操作
     */
    actions?: UseTableColumnAction[]
  }
  interface AnTableColumn {
    actions?: AnTableColumnAction[]
  }
  interface AnTableConfig {
    actionConfirm: ModalConfig
  }
  interface AnTablePlugin {
    onOptionsColumnAction?: (this: AnTable, action: UseTableColumnAction, newAction: AnTableColumnAction) => void
  }
}

function columnRender(arg: AnTableColumnArg) {
  return arg.column.actions?.map(action => {
    const args = { ...arg, action }
    if (!toBool(action.visible ?? true, args)) {
      return null
    }
    if (action.render) {
      return action.render(args)
    }
    return (
      <Link
        style="margin-left: 4px;"
        hoverable={action.hoverable}
        status={action.status}
        disabled={toBool(action.disable ?? false, args)}
        onClick={() => action.click?.(args)}
      >
        {{
          icon: action.icon && (() => action.icon!(args)),
          default: action.text && (() => action.text!(args)),
        }}
      </Link>
    )
  })
}

function confirmAction(this: AnTable, arg: AnTableColumnActionArg) {
  const c = arg.action.confirm!
  const config = typeof c === 'string' ? { content: c } : c
  defaultsDeep(config, this.config.actionConfirm)
  config.onOk = () => arg.action.onClick?.(arg)
  if (isString(config.title)) {
    config.title = this.t(config.title)
  }
  if (isString(config.content)) {
    config.content = this.t(config.content)!
  }
  if (config.cancelText) {
    config.cancelText = this.t(config.cancelText)
  }
  if (config.okText) {
    config.okText = this.t(config.okText)
  }

  Modal.open(config)
}

export default defineTablePlugin({
  name: 'action',
  onOptionsColumn(column, target) {
    if (!column.actions) {
      return
    }
    target.actions = column.actions.map(action => {
      const newAction = { ...action } as AnTableColumnAction
      newAction.click ??= action.onClick
      if (isString(action.icon)) {
        newAction.icon = () => <span class={action.icon}></span>
      }
      if (isString(action.text)) {
        newAction.text = () => this.t(action.text as string)
      }
      if (action.confirm) {
        newAction.click = confirmAction.bind(this)
      }
      this.callParal('onOptionsColumnAction', action, newAction)
      return newAction
    })
    target.render = columnRender
  },
})
