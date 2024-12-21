import { Form as BaseForm, FormInstance, FormItem, FormItemInstance } from '@arco-design/web-vue'
import { defaultsDeep, pick, uniqueId } from 'lodash-es'
import { computed, MaybeRefOrGetter, VNodeChild } from 'vue'
import { mapSlots, MaybePromise, Recordable, toBool } from '../core'
import type { AnFormItem, UseFormItem } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  type BaseFormProps = Omit<FormInstance['$props'], 'model'>
  type BaseFormItemProps = FormItemInstance['$props'] & {}
  type BaseFormItemSlots = AnFormItemSlotMapping<'default' | 'icon' | 'help' | 'extra'>

  interface UseFormItemBase extends AnFormItemBase {
    /**
     * 传递给 FormItem 组件的额外 props
     * @by form
     * @see https://arco.design/vue/component/form#API
     */
    itemProps?: BaseFormItemProps
    /**
     * 传递给 FormItem 组件的额外 slots
     * @by form
     * @see https://arco.design/vue/component/form#API
     */
    itemSlots?: BaseFormItemSlots
    /**
     * 检验规则
     */
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
    /**
     * 字段名，支持 . 格式的嵌套属性，以及数组形式的属性
     * @by form
     * @example
     * ```ts
     * 'username'       // 普通属性
     * 'users.0.name'   // 嵌套属性
     * '[start,end]'    // 数组属性，提交表单时自动转为 { start, end }
     * ```
     */
    field: string
    /**
     * 默认值。model[field] = value 的便捷语法，优先级较低。
     * @by form
     * @example
     * ```ts
     * 'example'
     * ```
     */
    value?: unknown
    /**
     * 表单项标题
     * @by form
     * @example
     * ```ts
     * '用户名'
     * ```
     */
    label?: string
    /**
     * 输入提示
     * @by form
     * @example
     * ```ts
     * '请输入'
     * ```
     */
    placeholder?: string | string[]
    /**
     * 是否必填
     * @default
     * ```ts
     * false
     * ```
     */
    required?: boolean
    /**
     * 是否可见
     * @by form
     * @example
     * ```ts
     * true                            // 字面量
     * (arg) => Boolean(arg.model.id)  // getter
     * computed(() => true)            // computed
     * ```
     */
    visible?: MaybeRefOrGetter<boolean> | ((item: AnFormItem, model: Recordable) => boolean)
    /**
     * 是否禁用
     * @by form
     * @example
     * ```ts
     * true                            // 字面量
     * (arg) => Boolean(arg.model.id)  // getter
     * computed(() => true)            // computed
     * ```
     */
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
    /**
     * 表单项
     */
    item: AnFormItem
    /**
     * 表单数据
     */
    model: Recordable
  }
  type AnFormItemSlotMapping<T extends string> = {
    [K in T]?: (item: AnFormItem, model: Recordable) => VNodeChild
  }

  interface UseFormOptions {
    /**
     * 表单数据。默认从 items 的 field 和 value 字段收集，这里的值有更高优先级。
     * @by form
     * @example
     * ```ts
     * {
     *   id: undefined,
     *   username: undefined
     * }
     * ```
     */
    model?: Recordable
    /**
     * 表单项
     * @by form
     * @example
     * ```ts
     * {
     *   field: 'username',
     *   label: '用户名',
     *   setter: 'input',     // 输入控件，默认为 input
     *   setterProps: {},     // 传递给 setter 组件的额外 props
     *   setterSlots: {},     // 传递给 setter 组件的额外 slots
     *   itemProps: {},       // 传递给 form-item 组件的额外 props
     *   itemSlots: {}        // 传递给 form-item 组件的额外 slots
     * }
     * ```
     */
    items?: UseFormItem[]
    /**
     * 传递给 Form 组件的额外 props
     * @by form
     * @see https://arco.design/vue/component/form#API
     */
    formProps?: BaseFormProps
    /**
     * 提交表单，默认会提前校验表单项
     * @by form
     * @example
     * ```ts
     * submit(model, items)
     * ```
     */
    submit?: (model: Recordable, items: AnFormItem[]) => MaybePromise<void>
  }
  interface AnFormState {
    loading: boolean
    model: Recordable
    items: AnFormItem[]
    itemsed: AnFormItem[]
    formRef: FormInstance | null
    formProps: BaseFormProps
    submit: (params: Recordable, items: AnFormItem[]) => MaybePromise<void>
  }
  interface AnFormConfig {
    /**
     * 默认表单项参数，适用于全局设置。
     * @by form
     *
     */
    item: UseFormItem
    /**
     * 默认表单数据，适用于全局设置。
     * @by form
     */
    model: Recordable
    /**
     * 默认参数。适用于全局设置。
     * @by form
     */
    formProps: BaseFormProps
    /**
     * 提交前是否校验
     * @by form
     * @default
     * ```ts
     * true
     * ```
     */
    validateBeforeSubmit: boolean
    /**
     * 提交时是否 loading
     * @by form
     * @default
     * ```ts
     * true
     * ```
     */
    loadingOnSubmit: boolean
    /**
     * 当指定 submit 参数，是否自动在 items 末尾追加用于提交表单的 item。如果已有 setter: 'submit'，则不再追加。
     * @by form
     * @default
     * ```ts
     * true
     * ```
     */
    autoSubmitItem: boolean
  }
  interface AnForm {
    /**
     * 提交表单
     * @by form
     * @example
     * ```ts
     * submit()
     * ```
     */
    submit: () => Promise<void>
    /**
     * 获取 Form 组件实例
     * @by form
     * @example
     * ```ts
     * getFormRef()?.validate() // 调用源组件方法进行表单校验
     * ```
     */
    getFormRef: () => FormInstance | null
  }
  interface AnFormPlugin {
    onSetter?: (this: AnForm, item: UseFormItem) => void
    onOptionsItemBefore?: (this: AnForm, item: UseFormItem) => void
    onOptionsItem?: (this: AnForm, item: UseFormItem, target: AnFormItem) => AnFormItem | void
    onSetupItem?: (this: AnForm, item: AnFormItem) => void
    onSubmitBefore?: (this: AnForm, model: Recordable) => void
    onSubmit?: (
      submit: (params: Recordable, items: AnFormItem[]) => MaybePromise<void>,
      params: Recordable,
      items: AnFormItem[],
    ) => void
  }
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
  'itemSlots',
]

async function hasError(this: AnForm) {
  if (!this.config.validateBeforeSubmit) {
    return false
  }
  const errors = await this.state.formRef?.validate()
  return Boolean(errors)
}

AnForm.prototype.submit = async function () {
  if (await hasError.call(this)) {
    return
  }
  if (!this.state.submit) {
    return
  }
  if (this.config.loadingOnSubmit) {
    this.state.loading = true
  }
  const items = this.state.items
  const model = this.getModel()
  this.callParal('onSubmitBefore', model)
  this.callFirstAsync('onSubmit', this.state.submit, model, items)
  await this.state.submit(model, items)
  this.state.loading = false
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

function Form(this: AnForm) {
  return (
    <BaseForm {...this.state.formProps} model={this.state.model}>
      {this.state.itemsed.map(itemRender.bind(this))}
    </BaseForm>
  )
}

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
  this.options.items ??= []
  if (this.options.submit && this.config.autoSubmitItem) {
    const submitItem = this.options.items.find(i => i.setter === 'submit')
    if (!submitItem) {
      this.options.items.push({ field: '', setter: 'submit' })
    }
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
    this.setState({ model, items, formProps, submit, loading: false })
    this.addChild(Form.bind(this))
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
      if (item.rules) {
        // @ts-ignore
        item.itemProps.rules = computed(() => item.rules.filter(i => toBool(i.disable ?? false, item, model)))
      }
      if (item.placeholder) {
        item.setterProps ??= {}
        item.setterProps.placeholder = computed(() => {
          if (Array.isArray(item.placeholder)) {
            return item.placeholder.map(i => this.t(i))
          }
          return this.t(item.placeholder)
        })
      }
      item.visibled = computed(() => toBool(item.visible ?? true, item, model)) as any
      item.disabled = computed(() => toBool(item.disable ?? false, item, model)) as any
    }
    this.state.itemsed = computed(() => this.state.items.filter(i => i.visibled)) as any
  },
  onSetup() {
    const fn = (item: any) => this.callParal('onSetupItem', item)
    this.state.items.forEach(fn)
  },
})
