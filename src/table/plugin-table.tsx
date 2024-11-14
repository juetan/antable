import {
  Table as BaseTable,
  TableColumnData as BaseTableColumn,
  TableInstance as BaseTableInstance,
  PaginationProps,
  TableData,
} from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { computed, MaybeRef, MaybeRefOrGetter, onMounted } from 'vue'
import { MaybePromise, Recordable, toBool } from '../core'
import type { AnTableColumn, AnTableData, UseTableColumn, UseTableData } from './table'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  interface BaseTableProps extends Omit<BaseTableInstance['$props'], '1'> {}
  interface BaseTableSlots {
    /**
     * 自定义 th 元素
     */
    th?: (column: UseTableColumn) => any
    /**
     * 自定义 thead 元素
     */
    thead?: () => any
    /**
     * 空白展示
     */
    empty?: () => any
    /**
     * 总结行
     */
    'summary-cell'?: (column: UseTableColumn, record: TableData, rowIndex: number) => any
    /**
     * 分页器右侧内容
     */
    'pagination-right'?: () => any
    /**
     * 分页器左侧内容
     */
    'pagination-left'?: () => any
    /**
     * 自定义 td 元素
     */
    td?: (column: UseTableColumn, record: TableData, rowIndex: number) => any
    /**
     * 自定义 tr 元素
     */
    tr?: (column: UseTableColumn, record: TableData, rowIndex: number) => any
    /**
     * 自定义 tbody 元素
     */
    tbody?: () => any
    /**
     * 拖拽锚点图标
     */
    'drag-handle-icon'?: () => any
    /**
     * 表格底部
     */
    footer?: () => any
    /**
     *  展开行内容
     */
    'expand-row'?: () => any
    /**
     * 展开行图标
     */
    'expand-icon'?: () => any
  }
  interface UseTableDataFnReturns {
    type1: TableData[]
    type2: {
      data: TableData[]
      total: number
    }
  }
  interface UseTableDataObject {
    showLoading?: boolean
    load?: (params: Recordable) => MaybePromise<UseTableDataFnReturns[keyof UseTableDataFnReturns]>
    loadOn?: 'setup' | 'mounted' | false
  }
  interface UseTableDatas {
    type1: UseTableDataObject['load']
    type2: Recordable[]
    type3: UseTableDataObject
  }
  interface UseTableColumnBase extends BaseTableColumn {
    visible?: MaybeRefOrGetter<boolean> | ((item: AnTableColumn) => boolean)
  }
  interface AnTableColumn extends BaseTableColumn {
    visible?: MaybeRefOrGetter<boolean> | ((item: AnTableColumn) => boolean)
    visibled: MaybeRef<boolean>
  }
  interface UseTableColumns {
    type1: UseTableColumnBase
  }
  interface UseTablePaging extends PaginationProps {
    visible?: MaybeRefOrGetter<boolean>
  }
  type UseTableData = UseTableDatas[keyof UseTableDatas]
  type UseTableColumn = UseTableColumns[keyof UseTableColumns]

  interface UseTableOptions {
    data?: UseTableDatas[keyof UseTableDatas]
    paging?: UseTablePaging
    columns?: UseTableColumn[]
    tableProps?: BaseTableProps
    tableSlots?: BaseTableSlots
  }
  interface AnTableData extends UseTableDataObject {}
  interface AnTableState {
    tableProps: BaseTableProps
    tableSlots: BaseTableSlots
    tableRef: BaseTableInstance | null
    selection: any
    data: TableData[]
    dataed: AnTableData
    columns: AnTableColumn[]
    columnsed: MaybeRef<AnTableColumn[]>
  }
  interface AnTableConfig {
    tableProps: BaseTableProps
    tableSlots: BaseTableSlots
    column: UseTableColumn
    data: UseTableDataObject
  }
  interface AnTable {
    load: (params?: Recordable) => Promise<void>
    reload: () => void
    setData: (data: TableData[]) => void
    getData: () => TableData[]
    loading: (value?: boolean) => boolean
    getTableRef: () => BaseTableInstance | null
  }
  interface AnTablePlugin {
    onLoadBefore?: (this: AnTable, params: Recordable) => void
    onLoad?: (this: AnTable, loader: UseTableDataObject, params: Recordable) => MaybePromise<any>
    onLoadAfter?: (this: AnTable, result: any, error: any, params: Recordable) => void
    onOptionsColumn?: (this: AnTable, column: UseTableColumn) => void
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
  let result, error
  if (data.showLoading) {
    props.loading = true
  }
  try {
    this.callParal('onLoadBefore', params)
    result = await this.callFirstAsync('onLoad', data, params)
    if (!result) {
      result = await data.load?.(params)
    }
    if (Array.isArray(result)) {
      this.state.data = result
    }
  } catch (e) {
    error = e
  } finally {
    props.loading = false
  }
  this.callParal('onLoadAfter', result, error, params)
}

function parseData(this: AnTable, option: UseTableData) {
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
  const column = { ...option } as AnTableColumn
  this.callParal('onOptionsColumn', option, column)
  return column
}

function AnTableRender(this: AnTable) {
  return (
    <BaseTable
      {...this.state.tableProps}
      data={this.state.data}
      columns={this.state.columnsed as any[]}
      pagination={this.state.paginged}
    >
      {{ ...this.state.tableSlots }}
    </BaseTable>
  )
}

export default defineTablePlugin({
  name: 'table',
  onOptions(options) {
    options.tableSlots ??= {}
    options.tableProps ??= {}
    options.tableProps.ref = (el: any) => (this.state.tableRef = el)
    options.columns ??= []
    const tableProps = defaultsDeep(options.tableProps, this.config.tableProps)
    const tableSlots = defaultsDeep(options.tableSlots, this.config.tableSlots)
    const dataed = parseData.call(this, options.data)
    const columns = options.columns.map(parseColumn.bind(this))
    this.setState({ tableProps, tableSlots, columns, dataed } as any)
    this.addChild(AnTableRender.bind(this))
  },
  onOptionsAfter() {
    for (const column of this.state.columns) {
      column.visibled = computed(() => toBool(column.visible ?? true, column))
    }
    this.state.columnsed = computed(() => this.state.columns.filter(i => i.visibled))
  },
  onComponent(component) {
    component.name = this.options.name ?? this.config.name
    component.setup = this.setup.bind(this)
  },
  onSetup() {
    const data = this.state.dataed
    if (data.loadOn === 'mounted') {
      onMounted(() => this.load())
    } else if (data.loadOn === 'setup') {
      this.load()
    }
  },
})
