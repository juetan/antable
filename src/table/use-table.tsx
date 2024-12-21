import tableCreatePlugin from './plugin-create'
import tableModifyPlugin from './plugin-update'
import tablePagingPlugin from './plugin-paging'
import tableSearchPlugin from './plugin-search'
import tableActionPlugin from './plugin-action'
import tableDeletePlugin from './plugin-delete'
import tableSelectPlugin from './plugin-select'
import tablePlugin from './plugin-table'
import tableToolbarPlugin from './plugin-toolbar'
import { AnTable, UseTableOptions } from './table'

export function useTable(options: UseTableOptions | ((table: AnTable) => UseTableOptions)) {
  return new AnTable(options)
}

AnTable.setConfig({
  name: 'AnTable',
  clearSelectedOnChange: true,
  plugins: [
    tablePlugin,
    tablePagingPlugin,
    tableToolbarPlugin,
    tableSearchPlugin,
    tableCreatePlugin,
    tableModifyPlugin,
    tableActionPlugin,
    tableDeletePlugin,
    tableSelectPlugin,
  ],
  data: {
    loading: true,
    loadOn: 'mounted',
  },
  tableProps: {
    rowKey: 'id',
    bordered: false,
  },
  tableSlots: {},
  paging: {
    pageKey: 'page',
    sizeKey: 'size',
    current: 1,
    pageSize: 10,
    showTotal: true,
  },
  search: {
    autoSubmitItem: true,
    formProps: {
      layout: 'inline',
    },
    item: {
      itemProps: {
        hideLabel: true,
      },
    },
  },
  create: {
    showInToolbar: true,
    orderInToolbar: 0,
    modal: {
      title: '新增',
    },
  },
  update: {
    modal: {
      title: '修改',
    },
  },
  actionConfirm: {
    title: '提示',
    content: '确定删除吗?',
    titleAlign: 'start',
    width: 380,
    closable: false,
    maskClosable: false,
  },
})
