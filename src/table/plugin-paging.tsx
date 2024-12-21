import { PaginationProps } from '@arco-design/web-vue'
import { defaultsDeep, isArray } from 'lodash-es'
import { computed, MaybeRefOrGetter } from 'vue'
import { toBool } from '../core'
import { defineTablePlugin } from './table'

declare module './table' {
  interface UseTablePaging extends PaginationProps {
    /**
     * 当前页，传递给 data 函数时的字段名
     * @default
     * ```ts
     * 'page'
     * ```
     */
    pageKey?: string
    /**
     * 每页数据量，传递给 data 函数时的字段名
     * @default
     * ```ts
     * 'size'
     * ```
     */
    sizeKey?: string
    /**
     * 是否禁用
     * @example
     * ```ts
     * true                            // 字面量
     * () => true                      // getter
     * computed(() => true)            // computed
     */
    disable?: MaybeRefOrGetter<boolean>
  }
  interface UseTableOptions {
    /**
     * 分页
     * @example
     * ```ts
     * {
     *   pageSize: 10
     * }
     * ```
     */
    paging?: UseTablePaging
  }
  interface AnTablePaging extends PaginationProps {
    pageKey: string
    sizeKey: string
    disable?: MaybeRefOrGetter<boolean>
  }
  interface UseTableOptions {
    /**
     * 分页设置
     */
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
    if (options.paging !== void 0 && !options.paging) {
      return
    }
    const onPageChange = (page: number) => this.callParal('onPageChange', page)
    const onPageSizeChange = (size: number) => this.callParal('onPageSizeChange', size)
    const tableProps = { onPageChange, onPageSizeChange }
    const paging = defaultsDeep((options.paging ??= {}), this.config.paging)
    this.setState({ paging, tableProps })
  },
  onOptionsAfter() {
    if (!this.state.paging) {
      return
    }
    this.state.tableProps.pagination = computed(() => {
      const paging = this.state.paging
      return toBool(paging?.disable ?? false) ? false : paging
    }) as any
  },
  onLoadBefore(params) {
    if (!this.state.paging) {
      return
    }
    const paging = this.state.paging
    params[paging.pageKey!] ??= paging.current
    params[paging.sizeKey!] ??= paging.pageSize
  },
  onLoadAfter({ result, error, params }) {
    if (!this.state.paging) {
      return
    }
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
    if (isArray(result)) {
      paging.total = result.length
    } else if (typeof result?.total === 'number') {
      paging.total = result.total
    }
  },
  onPageChange(page) {
    if (!this.state.paging) {
      return
    }
    const paging = this.state.paging
    this.load({ [paging.pageKey]: page })
  },
  onPageSizeChange(pageSize) {
    if (!this.state.paging) {
      return
    }
    const { pageKey, sizeKey } = this.state.paging
    this.load({ [pageKey]: 1, [sizeKey]: pageSize })
  },
})
