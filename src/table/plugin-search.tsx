import { Button } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { defaultsDeep } from 'lodash-es'
import { toBool } from '../core'
import { AnForm, AnFormConfig, AnFormPlugin, useForm, UseFormItem, UseFormOptions } from '../form'
import { AnTable, defineTablePlugin } from './table'

declare module './table' {
  type UseTableSearchItem = UseFormItem & {}
  interface UseTableSearch extends Omit<UseFormOptions, 'submit' | 'name' | 'items' | 'modal'> {
    visible?: (form: UseTableSearch) => boolean
    items?: UseTableSearchItem[]
  }
  interface AnTableConfigSearch extends AnFormConfig {
    labelAsPlacecholder: boolean
  }
  interface UseTableOptions {
    search?: UseTableSearch | UseTableSearchItem[]
  }
  interface AnTable {
    getSearchForm(): AnForm | undefined
  }
  interface AnTableConfig {
    search: AnTableConfigSearch
  }
}

AnTable.prototype.getSearchForm = function () {
  return this.shared.search
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
    <Button
      type="primary"
      style="position: relative; bottom: 1px"
      loading={table.loading()}
      onClick={() => table.load()}
    >
      {{
        icon: () => <IconSearch></IconSearch>,
        default: () => '搜索',
      }}
    </Button>
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
      if (!hasSubmit) {
        this.options.items.push({
          field: '',
          setter: 'submit',
          itemSlots: {
            default: submitRender,
          },
        })
      }
    },
  }
}

export default defineTablePlugin({
  name: 'search',
  onOptions(options) {
    let search = options.search
    if (!search) {
      return
    }
    search = options.search = Array.isArray(search) ? { items: search } : search
    search.config = defaultsDeep((search.config ??= {}), this.config.search)
    search.plugins ??= []
    search.plugins.push(searchPlugin.bind(this)())
    this.shared.search = useForm(search)
  },
  onOptionsAfter() {
    this.state.toolbar.items.push({
      key: 'search',
      props: {},
      slots: {},
      order: 50,
      render: itemRender.bind(this),
    })
  },
  onLoadBefore(params) {
    const model = this.getSearchForm()!.getModel()
    defaultsDeep(params, model)
  },
})
