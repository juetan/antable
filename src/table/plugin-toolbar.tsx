import { Button, ButtonProps } from '@arco-design/web-vue'
import { defaultsDeep, isString } from 'lodash-es'
import { computed, MaybeRefOrGetter, VNodeChild } from 'vue'
import { toBool } from '../core'
import { AnTable } from './table'
import { defineTablePlugin } from './table'

interface AnButton<T = any> {
  /**
   * 图标
   * @example
   * ```tsx
   * icon: 'icon-edit'         // 使用 css 类名
   * icon: () => <IconEdit />  // 使用 jsx 函数或 h 函数
   * ```
   */
  icon?: string | ((item: T) => VNodeChild)
  /**
   * 显示文本
   * @example
   * ```tsx
   * text: '修改'            // 使用字符串
   * text: () => <MyEdit />  // 使用 jsx 函数或 h 函数
   * ```
   */
  text?: string | ((item: T) => VNodeChild)
  /**
   * 排序
   * @default
   * ```ts
   * 50
   * ```
   */
  sort?: number
  /**
   * 按钮状态
   * @example
   * ```js
   * 'warning'
   * ```
   */
  status?: ButtonProps['status']
  shape?: ButtonProps['shape']
  buttonType?: ButtonProps['type']
  /**
   * 是否禁用
   * @example
   * ```ts
   * true
   * ```
   */
  disable?: MaybeRefOrGetter<boolean> | ((arg: T) => boolean)
  /**
   * 是否可见
   * @example
   * ```ts
   * true
   * ```
   */
  visible?: MaybeRefOrGetter<boolean> | ((arg: T) => boolean)
  /**
   * 额外的 props
   */
  extraProps?: Omit<ButtonProps, 'disabled' | 'status' | 'type' | 'status' | 'shape'>
  /**
   * 自定义渲染函数。注意：指定此参数，其他参数将无效。
   * @example
   * ```tsx
   * () => <MyComponent />
   * ```
   */
  render?: (props: T) => VNodeChild
  onClick?: () => void
}

declare module './table' {
  interface AnTableToolbarItem extends AnButton<AnTableToolbarItem> {}
  interface UseTableOptions {
    /**
     * 工具栏按钮
     * @by toolbar
     * @example
     * ```ts
     * text: '按钮',
     * onClick: () => console.log('click')
     * ```
     */
    toolbar?: AnTableToolbarItem[]
  }
  interface AnTableState {
    toolbar: AnTableToolbarItem[]
    toolbared: AnTableToolbarItem[]
  }
  interface AnTableConfigToolbar {
    item: AnTableToolbarItem
  }
  interface AnTableConfig {
    toolbarItem: AnTableToolbarItem
  }
  interface AnTablePlugin {
    onOptionsToolbarItem?: (this: AnTable, item: AnTableToolbarItem, newItem: AnTableToolbarItem) => void
  }
}

function itemRender(this: AnTable, item: AnButton) {
  if (item.render) {
    return item.render(item)
  }
  return (
    <Button
      {...item.extraProps}
      disabled={toBool(item.disable ?? false, item)}
      status={item.status}
      shape={item.shape}
      type={item.buttonType}
      onClick={item.onClick}
    >
      {{
        icon: item.icon,
        default: item.text,
      }}
    </Button>
  )
}

function Toolbar(this: AnTable) {
  const itemsed = this.state.toolbared
  if (!itemsed.length) {
    return null
  }
  return (
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      {itemsed.map(itemRender.bind(this))}
    </div>
  )
}

export default defineTablePlugin({
  name: 'toolbar',
  onOptions(options) {
    const toolbar: AnButton[] = []
    for (const item of options.toolbar ?? []) {
      defaultsDeep(item, this.config.toolbarItem)
      const text = item.text
      const icon = item.icon
      if (isString(text)) {
        item.text = () => this.t(text as string)
      }
      if (isString(icon)) {
        item.icon = () => <span class={icon} />
      }
      this.callParal('onOptionsToolbarItem', item, item)
      toolbar.push(item)
    }
    toolbar.push({ sort: 50, render: () => <div style="flex: 1"></div> })
    toolbar.sort((a, b) => (a.sort ?? 25) - (b.sort ?? 25))
    this.setState({ toolbar })
    this.addChild(Toolbar.bind(this), 5)
  },
  onOptionsAfter() {
    // @ts-ignore
    this.state.toolbared = computed(() => this.state.toolbar.filter(i => toBool(i.visible ?? true, i)))
  },
})
