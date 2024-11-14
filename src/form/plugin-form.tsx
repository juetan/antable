import { FieldRule, Form, FormInstance, FormItem, FormItemInstance } from '@arco-design/web-vue'
import { defaultsDeep, uniqueId } from 'lodash-es'
import { computed, MaybeRefOrGetter, VNodeChild } from 'vue'
import { mapSlots, MaybePromise, Recordable, toBool } from '../core'
import type { AnFormItem, UseFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface AnFormItemFnProps {
    item: UseFormItem
    model: Recordable
  }
  type AnFormItemSlotMapping<T extends string> = {
    [K in T]?: (item: AnFormItem, model: Recordable) => VNodeChild
  }
  type AnFormItemProps = FormItemInstance['$props']
  type AnFormItemSlots = AnFormItemSlotMapping<'default' | 'icon' | 'help' | 'extra'>
  interface AnFormItemPropsBase extends AnFormItemProps {}
  interface AnFormItemPropss extends AnFormItemProps {}
  interface AnFormRuleBase extends FieldRule {
    disable?: any
  }
  interface AnFormRule extends AnFormRuleBase {}
  interface AnFormSetters {}
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
    readonly visibled: boolean
    readonly disabled: boolean
    readonly rulesed: AnFormRule[] | undefined
    rules?: AnFormRule[]
    setter?: string
    setterProps?: Recordable
    setterSlots?: Recordable
    itemProps: AnFormItemPropss
    itemSlots: AnFormItemSlots
  }

  /** the base item */
  interface UseFormItemBase extends AnFormItemBase {
    itemProps?: AnFormItemPropss
    itemSlots?: AnFormItemSlots
    rules?: (string | AnFormRule)[]
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

  interface AnFormItemArg {
    item: UseFormItem
    model: Record<string, any>
  }
  type LibFormProps = Omit<FormInstance['$props'], 'model'>
  interface AnFormProps extends LibFormProps {}

  interface AnFormConfigRules {
    required: FieldRule
    string: FieldRule
    number: FieldRule
    email: FieldRule
    url: FieldRule
    ip: FieldRule
    phone: FieldRule
    idcard: FieldRule
    alphabet: FieldRule
    password: FieldRule
  }

  // for AnForm
  interface UseFormOptions {
    formProps?: AnFormProps
    model?: Recordable
    items?: UseFormItem[]
    submit?: (model: Recordable) => MaybePromise<void>
  }
  interface AnFormState {
    formProps: AnFormProps
    model: Recordable
    items: AnFormItem[]
    readonly itemsed: AnFormItem[]
    submit: (model: Recordable) => MaybePromise<void>
  }
  interface AnFormConfig {
    formProps: AnFormProps
    item: UseFormItem
    model: Recordable
    rules: AnFormConfigRules
  }
  interface AnFormPlugin {
    onOptionsItemBefore?: (this: AnForm, item: UseFormItem) => void
    onOptionsItem?: (this: AnForm, item: UseFormItem, target: AnFormItem) => AnFormItem | void
    onSetupItem?: (this: AnForm, item: AnFormItem) => void
  }
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

function render(this: AnForm) {
  return (
    <Form {...this.state.formProps} model={this.state.model}>
      {this.state.itemsed.map(itemRender.bind(this))}
    </Form>
  )
}

function createAnFormItem(this: AnForm, item: UseFormItem): AnFormItem {
  defaultsDeep(item, this.config.item)
  const {
    field,
    label,
    placeholder,
    required,
    visible,
    disable,
    setter,
    setterProps,
    setterSlots,
    itemProps = {},
    itemSlots = {},
  } = item
  const newItem = {
    field,
    label,
    placeholder,
    required,
    visible,
    disable,
    setter,
    setterProps,
    setterSlots,
    itemSlots,
    itemProps: {
      key: uniqueId(),
      ...itemProps,
    },
  } as AnFormItem
  this.callFirst('onOptionsItem', item, newItem)
  return newItem
}

export default defineFormPlugin({
  name: 'form',
  description: '',
  onInit() {
    this.setState({
      items: [],
      model: {},
      formProps: {},
    })
  },
  onOptionsBefore() {
    for (const item of this.options.items ?? []) {
      this.callParal('onOptionsItemBefore', item)
    }
  },
  onOptions(options) {
    options.formProps ??= {}
    options.model ??= {}
    options.items ??= []
    const formProps = defaultsDeep(options.formProps, this.config.formProps)
    const model = defaultsDeep(options.model, this.config.model)
    const submit = options.submit
    const submitItem = options.items.find(i => i.setter === 'submit')
    if (submit && !submitItem) {
      options.items.push({ field: '', setter: 'submit' })
    }
    const items = options.items.map(createAnFormItem.bind(this))
    this.setState({ items, model, formProps, submit })
    this.addChild(render.bind(this))
  },
  onOptionsItem(item) {
    if (item.field) {
      const model = (this.options.model ??= {})
      model[item.field] ??= item.value
    }
  },
  onOptionsAfter() {
    const model = this.state.model
    for (const item of this.state.items) {
      if (item.itemSlots) {
        item.itemSlots = mapSlots(item.itemSlots, item, model)
      }
      if (item.setterSlots) {
        item.setterSlots = mapSlots(item.setterSlots, item, model)
      }
      const visibled = computed(() => toBool(item.visible ?? true, item, model))
      const disabled = computed(() => toBool(item.disable ?? false, item, model))
      const rulesed = computed(() => item.rules?.filter((i: any) => toBool(i.disable ?? false, item, model)))
      Object.assign(item, { visibled, disabled, rulesed })
    }
    const itemsed = computed(() => this.state.items.filter(i => i.visibled))
    Object.assign(this.state, { itemsed })
  },
  onComponent(component) {
    component.name = this.options.name ?? this.config.name
    component.setup = this.setup.bind(this)
  },
  onSetup() {
    for (const item of this.state.items) {
      this.callParal('onSetupItem', item)
    }
  },
})
