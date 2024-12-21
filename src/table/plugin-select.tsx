import { watch, watchEffect } from 'vue'
import { Recordable } from '../core'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  interface AnTableToolbarItem {
    /**
     * 多选。注意：需正确设置 `tableProps.rowKey` 参数(默认为：`'id'`)。
     * @example
     * ```ts
     * (rowKeys, rows) => console.log(rowKeys, rows)
     * ```
     */
    onSelect?: (rowKeys: (string | number)[], rows: Recordable[]) => void
  }
  interface AnTable {
    /**
     * 获取选中项的值，取决于 `tableProps.rowKey` 参数(默认为 `id`)
     * @example
     * ```ts
     * [1,2]
     * ```
     */
    getSelectedRowKeys: <T extends string | number = string | number>() => T[]
    /**
     * 获取选中项
     * @example
     * ```ts
     * [row, row]
     * ```
     */
    getSelectedRows: () => Recordable[]
    /**
     * 清空已选。
     */
    clearSelected: () => void
  }
  interface AnTableConfig {
    /**
     * 表格数据改变时，是否清空已选
     * @default
     * ```ts
     * true
     * ```
     */
    clearSelectedOnChange: boolean
  }
  interface AnTableState {
    selectedRowKeys?: Set<string | number>
    selectedRows?: Map<string | number, Recordable>
  }
}

AnTable.prototype.getSelectedRowKeys = function () {
  return [...(this.state.selectedRowKeys ?? [])] as any
}

AnTable.prototype.getSelectedRows = function () {
  return [...(this.state.selectedRows?.values() ?? [])]
}

AnTable.prototype.clearSelected = function () {
  this.state.selectedRows?.clear()
  this.state.selectedRowKeys?.clear()
}

export default defineTablePlugin({
  name: 'select',
  onOptionsToolbarItem(item, newItem) {
    if (!item.onSelect) {
      return
    }
    this.shared.hasSelect = true
    newItem.onClick = () => {
      const keys = this.getSelectedRowKeys()
      const rows = this.getSelectedRows()
      item.onSelect?.(keys, rows)
    }
  },
  onOptionsAfter() {
    if (!this.shared.hasSelect) {
      return
    }
    this.setState(
      {
        tableProps: { rowSelection: { showCheckedAll: true } },
        selectedRows: new Map(),
        selectedRowKeys: new Set(),
      },
      'defaults',
    )
    const props = this.state.tableProps
    const { onSelect, onSelectAll, onChange } = props
    props.onSelect = (rowKeys, rowKey, record) => {
      onSelect?.(rowKeys, rowKey, record)
      const rows = this.state.selectedRows!
      const keys = this.state.selectedRowKeys!
      if (rowKeys.includes(rowKey)) {
        rows.set(rowKey, record)
        keys.add(rowKey)
      } else {
        rows.delete(rowKey)
        keys.delete(rowKey)
      }
    }
    props.onSelectAll = checked => {
      onSelectAll?.(checked)
      const key = this.state.tableProps.rowKey ?? 'id'
      const rows = this.state.selectedRows!
      const keys = this.state.selectedRowKeys!
      for (const row of this.state.data) {
        if (checked) {
          rows.set(row[key], row)
          keys.add(row[key])
        } else {
          rows.delete(row[key])
          keys.delete(row[key])
        }
      }
    }
    props.onChange = (...args) => {
      onChange?.(...args)
      console.log('data change', args)
      this.config.clearSelectedOnChange && this.clearSelected()
    }
    watchEffect(() => {
      // @ts-ignore
      this.state.tableProps.selectedKeys = [...this.state.selectedRowKeys]
    })
    watch(
      () => this.state.data,
      () => {
        console.log('data change1')
        this.config.clearSelectedOnChange && this.clearSelected()
      },
    )
  },
})
