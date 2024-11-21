import { Form, FormInstance, FormItem, FormItemInstance } from '@arco-design/web-vue'
import { cloneDeep, defaultsDeep, pick, uniqueId } from 'lodash-es'
import { computed, MaybeRefOrGetter, VNodeChild } from 'vue'
import { mapSlots, MaybePromise, Recordable, toBool } from '../core'
import type { AnFormItem, UseFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  type BaseFormProps = Omit<FormInstance['$props'], 'model'>
  type BaseFormItemProps = FormItemInstance['$props']
  type BaseFormItemSlots = AnFormItemSlotMapping<'default' | 'icon' | 'help' | 'extra'>

  interface UseFormItemBase extends AnFormItemBase {
    itemProps?: BaseFormItemProps
    itemSlots?: BaseFormItemSlots
    rules?: any[]
  }
  interface UseFormItemNull extends UseFormItemBase {
    setter?: undefined
    setterProps?: undefined
    setterSlots?: undefined
  }
  interface UseFormItems {
    base: UseFormItemNull
  }
  type UseFormItem = UseFormItems[keyof UseFormItems]

  interface AnFormItemBase {
    field: string
    value?: any
    label?: string
    placeholder?: string
    required?: boolean
    visible?: MaybeRefOrGetter<boolean> | ((item: AnFormItem, model: Recordable) => boolean)
    disable?: MaybeRefOrGetter<boolean> | ((item: AnFormItem, model: Recordable) => boolean)
  }
  interface AnFormItem extends AnFormItemBase {
    visibled: boolean
    disabled: boolean
    rulesed: any[] | undefined
    rules?: any[]
    setter?: string
    setterProps?: Recordable
    setterSlots?: Recordable
    shared: Recordable
    itemProps: BaseFormItemProps
    itemSlots: BaseFormItemSlots
  }
  interface AnFormItemArg {
    item: AnFormItem
    model: Recordable
  }
  type AnFormItemSlotMapping<T extends string> = {
    [K in T]?: (item: AnFormItem, model: Recordable) => VNodeChild
  }

  interface UseFormOptions {
    model?: Recordable
    items?: UseFormItem[]
    formProps?: BaseFormProps
    submit?: (model: Recordable, items: AnFormItem[]) => MaybePromise<void>
  }
  interface AnFormState {
    model: Recordable
    items: AnFormItem[]
    itemsed: AnFormItem[]
    formRef: FormInstance | null
    formProps: BaseFormProps
    submit: (model: Recordable, items: AnFormItem[]) => MaybePromise<void>
  }
  interface AnFormConfig {
    item: UseFormItem
    model: Recordable
    formProps: BaseFormProps
  }
  interface AnForm {
    submit: () => Promise<void>
    getFormRef: () => FormInstance | null
  }
  interface AnFormPlugin {
    onOptionsItemBefore?: (this: AnForm, item: UseFormItem) => void
    onOptionsItem?: (this: AnForm, item: UseFormItem, target: AnFormItem) => AnFormItem | void
    onSetupItem?: (this: AnForm, item: AnFormItem) => void
    onSubmitBefore?: (this: AnForm, model: Recordable) => void
  }
}

AnForm.prototype.submit = async function () {
  const errors = await this.state.formRef?.validate()
  if (errors) {
    return
  }
  const items = this.state.items
  const model = cloneDeep(this.state.model)
  this.callParal('onSubmitBefore', model)
  await this.state.submit?.(model, items)
}

AnForm.prototype.getFormRef = function () {
  return this.state.formRef
}

function itemRender(this: AnForm, item: AnFormItem) {
  return (
    <FormItem
      {...item.itemProps}
      field={item.field}
      rules={item.rulesed}
      label={this.t(item.label)}
      disabled={item.disabled}
    >
      {{ ...item.itemSlots }}
    </FormItem>
  )
}

function formRender(this: AnForm) {
  return (
    <Form {...this.state.formProps} model={this.state.model}>
      {this.state.itemsed.map(itemRender.bind(this))}
    </Form>
  )
}

const KEYS = [
  'field',
  'label',
  'visible',
  'disable',
  'required',
  'placeholder',
  'setter',
  'setterProps',
  'setterSlots',
  'itemProps',
  'itemSlots'
]

function createFormItem(this: AnForm, item: UseFormItem): AnFormItem {
  const newItem = pick(defaultsDeep(item, this.config.item), KEYS) as AnFormItem
  newItem.shared = {}
  newItem.itemProps ??= {}
  newItem.itemSlots ??= {}
  newItem.itemProps.key ??= uniqueId()
  this.callFirst('onOptionsItem', item, newItem)
  return newItem
}

function createFormItems(this: AnForm): AnFormItem[] {
  const submit = this.options.submit
  const submitItem = (this.options.items ??= []).find(i => i.setter === 'submit')
  if (submit && !submitItem) {
    this.options.items.push({ field: '', setter: 'submit' })
  }
  return this.options.items.map(createFormItem.bind(this))
}

export default defineFormPlugin({
  name: 'form',
  onOptionsBefore() {
    const fn = (item: any) => this.callParal('onOptionsItemBefore', item)
    this.options.items?.forEach(fn)
  },
  onOptions(options) {
    const formProps = defaultsDeep((options.formProps ??= {}), this.config.formProps)
    const model = defaultsDeep((options.model ??= {}), this.config.model)
    const items = createFormItems.call(this)
    const submit = options.submit
    formProps.ref = (el: any) => (this.state.formRef = el)
    this.setState({ model, items, formProps, submit })
    this.addChild(formRender.bind(this))
  },
  onOptionsAfter() {
    const model = this.state.model
    for (const item of this.state.items) {
      if (item.itemSlots) {
        mapSlots(item.itemSlots, item, model)
      }
      if (item.setterSlots) {
        mapSlots(item.setterSlots, item, model)
      }
      item.visibled = computed(() => toBool(item.visible ?? true, item, model)) as any
      item.disabled = computed(() => toBool(item.disable ?? false, item, model)) as any
      item.rulesed = computed(() => item.rules?.filter(i => toBool(i.disable ?? false, item, model))) as any
    }
    this.state.itemsed = computed(() => this.state.items.filter(i => i.visibled)) as any
  },
  onSetup() {
    const fn = (item: any) => this.callParal('onSetupItem', item)
    this.state.items.forEach(fn)
  }
})
