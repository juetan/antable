# FormModal 表单弹窗

基于 useForm 的表单弹窗，同样以 hook 形式调用，提供额外功能和配置。

## 基础表单

通过 `useFormModal` 构建一个表单组件，在 useForm 的基础上，增加 trigger、modalProps 和 modalSlots 属性。其结果返回一个对象，该对象可以作为组件使用，默认包含一个触发弹窗的按钮。

:::demo modal/basis
:::

## 触发元素

通过 trigger 属性可以定义触发元素，默认为 true，可以接受 boolean | string | object | function 类型的参数。如需动态显示/隐藏，可使用渲染函数或指定 trigger.visible 属性。

:::demo modal/trigger
:::

## 参数透传

通过 modalProps 和 modalSlots 属性可以传递参数给原弹窗组件，除 visible 等部分参数外均可透传。

:::demo modal/modal
:::

## useFormModal

```ts
useFormModal(options: UseFormModalOptions | UseFormModalOptionsFn) => ModalReturn

// 函数
type UseFormModalOptionsFn = (modalRef: Ref<AnFormModalInstance | null>) => UseFormModalOptions

// 返回值类型
interface ModalReturn {
  // 组件名字
  name: string,
  // 表格实例
  modalRef: Ref<AnFormModalInstance | null>,
  // 刷新表格
  refresh: () => void,
  // 打开弹窗
  open: (data?: Record<string, any>) => void,
  // 渲染函数
  render: () => JSX.Element
}
```

## UseFormModalOptions

| 名称         | 类型                                                 | 说明                             | 默认值 | 始于 |
| ------------ | ---------------------------------------------------- | -------------------------------- | ------ | ---- |
| `items`      | `UseFormItem[]`                                      | 表单项，请查阅 useForm           |        | -    |
| `submit`     | `Sunbmit`                                            | 提交表单，请查阅 useForm         |        | -    |
| `formProps`  | `ArcoFormProps`                                      | 传递给表单的参数，请查阅 useForm | `{}`   | -    |
| `model`      | `Record<string, any>`                                | 表单数据，请查阅 useForm         |        | -    |
| `trigger`    | `boolean \| string \| AnButtonItem \| () => Element` | 触发按钮                         |        | -    |
| `modelProps` | `ArcoModalProps`                                     | 弹窗参数                         |        | -    |
| `modalSlots` | `ArcoModalSlots`                                     | 表格插槽                         |        | -    |
