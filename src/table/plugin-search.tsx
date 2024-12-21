import { Button } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { defaultsDeep } from 'lodash-es'
import { toBool } from '../core'
import { AnForm, AnFormConfig, AnFormPlugin, useForm, UseFormItem, UseFormOptions } from '../form'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  type UseTableSearchItem = UseFormItem & {}
  interface UseTableSearch extends Omit<UseFormOptions, 'submit' | 'name' | 'items' | 'modal'> {
    /**
     * 是否可见
     */
    visible?: (form: UseTableSearch) => boolean
    /**
     * 表单项
     */
    items?: UseTableSearchItem[]
  }
  interface AnTableConfigSearch extends AnFormConfig {
    /**
     * 当隐藏标签时，是否使用标签作为输入提示。
     * @default
     * ```ts
     * true
     * ```
     */
    labelAsPlacecholder: boolean
  }
  interface UseTableOptions {
    /**
     * 公用表单项，搜索表单，新增表单，更新表单根据 `field` 字段复用。
     * @see useForm.item
     */
    items?: UseFormItem[]
    /**
     * 搜索表单项或搜索表单
     * @see useForm
     */
    search?: UseTableSearch | UseTableSearchItem[]
  }
  interface AnTable {
    /**
     * 获取搜索表单
     * @example
     * ```ts
     * getSearchForm()?.validate() // 检验表单
     * ```
     */
    getSearchForm: () => AnForm | undefined
  }
  interface AnTableConfig {
    search: AnTableConfigSearch
  }
}

AnTable.prototype.getSearchForm = function () {
  return this.shared.search
}

export function defaultsItems(items: UseFormItem[], source: UseFormItem[]) {
  if (!source.length) {
    return items
  }
  const map = source.reduce((m, v) => ((m[v.field] = v), m), {} as Record<string, UseFormItem>)
  return items.map(item => {
    if (!map[item.field]) {
      return item
    }
    return defaultsDeep(item, map[item.field])
  })
}

function itemRender(this: AnTable) {
  if (!this.shared.search) {
    return null
  }
  if (!toBool(true, this.shared.search)) {
    return null
  }
  return <this.shared.search class="an-table-inline-search" />
}

function searchPlugin(this: AnTable): AnFormPlugin {
  const table = this
  const tableCfg = this.config
  const labled = tableCfg.search.labelAsPlacecholder
  const submitRender = () => (
    <>
      {/* <Button disabled={table.loading()}>
        {{
          icon: () => <IconRefresh />,
        }}
      </Button> */}
      <Button type="primary" loading={table.loading()} onClick={() => table.load()}>
        {{
          icon: () => <IconSearch></IconSearch>,
        }}
      </Button>
    </>
  )
  return {
    name: 'search',
    onOptionsBefore() {
      this.options.items ??= []
      let hasSubmit = false
      for (const item of this.options.items) {
        if (item.label && labled) {
          item.placeholder = item.label
        }
        if (item.setter === 'submit') {
          hasSubmit = true
        }
      }
      if (!this.config.autoSubmitItem) {
        return
      }
      if (hasSubmit) {
        return
      }
      this.options.items.push({
        field: '',
        setter: 'submit',
        itemProps: {
          style: {
            marginRight: '0',
          },
        },
        itemSlots: {
          default: submitRender,
        },
      })
    },
  }
}

export default defineTablePlugin({
  name: 'search',
  onOptionsBefore() {
    if (!this.options.search) {
      return
    }
    this.options.toolbar ??= []
    this.options.toolbar.push({
      // type: 'search',
      sort: 75,
      render: itemRender.bind(this),
    })
  },
  onOptions(options) {
    if (!options.search) {
      return
    }
    let search = options.search
    search = options.search = Array.isArray(search) ? { items: search } : search
    search.config = defaultsDeep((search.config ??= {}), this.config.search)
    search.items = defaultsItems(search.items ?? [], options.items ?? [])
    search.plugins ??= []
    search.plugins.push(searchPlugin.bind(this)())
    this.shared.search = useForm(search as UseFormOptions)
  },
  onLoadBefore(params) {
    if (!this.shared.search) {
      return
    }
    defaultsDeep(params, this.shared.search.getModel())
  },
})
