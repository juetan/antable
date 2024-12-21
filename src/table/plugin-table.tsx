import { Table as BaseTable, TableColumnData, TableInstance, TableData } from '@arco-design/web-vue'
import { defaultsDeep, isArray, isObject } from 'lodash-es'
import { computed, MaybeRef, MaybeRefOrGetter, onMounted, VNodeChild } from 'vue'
import { MaybePromise, Recordable, toBool } from '../core'
import type { AnTableColumn, AnTableData, UseTableColumn, UseTableData } from './table'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  type BaseTableProps = TableInstance['$props'] & {}
  interface BaseTableSlots {
    td?: (column: UseTableColumn, record: TableData, rowIndex: number) => any
    th?: (column: UseTableColumn) => any
    tr?: (column: UseTableColumn, record: TableData, rowIndex: number) => any
    empty?: () => any
    thead?: () => any
    tbody?: () => any
    footer?: () => any
    'pagination-right'?: () => any
    'pagination-left'?: () => any
    'expand-row'?: () => any
    'expand-icon'?: () => any
    'drag-handle-icon'?: () => any
    'summary-cell'?: (column: UseTableColumn, record: TableData, rowIndex: number) => any
  }
  interface AnTableDataFnObject {
    data?: TableData[]
  }
  interface AnTableDataFn {
    (params: Recordable): MaybePromise<TableData[] | AnTableDataFnObject>
  }
  interface AnTableDataObject {
    /**
     * 是否显示 loading
     * @default
     * ```ts
     * false
     * ```
     */
    loading?: boolean
    /**
     * 加载数据的函数
     * @example
     * ```ts
     * () => []
     * ```
     */
    load?: AnTableDataFn
    /**
     * 执行加载函数的时机
     * @default
     * ```ts
     * 'mounted'
     * ```
     */
    loadOn?: 'setup' | 'mounted' | false
  }
  interface AnTableColumnArg {
    record: TableData
    column: AnTableColumn
    rowIndex: number
  }
  interface AnTableColumnBase extends Omit<TableColumnData, 'render'> {
    render?: (data: AnTableColumnArg) => VNodeChild
  }
  interface UseTableColumn extends AnTableColumnBase {
    /**
     * 是否可见
     * @by table
     * @example
     * ```ts
     * () => true
     * ```
     */
    visible?: MaybeRefOrGetter<boolean> | ((item: AnTableColumn) => boolean)
  }
  interface AnTableColumn extends AnTableColumnBase {
    visible?: MaybeRefOrGetter<boolean> | ((item: AnTableColumn) => boolean)
    visibled?: MaybeRef<boolean>
  }
  type UseTableData = string | TableData[] | AnTableDataFn | AnTableDataObject

  interface UseTableOptions {
    /**
     * 数据源，可以是数组，函数或更复杂的对象。
     * @by table
     * @example
     * ```ts
     * []                              // 数组
     * (params) => [] | { data, toal } // 函数
     * { load, loadOn: 'mounted' }     // 对象
     * ```
     */
    data?: string | TableData[] | AnTableDataFn | AnTableDataObject
    /**
     * 表格列
     * @by table
     * @example
     * ```ts
     * {
     *   title: '用户名'
     *   dataIndex: 'username',
     * }
     * ```
     */
    columns?: UseTableColumn[]
    /**
     * 传递给 Table 组件的额外 props
     * @by table
     * @see https://arco.design/vue/component/table#API
     */
    tableProps?: BaseTableProps
    /**
     * 传递给 Table 组件的额外 slots
     * @by table
     * @see https://arco.design/vue/component/table#API
     */
    tableSlots?: BaseTableSlots
  }
  interface AnTableData extends AnTableDataObject {}
  interface AnTableState {
    tableProps: BaseTableProps
    tableSlots: BaseTableSlots
    tableRef: TableInstance | null
    data: TableData[]
    dataed: AnTableData
    columns: AnTableColumn[]
    columnsed: MaybeRef<AnTableColumn[]>
  }
  interface AnTableConfig {
    tableProps: BaseTableProps
    tableSlots: BaseTableSlots
    column: UseTableColumn
    data: AnTableDataObject
  }
  interface AnTable {
    load: (params?: Recordable) => Promise<void>
    reload: () => void
    setData: (data: TableData[]) => void
    getData: () => TableData[]
    loading: (value?: boolean) => boolean
    /**
     * 获取 Table 组件实例
     * @by table
     * @example
     * ```ts
     * getTableRef()?.selectAll()  // 全选
     * ```
     */
    getTableRef: () => TableInstance | null
  }
  interface AnTablePlugin {
    onLoadBefore?: (this: AnTable, params: Recordable) => void
    onLoad?: (this: AnTable, loader: AnTableDataObject, params: Recordable) => MaybePromise<any>
    onLoadAfter?: (this: AnTable, arg: { result: any; error: any; params: Recordable }) => void
    onOptionsColumnBefore?: (this: AnTable, column: UseTableColumn) => void
    onOptionsColumn?: (this: AnTable, column: UseTableColumn, target: AnTableColumn) => void
    onOptionsColumnAfter?: (this: AnTable, column: AnTableColumn) => void
    onSetupColumn?: (this: AnTable, column: UseTableColumn) => void
  }
}

AnTable.prototype.setData = function (data) {
  this.state.data = data
}

AnTable.prototype.getData = function () {
  return this.state.data ?? []
}

AnTable.prototype.reload = function () {
  return this.load()
}

AnTable.prototype.getTableRef = function () {
  return this.state.tableRef
}

AnTable.prototype.loading = function (val) {
  const props = this.state.tableProps
  if (val === undefined) {
    return Boolean(props.loading)
  }
  return (props.loading = Boolean(val))
}

AnTable.prototype.load = async function (params = {}) {
  const data = this.state.dataed
  const props = this.state.tableProps
  const arg = { result: null, error: null, params } as any
  if (data.loading) {
    props.loading = true
  }
  this.callParal('onLoadBefore', params)
  try {
    arg.result = await this.callFirstAsync('onLoad', data, params)
    if (!arg.result) {
      arg.result = await data.load?.(params)
    }
    if (isArray(arg.result)) {
      this.state.data = arg.result
    } else if (isObject(arg.result)) {
      this.state.data = arg.data
    }
  } catch (e) {
    console.log(e)
    arg.error = e
  }
  props.loading = false
  this.callParal('onLoadAfter', arg)
}

function parseData(this: AnTable, option?: UseTableData) {
  const data = defaultsDeep({}, this.config.data) as AnTableData
  if (typeof option === 'function') {
    data.load = option
  } else if (Array.isArray(option)) {
    data.load = () => option
  } else {
    Object.assign(data, data)
  }
  return data
}

function parseColumn(this: AnTable, option: UseTableColumn) {
  defaultsDeep(option, this.config.column)
  const column = { ...option } as unknown as AnTableColumn
  this.callParal('onOptionsColumn', option, column)
  return column
}

function Table(this: AnTable) {
  return (
    <BaseTable {...this.state.tableProps} data={this.state.data}>
      {{ ...this.state.tableSlots }}
    </BaseTable>
  )
}

export default defineTablePlugin({
  name: 'table',
  onOptionsBefore() {
    const fn = (arg: unknown) => this.callParal('onOptionsColumnBefore', arg)
    this.options.columns?.forEach(fn)
  },
  onOptions(options) {
    options.tableSlots ??= {}
    options.tableProps ??= {}
    options.tableProps.ref = (el: any) => (this.state.tableRef = el)
    options.columns ??= []
    const tableProps = defaultsDeep((options.tableProps ??= {}), this.config.tableProps)
    const tableSlots = defaultsDeep((options.tableSlots ??= {}), this.config.tableSlots)
    const dataed = parseData.call(this, options.data)
    const columns = options.columns.map(parseColumn.bind(this))
    this.setState({ tableProps, tableSlots, columns, dataed, data: [] } as any)
    this.addChild(Table.bind(this))
  },
  onOptionsAfter() {
    for (const column of this.state.columns) {
      this.callParal('onOptionsColumnAfter', column)
      column.visibled = computed(() => toBool(column.visible ?? true, column))
    }
    this.state.tableProps.columns = computed(() => this.state.columns.filter(i => i.visibled)) as any
  },
  onSetup() {
    const data = this.state.dataed
    if (data.loadOn === 'setup') {
      this.load()
      return
    }
    if (data.loadOn === 'mounted') {
      onMounted(() => this.load())
      return
    }
  },
})
