import { Button, ButtonProps } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { computed, MaybeRef, MaybeRefOrGetter, VNodeChild } from 'vue'
import { Recordable, toBool } from '../core'
import type { AnTable, AnTableToolbarItem, UseTableToolbar, UseTableToolbarItem } from './table'
import { defineTablePlugin } from './table'

interface UseButton extends Omit<ButtonProps, 'disabled'> {
  key?: string
  icon?: string | ((item: UseButton) => VNodeChild)
  text?: string | ((item: UseButton) => VNodeChild)
  position?: 'left' | 'right' | number
  order?: number
  disable?: MaybeRefOrGetter<boolean> | ((item: UseButton) => boolean)
  visible?: MaybeRefOrGetter<boolean> | ((item: UseButton) => boolean)
  render?: (item: UseButton) => VNodeChild
  onClick?: () => void
}

export interface UseToolbarItems {
  type1: UseButton
  type2: () => VNodeChild
}

type TableButton = UseButton

declare module './table' {
  interface UseTableToolbarItem extends UseButton {}
  interface AnTableToolbarItem {
    key: string
    order: number
    props: Recordable
    slots: Recordable
    render: (item: AnTableToolbarItem) => VNodeChild
    disable?: MaybeRefOrGetter<boolean> | ((item: AnTableToolbarItem) => boolean)
    visible?: MaybeRefOrGetter<boolean> | ((item: AnTableToolbarItem) => boolean)
  }
  interface UseTableToolbar {
    items?: UseTableToolbarItem[]
  }
  interface UseTableOptions {
    toolbar?: UseTableToolbarItem[] | UseTableToolbar
  }
  interface AnTableStateToolbar {
    items: AnTableToolbarItem[]
    itemsed: MaybeRef<AnTableToolbarItem[]>
    counted: number
  }
  interface AnTableState {
    toolbar: AnTableStateToolbar
  }
  interface AnTableConfigToolbar {
    item: UseTableToolbarItem
    itemDivider: UseTableToolbarItem
    leftOrder: number
    rightOrder: number
  }
  interface AnTableConfig {
    toolbarItem: UseTableToolbarItem
    toolbarLeftOrder: number
    toolbarRightOrder: number
    toolbarOrder: number
    toolbarDivider: UseTableToolbarItem
  }
  interface AnTablePlugin {
    onOptionsToolbarItem?: (this: AnTable, item: UseTableToolbarItem) => AnTableToolbarItem | void
  }
}

function itemRender(this: AnTable, item: AnTableToolbarItem) {
  return (
    <Button {...item.props} disabled={toBool(item.disable ?? false, item)}>
      {{ ...item.slots }}
    </Button>
  )
}

function render(this: AnTable) {
  const itemsed = this.state.toolbar.itemsed as any[]
  if (!itemsed.length) {
    return null
  }
  return (
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      {itemsed.map(i => i.render?.(i))}
    </div>
  )
}

function parseItem(this: AnTable, item: UseTableToolbarItem) {
  item = defaultsDeep(item, this.config.toolbarItem)
  const { visible, disable, order, position, render, onClick, text, icon, ...props } = item
  const newItem = { props, visible, order, disable, render: itemRender } as AnTableToolbarItem
  if (item.onClick) {
    newItem.props.onClick = () => item.onClick?.()
  }
  if (item.render) {
    newItem.slots ??= {}
    newItem.slots.default = item.render
  }
  if (item.text) {
    newItem.slots ??= {}
    newItem.slots.default = () => item.text
  }
  if (item.icon) {
    newItem.slots ??= {}
    newItem.slots.icon = () => item.icon
  }
  return newItem
}

const divider = {
  order: 0,
  render: () => <div style="flex: 1"></div>,
}

export default defineTablePlugin({
  name: 'toolbar',
  onOptions(options) {
    if (!options.toolbar) {
      return
    }
    options.toolbar = Array.isArray(options.toolbar) ? { items: options.toolbar } : options.toolbar
    options.toolbar.items ??= []
    options.toolbar.items.push(divider)
    const items = options.toolbar.items.map(parseItem.bind(this))
    this.setState({ toolbar: { items } })
    this.addChild(render.bind(this), 5)
  },
  onOptionsAfter() {
    this.state.toolbar.itemsed = computed(() => {
      const items = this.state.toolbar.items.filter(i => toBool(i.visible ?? true, i))
      items.sort((a, b) => (a.order ?? -1) - (b.order ?? -1))
      return items
    })
  },
})

export function finalToolbarOption(rawToolbar?: TableButton[] | UseTableToolbar): UseTableToolbar {
  const toolbar: UseTableToolbar = { items: [] }
  if (Array.isArray(rawToolbar)) {
    toolbar.items = rawToolbar
  }
  if (typeof rawToolbar === 'object') {
    Object.assign(rawToolbar, toolbar)
  }
  return toolbar
}
