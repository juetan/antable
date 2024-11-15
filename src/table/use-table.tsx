import tableCreatePlugin from './plugin-create'
import tableModifyPlugin from './plugin-update'
import tablePagingPlugin from './plugin-paging'
import tableSearchPlugin from './plugin-search'
import tablePlugin from './plugin-table'
import tableToolbarPlugin from './plugin-toolbar'
import { AnTable, UseTableOptions } from './table'

AnTable.setConfig({
  name: 'AnTable',
  plugins: [
    tablePlugin,
    tablePagingPlugin,
    tableToolbarPlugin,
    tableSearchPlugin,
    tableCreatePlugin,
    tableModifyPlugin,
  ],
  data: {
    showLoading: true,
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
  },
  search: {
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
    orderInToolbar: -100,
  },
  update: {},
})

export function useTable(options: UseTableOptions | ((table: AnTable) => UseTableOptions)) {
  return new AnTable(options)
}
