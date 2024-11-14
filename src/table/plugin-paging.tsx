import { PaginationProps } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import { computed, MaybeRefOrGetter } from 'vue'
import { toBool } from '../core'
import { defineTablePlugin } from './table'

declare module './table' {
  interface UseTablePaging extends PaginationProps {
    pageKey?: string
    sizeKey?: string
    disable?: MaybeRefOrGetter<boolean>
  }
  interface AnTablePaging extends PaginationProps {
    pageKey: string
    sizeKey: string
    disable?: MaybeRefOrGetter<boolean>
  }
  interface UseTableOptions {
    paging?: UseTablePaging
  }
  interface AnTableState {
    paging: AnTablePaging
    paginged: AnTablePaging | false
  }
  interface AnTableConfig {
    paging: UseTablePaging
  }
  interface AnTablePlugin {
    onPageChange?: (this: AnTable, page: number) => void
    onPageSizeChange?: (this: AnTable, pageSize: number) => void
  }
}

export default defineTablePlugin({
  name: 'paging',
  onOptions(options) {
    if (!options.paging) {
      return
    }
    const onPageChange = (page: number) => this.callParal('onPageChange', page)
    const onPageSizeChange = (size: number) => this.callParal('onPageSizeChange', size)
    const tableProps = { onPageChange, onPageSizeChange }
    const paging = defaultsDeep((options.paging ??= {}), this.config.paging)
    this.setState({ paging, tableProps })
  },
  onOptionsAfter() {
    this.state.paginged = computed(() => {
      const paging = this.state.paging
      return toBool(paging?.disable ?? false) ? false : paging
    }) as any
  },
  onLoadBefore(params) {
    const paging = this.state.paging
    params[paging.pageKey!] ??= paging.current
    params[paging.sizeKey!] ??= paging.pageSize
  },
  onLoadAfter(_, error, params) {
    if (error) {
      return
    }
    const { paging } = this.state
    const { pageKey, sizeKey } = paging
    if (params[pageKey]) {
      paging.current = params[pageKey]
    }
    if (params[sizeKey]) {
      paging.pageSize = params[sizeKey]
    }
  },
  onPageChange(page) {
    const paging = this.state.paging
    this.load({ [paging.pageKey]: page })
  },
  onPageSizeChange(pageSize) {
    const { pageKey, sizeKey } = this.state.paging
    this.load({ [pageKey]: 1, [sizeKey]: pageSize })
  },
})
